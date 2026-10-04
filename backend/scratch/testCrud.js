import axios from 'axios';

const API_URL = 'http://localhost:5006/api/v1';

async function runCrudVerification() {
  console.log('--- 🧪 STARTING VIMSA FULL CRUD VERIFICATION ---');
  let token = '';

  try {
    // 1. ADMIN AUTHENTICATION
    console.log('\n1. Testing Admin Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@vimsa.com',
      password: 'Password123!',
    });
    token = loginRes.data.data.accessToken;
    console.log('✅ Admin Login Successful! Token acquired.');

    const adminAuthHeader = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch existing categories
    const categoriesRes = await axios.get(`${API_URL}/admin/categories`, adminAuthHeader);
    const categories = categoriesRes.data.data.categories || categoriesRes.data.data || [];
    const dressCatId = categories.find((c) => c.slug === 'dresses')?._id || categories[0]?._id;
    const plasticCatId = categories.find((c) => c.slug === 'storage-containers')?._id || categories[0]?._id;

    // 2. CREATE PRODUCT (DRESS)
    console.log('\n2. Testing CREATE Product (Dress)...');
    const dressData = {
      name: 'Test Automation Silk Evening Dress',
      description: 'Test evening dress created by automated test runner.',
      price: 12500,
      salePrice: 9900,
      stockQuantity: 15,
      productType: 'DRESS',
      category: dressCatId,
      sku: `TEST-DRS-${Date.now()}`,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000'],
      sizes: [{ name: 'S', stock: 5 }, { name: 'M', stock: 10 }],
      colors: ['Gold:#D4AF37'],
    };

    const createDressRes = await axios.post(`${API_URL}/products`, dressData, adminAuthHeader);
    const createdDress = createDressRes.data.data.product;
    console.log(`✅ Created Dress Product ID: ${createdDress._id} (SKU: ${createdDress.sku})`);

    // 3. CREATE PRODUCT (PLASTIC)
    console.log('\n3. Testing CREATE Product (Plastic Item)...');
    const plasticData = {
      name: 'Test Automation Airtight Storage Jar',
      description: 'Test plastic storage jar created by automated test runner.',
      price: 1850,
      stockQuantity: 40,
      productType: 'PLASTIC',
      category: plasticCatId,
      sku: `TEST-PLS-${Date.now()}`,
      images: ['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1000'],
    };

    const createPlasticRes = await axios.post(`${API_URL}/products`, plasticData, adminAuthHeader);
    const createdPlastic = createPlasticRes.data.data.product;
    console.log(`✅ Created Plastic Product ID: ${createdPlastic._id} (SKU: ${createdPlastic.sku})`);

    // 4. READ PRODUCTS
    console.log('\n4. Testing READ Products (Public & Division Filtering)...');
    const allRes = await axios.get(`${API_URL}/products`);
    console.log(`✅ READ All Products Count: ${allRes.data.data.total}`);

    const dressesRes = await axios.get(`${API_URL}/products?productType=DRESS`);
    console.log(`✅ READ Dresses Count: ${dressesRes.data.data.total}`);

    const plasticRes = await axios.get(`${API_URL}/products?productType=PLASTIC`);
    console.log(`✅ READ Plastic Items Count: ${plasticRes.data.data.total}`);

    const singleRes = await axios.get(`${API_URL}/products/${createdDress.slug}`);
    console.log(`✅ READ Single Product by Slug: ${singleRes.data.data.product.name}`);

    // 5. UPDATE PRODUCT
    console.log('\n5. Testing UPDATE Product...');
    const updateRes = await axios.put(
      `${API_URL}/products/${createdDress._id}`,
      {
        name: 'Test Automation Silk Evening Dress (UPDATED)',
        price: 13500,
        stockQuantity: 20,
      },
      adminAuthHeader
    );
    console.log(`✅ UPDATED Product Name: "${updateRes.data.data.product.name}" (Price: ${updateRes.data.data.product.price})`);

    // 6. DELETE / ARCHIVE PRODUCT
    console.log('\n6. Testing DELETE / ARCHIVE Product...');
    const deleteRes = await axios.delete(`${API_URL}/products/${createdPlastic._id}`, adminAuthHeader);
    console.log(`✅ DELETED Product Result: ${deleteRes.data.message}`);

    // 7. READ & UPDATE STORE SETTINGS
    console.log('\n7. Testing STORE SETTINGS Read & Update...');
    const getSettingsRes = await axios.get(`${API_URL}/settings`);
    console.log(`✅ GET Settings: Store=${getSettingsRes.data.data.storeName}, WhatsApp=${getSettingsRes.data.data.whatsappNumber}`);

    const updateSettingsRes = await axios.put(
      `${API_URL}/settings`,
      {
        storeName: 'VIMSA Luxury',
        whatsappNumber: '+94771234567',
        contactNumber: '+94771234567',
      },
      adminAuthHeader
    );
    console.log(`✅ UPDATE Settings: Store=${updateSettingsRes.data.data.storeName}, WhatsApp=${updateSettingsRes.data.data.whatsappNumber}`);

    console.log('\n🎉 ALL CRUD OPERATIONS PASSED 100% SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ CRUD VERIFICATION FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runCrudVerification();
