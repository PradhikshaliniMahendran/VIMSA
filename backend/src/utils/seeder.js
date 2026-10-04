import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User } from '../models/UserSchema.js';
import { Product, Category, Brand, Collection } from '../models/ProductSchema.js';
import { Settings } from '../models/SettingsSchema.js';
import { Promotion } from '../models/MarketingSchema.js';

// Force DNS resolution using Google Public DNS resolvers to bypass local network DNS failures
dns.setServers(['8.8.8.8', '8.8.4.4']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname.includes('mongodb.net')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        originalLookup(hostname, options, callback);
      } else {
        const address = addresses[0];
        const family = 4;
        if (options.all) {
          callback(null, [{ address, family }]);
        } else {
          callback(null, address, family);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

dotenv.config();

const categoriesData = [
  { name: 'Dresses', slug: 'dresses', description: 'Luxury dresses, evening gowns, and tropical midi dresses' },
  { name: 'Tops & Blouses', slug: 'tops-blouses', description: 'Elegant silk blouses, crop tops, and tailored shirts' },
  { name: 'Oversized Tees', slug: 'oversized-tees', description: 'Premium heavyweight cotton streetwear tees' },
  { name: 'Skirts & Bottoms', slug: 'skirts-bottoms', description: 'Pleated skirts, tailored trousers, and utility pants' },
  { name: 'Storage & Containers', slug: 'storage-containers', description: 'High grade BPA-free airtight plastic storage sets' },
  { name: 'Household Organizers', slug: 'household-organizers', description: 'Multi-utility plastic organizers, racks, and baskets' }
];

const brandsData = [
  { name: 'VIMSA Elegance', slug: 'vimsa-elegance', description: 'Signature premium fashion range' },
  { name: 'VIMSA Plastics', slug: 'vimsa-plastics', description: 'Durable everyday household essentials' }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vimsa';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Collection.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});

    console.log('Seeding store settings...');
    await Settings.create({
      storeName: 'VIMSA',
      whatsappNumber: '+94771234567',
      contactNumber: '+94 77 123 4567',
      email: 'info@vimsa.lk',
      address: 'Bogawanthalawa, Sri Lanka',
      facebookUrl: 'https://facebook.com/vimsa',
      instagramUrl: 'https://instagram.com/vimsa',
      whatsappUrl: 'https://wa.me/94771234567',
      shippingFee: 350,
      freeShippingThreshold: 15000
    });
    
    console.log('Seeding categories...');
    const categories = await Category.insertMany(categoriesData);
    
    console.log('Seeding brands...');
    const brands = await Brand.insertMany(brandsData);

    console.log('Resetting Superadmin user...');
    const adminEmail = 'admin@vimsa.com';
    await User.deleteOne({ email: adminEmail });
    const superadmin = new User({
      firstName: 'VIMSA',
      lastName: 'Admin',
      email: adminEmail,
      mobileNumber: '+94771234567',
      password: 'Password123!',
      role: 'superadmin',
      isVerified: true
    });
    await superadmin.save();
    console.log('Superadmin created/reset (admin@vimsa.com / Password123!)');

    console.log('Seeding products...');
    const catDresses = categories.find(c => c.slug === 'dresses')._id;
    const catTops = categories.find(c => c.slug === 'tops-blouses')._id;
    const catTees = categories.find(c => c.slug === 'oversized-tees')._id;
    const catSkirts = categories.find(c => c.slug === 'skirts-bottoms')._id;
    const catContainers = categories.find(c => c.slug === 'storage-containers')._id;
    const catOrganizers = categories.find(c => c.slug === 'household-organizers')._id;

    const brandElegance = brands.find(b => b.slug === 'vimsa-elegance')._id;
    const brandPlastics = brands.find(b => b.slug === 'vimsa-plastics')._id;

    const mockProducts = [
      // DIVISION A: DRESSES / CLOTHING
      {
        name: 'VIMSA Floral Satin Midi Dress',
        sku: 'VIM-DRS-001',
        slug: 'vimsa-floral-satin-midi-dress',
        productType: 'DRESS',
        description: 'An exquisitely draped floral satin midi dress with cowl neckline and subtle side slit. Perfect for evening occasions and sunlit garden gatherings.',
        shortDescription: 'Floral satin midi dress with cowl neck.',
        category: catDresses,
        brand: brandElegance,
        tags: ['dress', 'satin', 'midi', 'featured'],
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000'],
        price: 8500,
        salePrice: 6900,
        discountPercentage: 18,
        stockQuantity: 25,
        material: '100% Premium Satin Silk',
        colors: ['#D4AF37', '#000000', '#FFB6C1'],
        sizes: [{ name: 'S', stock: 10 }, { name: 'M', stock: 10 }, { name: 'L', stock: 10 }, { name: 'XL', stock: 5 }],
        isFeatured: true,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: true,
        status: 'active'
      },
      {
        name: 'VIMSA Summer Breeze Linen Dress',
        sku: 'VIM-DRS-002',
        slug: 'vimsa-summer-breeze-linen-dress',
        productType: 'DRESS',
        description: 'Crafted from 100% natural European flax linen. Features breathable sleeveless design, tiered skirt layer, and gold accent belt buttons.',
        shortDescription: 'Pure European flax linen summer dress.',
        category: catDresses,
        brand: brandElegance,
        tags: ['dress', 'linen', 'summer', 'new arrival'],
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000'],
        price: 9200,
        salePrice: null,
        stockQuantity: 18,
        material: '100% Organic Linen',
        colors: ['#FFFFFF', '#87CEEB', '#F5F5DC'],
        sizes: [{ name: 'S', stock: 6 }, { name: 'M', stock: 6 }, { name: 'L', stock: 6 }],
        isFeatured: true,
        isTrending: true,
        isBestSeller: false,
        isNewArrival: true,
        status: 'active'
      },
      {
        name: 'VIMSA Signature Silk Blouse',
        sku: 'VIM-TOP-003',
        slug: 'vimsa-signature-silk-blouse',
        productType: 'DRESS',
        description: 'Luxury mulberry silk top with high neck band collar, buttoned French cuffs, and tailored relaxed fit.',
        shortDescription: 'Mulberry silk tailored blouse.',
        category: catTops,
        brand: brandElegance,
        tags: ['top', 'silk', 'blouse'],
        images: ['https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1000'],
        price: 6500,
        salePrice: 5800,
        discountPercentage: 10,
        stockQuantity: 30,
        material: 'Mulberry Silk Blend',
        colors: ['#FFFFFF', '#000000', '#E6E6FA'],
        sizes: [{ name: 'XS', stock: 5 }, { name: 'S', stock: 10 }, { name: 'M', stock: 10 }, { name: 'L', stock: 5 }],
        isFeatured: false,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: false,
        status: 'active'
      },
      {
        name: 'VIMSA Classic Cotton Oversized Tee',
        sku: 'VIM-TSH-004',
        slug: 'vimsa-classic-cotton-oversized-tee',
        productType: 'DRESS',
        description: '240GSM heavyweight cotton boxy streetwear tee with high mock neck and gold embroidered VIMSA emblem at the back yoke.',
        shortDescription: 'Heavyweight 240GSM boxy streetwear tee.',
        category: catTees,
        brand: brandElegance,
        tags: ['tshirt', 'oversized', 'streetwear'],
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000'],
        price: 4500,
        salePrice: null,
        stockQuantity: 50,
        material: '100% Combed Cotton',
        colors: ['#000000', '#FFFFFF', '#708090'],
        sizes: [{ name: 'S', stock: 10 }, { name: 'M', stock: 15 }, { name: 'L', stock: 15 }, { name: 'XL', stock: 10 }],
        isFeatured: false,
        isTrending: false,
        isBestSeller: true,
        isNewArrival: true,
        status: 'active'
      },
      {
        name: 'VIMSA Pleated A-Line Midi Skirt',
        sku: 'VIM-SKT-005',
        slug: 'vimsa-pleated-a-line-midi-skirt',
        productType: 'DRESS',
        description: 'High-waisted metallic pleat midi skirt with comfortable elastic waistline and dynamic flow.',
        shortDescription: 'High-waisted pleated A-line midi skirt.',
        category: catSkirts,
        brand: brandElegance,
        tags: ['skirt', 'pleated', 'fashion'],
        images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0afe1?q=80&w=1000'],
        price: 5900,
        salePrice: null,
        stockQuantity: 20,
        material: 'Polyester Blend Satin',
        colors: ['#D4AF37', '#000000'],
        sizes: [{ name: 'S', stock: 5 }, { name: 'M', stock: 10 }, { name: 'L', stock: 5 }],
        isFeatured: true,
        isTrending: false,
        isBestSeller: false,
        isNewArrival: true,
        status: 'active'
      },

      // DIVISION B: PLASTIC ITEMS
      {
        name: 'VIMSA 4-Piece Airtight Food Container Set',
        sku: 'VIM-PLS-001',
        slug: 'vimsa-4-piece-airtight-food-container-set',
        productType: 'PLASTIC',
        description: 'Heavy-duty food-grade BPA-free plastic storage containers with silicone airtight seal locks. Microwave, freezer, and dishwasher safe.',
        shortDescription: 'BPA-free airtight storage container set.',
        category: catContainers,
        brand: brandPlastics,
        tags: ['container', 'kitchen', 'plastic', 'featured'],
        images: ['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1000'],
        price: 2450,
        salePrice: 1950,
        discountPercentage: 20,
        stockQuantity: 60,
        material: 'Food-Grade BPA-Free Polypropylene',
        colors: ['Clear/Teal', 'Clear/Grey'],
        isFeatured: true,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: true,
        status: 'active'
      },
      {
        name: 'VIMSA Multi-Tier Kitchen Counter Organizer',
        sku: 'VIM-PLS-002',
        slug: 'vimsa-multi-tier-kitchen-counter-organizer',
        productType: 'PLASTIC',
        description: 'Durable multi-level plastic shelf rack designed for spices, condiments, and bathroom accessories. Easy snap-together assembly.',
        shortDescription: 'Multi-level modular plastic storage shelf.',
        category: catOrganizers,
        brand: brandPlastics,
        tags: ['organizer', 'rack', 'plastic'],
        images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000'],
        price: 3200,
        salePrice: null,
        stockQuantity: 40,
        material: 'Reinforced ABS Plastic',
        colors: ['Nordic White', 'Pastel Slate'],
        isFeatured: true,
        isTrending: true,
        isBestSeller: false,
        isNewArrival: true,
        status: 'active'
      },
      {
        name: 'VIMSA Woven Laundry Basket with Handles',
        sku: 'VIM-PLS-003',
        slug: 'vimsa-woven-laundry-basket-with-handles',
        productType: 'PLASTIC',
        description: 'Heavy duty ventilated plastic laundry hamper with ergonomic side handles. Modern faux-rattan design.',
        shortDescription: 'Ventilated woven laundry hamper 45L.',
        category: catOrganizers,
        brand: brandPlastics,
        tags: ['laundry', 'basket', 'plastic'],
        images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000'],
        price: 2900,
        salePrice: 2500,
        discountPercentage: 13,
        stockQuantity: 35,
        material: 'High Density Polyethylene',
        colors: ['Warm Beige', 'Charcoal Grey'],
        isFeatured: false,
        isTrending: false,
        isBestSeller: true,
        isNewArrival: false,
        status: 'active'
      },
      {
        name: 'VIMSA Stackable Shoe & Closet Storage Boxes (Pack of 3)',
        sku: 'VIM-PLS-004',
        slug: 'vimsa-stackable-shoe-storage-boxes-3pack',
        productType: 'PLASTIC',
        description: 'Clear drop-front plastic storage boxes for footwear and closet organization. Ventilation slits prevent moisture accumulation.',
        shortDescription: 'Clear stackable closet storage boxes (3 units).',
        category: catContainers,
        brand: brandPlastics,
        tags: ['storage', 'closet', 'boxes'],
        images: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1000'],
        price: 4100,
        salePrice: 3600,
        discountPercentage: 12,
        stockQuantity: 45,
        material: 'Clear Polypropylene',
        colors: ['Transparent Black', 'Transparent Crystal'],
        isFeatured: true,
        isTrending: true,
        isBestSeller: true,
        isNewArrival: true,
        status: 'active'
      }
    ];

    await Product.insertMany(mockProducts);
    console.log('Seeded 9 VIMSA products (Dresses & Plastic items).');

    // Seed initial active featured promotion
    await Promotion.deleteMany({});
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await Promotion.create({
      title: 'VIMSA Special Offer',
      description: 'Enjoy exclusive discounts up to 20% OFF across selected fashion dresses & home essentials.',
      discountText: 'UP TO 20% OFF',
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
      ctaText: 'Shop Collection',
      ctaLink: '/shop?type=DRESS',
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Started yesterday
      endDate: thirtyDaysFromNow,
      status: 'active',
      isFeatured: true
    });
    console.log('Seeded active featured promotional offer.');

    console.log('Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
