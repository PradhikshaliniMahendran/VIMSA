import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, RotateCw, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/slices/wishlistSlice.ts';
import { RootState } from '../store/index.ts';
import { productService } from '../services/productService.ts';
import { ProductType } from '../components/ui/ProductCard.tsx';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../hooks/useAuth.ts';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import Button from '../components/ui/Button.tsx';
import toast from 'react-hot-toast';
import { parseColor } from '../utils/colorHelper.ts';
import { useStoreSettings } from '../hooks/useStoreSettings.ts';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { addItem, formatPrice } = useCart();
  const { cleanWhatsappNumber } = useStoreSettings();
  const wishlistIds = useSelector((state: RootState) => state.wishlist.productIds);

  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Modals and tabs toggling
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'returns'>('desc');
  const [aiStatus, setAiStatus] = useState<string>('none');
  const [aiError, setAiError] = useState<string | null>(null);

  // Customer reviews states
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await productService.getProductBySlug(slug);
        if (response.success && response.data?.product) {
          const prod = response.data.product;
          setProduct(prod);
          setSelectedColor(prod.colors?.[0] || '');
          const initialSizeObj = prod.sizes?.[0];
          setSelectedSize(initialSizeObj ? (typeof initialSizeObj === 'string' ? initialSizeObj : initialSizeObj.name) : '');
          setActiveImageIndex(0);
          setQuantity(1);
          setAiStatus(prod.aiGenerationStatus || 'none');
          setAiError(prod.aiGenerationError || null);

          // Fetch related items in same category AND same product type
          const relatedRes = await productService.getProducts({
            category: prod.category?._id || prod.category,
            productType: prod.productType || 'clothing',
            limit: 4,
          });
          if (relatedRes.success && relatedRes.data?.products) {
            setRelated(relatedRes.data.products.filter((p: any) => p._id !== prod._id));
          }
        } else {
          toast.error('Product details not found');
          navigate('/shop');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug, navigate]);

  // Polling logic to query AI Virtual Try-On progress
  useEffect(() => {
    if (aiStatus !== 'pending' || !product?._id) return;

    const intervalId = setInterval(async () => {
      try {
        const api = (await import('../services/api.ts')).default;
        const response = await api.get(`/products/${product._id}/ai-status`);
        if (response.data?.success) {
          const { status, product: updatedProd, error } = response.data;
          setAiStatus(status);
          if (error) setAiError(error);

          if (status === 'completed' && updatedProd) {
            setProduct(prev => prev ? { 
              ...prev, 
              images: updatedProd.images, 
              gallery: updatedProd.gallery, 
              aiGenerationStatus: status 
            } : null);
            toast.success('AI Model Lookbooks generated successfully! 🎉');
            clearInterval(intervalId);
          } else if (status === 'failed') {
            setProduct(prev => prev ? { 
              ...prev, 
              aiGenerationStatus: status, 
              aiGenerationError: error 
            } : null);
            toast.error(error || 'AI Virtual Try-On generation failed.');
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('Failed to check AI status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [aiStatus, product?._id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      setReviewsLoading(true);
      try {
        const api = (await import('../services/api.ts')).default;
        const res = await api.get(`/reviews/${product._id}`);
        if (res.data?.success) {
          setReviews(res.data.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product?._id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const api = (await import('../services/api.ts')).default;
      
      let uploadedImageUrls: string[] = [];
      if (reviewImages.length > 0) {
        const formData = new FormData();
        reviewImages.forEach(file => formData.append('images', file));
        const uploadRes = await api.post('/upload/user-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data?.success && uploadRes.data?.data) {
          uploadedImageUrls = uploadRes.data.data.map((item: any) => item.url);
        }
      }

      const response = await api.post('/reviews', {
        productId: product._id,
        rating: newRating,
        comment: newComment,
        images: uploadedImageUrls
      });
      if (response.data.success) {
        toast.success('Thank you! Your review has been submitted successfully.');
        setNewComment('');
        setNewRating(5);
        setReviewImages([]);
        // Refresh reviews list
        const res = await api.get(`/reviews/${product._id}`);
        if (res.data?.success) {
          setReviews(res.data.data.reviews || []);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlistIds.includes(product._id);

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product._id));
    if (isWishlisted) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const currentSizeObj: any = product.sizes?.find((s: any) => (typeof s === 'string' ? s : s.name) === selectedSize);
  const displayPrice = (currentSizeObj && typeof currentSizeObj !== 'string' && currentSizeObj.price) 
    ? currentSizeObj.price 
    : product.price;
  const displaySalePrice = (currentSizeObj && typeof currentSizeObj !== 'string' && currentSizeObj.price) 
    ? currentSizeObj.price 
    : product.salePrice;
  const currentStock = product.status === 'out_of_stock' ? 0 :
    (currentSizeObj && typeof currentSizeObj !== 'string' && currentSizeObj.stock !== undefined) 
    ? currentSizeObj.stock 
    : product.stockQuantity;

  const handleAddToCart = () => {
    // Allow adding out-of-stock items for later use

    addItem({
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: displayPrice,
      salePrice: displaySalePrice,
      image: product.images[0] || '',
      quantity,
      size: selectedSize,
      color: selectedColor,
      stockQuantity: currentStock,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const allImages = product ? [...(product.images || []), ...(product.gallery || [])] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="product-detail-page">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-outfit uppercase font-semibold text-text-secondary dark:text-neutral-500 mb-8 select-none">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-accent">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text-primary dark:text-white truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row-reverse gap-4">
            {/* Main Visual Display */}
            <div className="flex-grow aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 border border-gray-100 dark:border-dark-border relative zoom-container overflow-hidden">
              {aiStatus === 'pending' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-20 text-center space-y-3 select-none">
                  <div className="w-10 h-10 rounded-full border-2 border-t-accent border-r-neutral-800 border-b-neutral-800 border-l-neutral-800 animate-spin" />
                  <h4 className="text-[10px] font-black text-accent uppercase tracking-widest font-outfit">
                    AI Lookbook Studio
                  </h4>
                  <p className="text-[9px] text-white max-w-[200px] leading-relaxed">
                    Draping garment onto professional models. Fading in shortly...
                  </p>
                </div>
              )}

              {allImages[activeImageIndex] ? (
                <img
                  src={allImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover zoom-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                  <span className="text-xs text-white/50 uppercase tracking-widest">VIMSA Luxury</span>
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3.5 justify-start overflow-x-auto md:overflow-x-visible">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-20 md:w-20 md:h-24 bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIndex === i ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configurations Column */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-6">
            <span className="font-outfit uppercase tracking-widest text-[10px] text-accent font-extrabold block mb-1">
              SKU: {product.sku}
            </span>
            <h1 className="text-2xl md:text-3xl font-outfit uppercase font-extrabold tracking-wider text-text-primary dark:text-white mb-2 leading-[1.2]">
              {product.name}
            </h1>
            
            {/* Review and Stars */}
            <div className="flex items-center space-x-1.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
              ))}
              <span className="text-xs text-text-secondary dark:text-neutral-400 font-semibold font-outfit uppercase tracking-wide">
                (5.0 Rating / Verified Drops)
              </span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="mb-6 flex items-baseline space-x-3">
            {displaySalePrice ? (
              <>
                <span className="text-2xl font-outfit font-extrabold text-error">
                  {formatPrice(displaySalePrice)}
                </span>
                <span className="text-sm text-text-secondary dark:text-gray-500 line-through">
                  {formatPrice(displayPrice)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-outfit font-extrabold text-text-primary dark:text-white">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <span className="font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest block mb-2.5">
                Select Color: {parseColor(selectedColor).name}
              </span>
              <div className="flex items-center space-x-3">
                {product.colors.map((color) => {
                  const { name, hex } = parseColor(color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        if (product.colorImages && product.colorImages[name]) {
                          const targetImgUrl = product.colorImages[name];
                          const idx = allImages.findIndex(img => img === targetImgUrl);
                          if (idx !== -1) setActiveImageIndex(idx);
                        }
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-7 h-7 rounded-full border transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-accent scale-110 shadow'
                          : 'border-gray-300 dark:border-neutral-700'
                      }`}
                      title={name}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizing/Options buttons */}
          {product.sizes && product.sizes.length > 0 && (() => {
            const isClothingSize = product.sizes.every((s: any) => {
              const name = typeof s === 'string' ? s : s.name;
              return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].includes(name);
            });

            return (
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="font-outfit uppercase text-[10px] text-text-secondary dark:text-gray-400 font-bold tracking-widest">
                    {isClothingSize ? 'Select Size:' : 'Select Option:'}
                  </span>
                  {isClothingSize && (
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="font-outfit uppercase text-[10px] text-accent tracking-widest font-extrabold hover:text-white transition-colors"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeData: any) => {
                    const sizeName = typeof sizeData === 'string' ? sizeData : sizeData.name;
                    const stock = product.status === 'out_of_stock' ? 0 : (typeof sizeData === 'string' ? product.stockQuantity : (sizeData.stock ?? product.stockQuantity));
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <button
                        key={sizeName}
                        disabled={false}
                        onClick={() => setSelectedSize(sizeName)}
                        className={`min-w-10 h-10 px-2 border text-xs font-outfit uppercase transition-all flex items-center justify-center relative overflow-hidden ${
                          selectedSize === sizeName
                            ? 'bg-black border-black text-white dark:bg-white dark:text-black dark:border-white font-bold'
                            : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-200 hover:border-black dark:hover:border-white font-semibold'
                        } ${isOutOfStock ? 'opacity-50' : ''}`}
                      >
                        {sizeName}
                        {isOutOfStock && <span className="absolute inset-0 bg-gray-200/50 dark:bg-dark-border/50"></span>}
                        {isOutOfStock && <div className="absolute w-full h-[1px] bg-gray-400 rotate-45 transform origin-center"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Quantity and Actions Block */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-text-secondary dark:text-neutral-400">
              {currentStock <= 0 ? (
                <span className="text-red-500">Out of Stock</span>
              ) : currentStock <= 5 ? (
                <span className="text-orange-500 font-bold animate-pulse">
                  🔥 Only {currentStock} {currentStock === 1 ? 'item' : 'items'} left — order soon!
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {currentStock} {currentStock === 1 ? 'item' : 'items'} in stock
                </span>
              )}
            </span>
          </div>
          {/* Action Row 1: Quantity + Add to Cart + Wishlist */}
          <div className="flex items-center gap-3 mb-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-3 w-28 flex-shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-text-primary dark:text-white text-base font-bold px-1 hover:text-accent"
              >
                -
              </button>
              <span className="font-outfit font-extrabold text-sm text-text-primary dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (currentStock > 0 && quantity >= currentStock) {
                    toast.error(`Only ${currentStock} ${currentStock === 1 ? 'item is' : 'items are'} currently available.`);
                    return;
                  }
                  setQuantity((q) => q + 1);
                }}
                className="text-text-primary dark:text-white text-base font-bold px-1 hover:text-accent"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              className="flex-grow flex items-center justify-center space-x-2 py-3.5 text-xs font-outfit uppercase tracking-widest font-extrabold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{currentStock <= 0 ? 'Save for Later' : 'Add to Cart'}</span>
            </Button>

            {/* Heart wishlist toggle */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="w-12 h-12 border border-gray-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-accent text-accent' : 'text-text-primary dark:text-white'}`} />
            </button>
          </div>

          {/* Action Row 2: Buy It Now */}
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleBuyNow}
            disabled={currentStock <= 0}
            className="mb-3 font-outfit uppercase tracking-widest font-extrabold text-xs py-3.5"
          >
            Buy It Now
          </Button>

          {/* Action Row 3: Buy via WhatsApp Direct Action */}
          <a
            href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(`Hello VIMSA,\n\nI would like to place an order for:\n\nProduct: ${product.name}\n${selectedSize ? `Size: ${selectedSize}\n` : ''}${selectedColor ? `Color: ${selectedColor}\n` : ''}Quantity: ${quantity}\nPrice: Rs. ${(displaySalePrice || displayPrice).toLocaleString()}\nTotal: Rs. ${((displaySalePrice || displayPrice) * quantity).toLocaleString()}\n\nPlease confirm availability.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 mb-6 border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-white font-outfit font-extrabold uppercase tracking-widest text-xs transition-all duration-300 rounded"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.004 2C6.479 2 2 6.478 2 12.004c0 1.867.487 3.611 1.338 5.122L2 22l4.961-1.305A9.948 9.948 0 0012.004 22C17.525 22 22 17.522 22 12.004 22 6.478 17.525 2 12.004 2zm0 18.178a8.163 8.163 0 01-4.175-1.148l-.299-.178-3.089.812.822-3.01-.195-.308A8.19 8.19 0 013.822 12c0-4.512 3.67-8.178 8.182-8.178 4.508 0 8.178 3.666 8.178 8.178s-3.67 8.178-8.178 8.178z"/>
            </svg>
            Buy via WhatsApp
          </a>

          {/* Accordion detail tabs */}
          <div className="border-t border-gray-100 dark:border-dark-border pt-6">
            <div className="flex border-b border-gray-100 dark:border-dark-border mb-4 font-outfit uppercase text-[10px] font-bold tracking-widest">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2 pr-6 border-b-2 transition-all ${
                  activeTab === 'desc' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 px-6 border-b-2 transition-all ${
                  activeTab === 'specs' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('returns')}
                className={`pb-2 pl-6 border-b-2 transition-all ${
                  activeTab === 'returns' ? 'border-accent text-accent' : 'border-transparent text-text-secondary dark:text-gray-400'
                }`}
              >
                Returns & Claims
              </button>
            </div>

            <div className="text-xs text-text-secondary dark:text-gray-400 font-inter leading-relaxed py-2">
              {activeTab === 'desc' && <p>{product.description}</p>}
              {activeTab === 'specs' && (
                <ul className="space-y-2 list-disc list-inside">
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec, idx) => (
                      <li key={idx}><strong>{spec.key}:</strong> {spec.value}</li>
                    ))
                  ) : (
                    <>
                      <li>Material: Premium Grade Fabric</li>
                      <li>Construction: High-quality stitching</li>
                      <li>Fit: Tailored to perfection</li>
                    </>
                  )}
                </ul>
              )}
              {activeTab === 'returns' && (
                <p>
                  VIMSA offers a 7-day return policy for unused, tagged clothing items. If there is a sizing issue or transit damage, open a claims report inside the customer account dashboard.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products row */}
      {related.length > 0 && (
        <div className="mt-24 border-t border-gray-100 dark:border-dark-border pt-16">
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold text-center mb-12">
            Related Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((prod) => (
              <div key={prod._id} className="scale-95 hover:scale-100 transition-all duration-300">
                <Link to={`/shop/${prod.slug}`}>
                  <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 border border-gray-100 dark:border-dark-border mb-3 overflow-hidden">
                    <img src={prod.images?.[0]} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-outfit uppercase font-semibold text-xs tracking-wide text-center text-text-primary dark:text-white line-clamp-1">{prod.name}</h3>
                  <p className="font-outfit font-bold text-xs text-accent text-center mt-1">{formatPrice(prod.price)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews and Ratings Section */}
      <div className="mt-24 border-t border-gray-100 dark:border-dark-border pt-16 max-w-4xl mx-auto space-y-12 select-none">
        <div className="text-center">
          <h2 className="font-outfit uppercase tracking-widest text-lg font-bold">
            Customer Reviews
          </h2>
          <p className="text-[10px] text-text-secondary dark:text-neutral-500 uppercase tracking-wider font-semibold mt-1">
            Genuine ratings and verified purchase reviews
          </p>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="sm" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-8 bg-neutral-50 dark:bg-dark-surface/30 border border-dashed border-gray-200 dark:border-dark-border">
              <p className="text-xs text-text-secondary dark:text-neutral-400 font-medium">No reviews yet for this apparel. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {reviews.map((rev) => (
                <div key={rev._id} className="py-6 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-outfit font-bold text-xs uppercase text-text-primary dark:text-white">
                      {rev.user?.firstName || 'VIMSA'} {rev.user?.lastName || 'Client'}
                    </span>
                    <span className="text-[9px] font-semibold text-text-secondary dark:text-neutral-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Rating stars */}
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? 'fill-accent text-accent' : 'text-gray-200 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {rev.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="Review attachment" className="w-16 h-16 object-cover border border-gray-200 dark:border-dark-border rounded-sm" />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-secondary dark:text-neutral-300 normal-case font-inter leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Review Form */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 rounded-sm">
          <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent mb-4">
            Write a Review
          </h3>
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Selector */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] text-text-secondary dark:text-neutral-400 uppercase font-bold tracking-wider">
                  Rating:
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setNewRating(starVal)}
                      className="text-accent hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= newRating ? 'fill-accent text-accent' : 'text-gray-300 dark:text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] text-text-secondary dark:text-neutral-400 uppercase font-bold tracking-wider">
                  Comment:
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={product.sizes && product.sizes.length > 0 && product.sizes.some((s: any) => !['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].includes(typeof s === 'string' ? s : s.name))
                    ? "Share your thoughts about this product's quality, features, and value..."
                    : "Share your thoughts about this product's quality, size, and fit..."}
                  className="bg-transparent border border-gray-300 dark:border-dark-border text-xs px-3 py-2 outline-none font-inter text-text-primary dark:text-white"
                  rows={4}
                  required
                />
              </div>

              {/* File Input */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] text-text-secondary dark:text-neutral-400 uppercase font-bold tracking-wider">
                  Add Photo (Optional):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setReviewImages(Array.from(e.target.files).slice(0, 3));
                    }
                  }}
                  className="text-xs text-text-secondary"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" isLoading={submittingReview}>
                Submit Review
              </Button>
            </form>
          ) : (
            <div className="text-center p-4 bg-accent/10 border border-accent/20 text-accent">
              <p className="text-xs font-medium">Please <Link to="/login" className="font-bold underline hover:text-white">login</Link> to write a customer review for this clothing item.</p>
            </div>
          )}
        </div>
      </div>


      {/* Size Guide Modal overlay */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-surface p-6 border border-gray-100 dark:border-dark-border shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-outfit uppercase tracking-widest font-bold text-sm text-accent">VIMSA Sizing Guide</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-text-primary dark:text-white">Close</button>
            </div>
            
            {/* Guide Grid */}
            <table className="w-full text-left text-xs font-outfit uppercase tracking-wider text-text-primary dark:text-white">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="py-2.5">Size</th>
                  <th>Chest (in)</th>
                  <th>Length (in)</th>
                  <th>Sleeve (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border font-semibold">
                <tr><td className="py-2.5">XS</td><td>38</td><td>25</td><td>8.0</td></tr>
                <tr><td className="py-2.5">S</td><td>40</td><td>26</td><td>8.5</td></tr>
                <tr><td className="py-2.5">M</td><td>42</td><td>27</td><td>9.0</td></tr>
                <tr><td className="py-2.5">L</td><td>44</td><td>28</td><td>9.5</td></tr>
                <tr><td className="py-2.5">XL</td><td>46</td><td>29</td><td>10.0</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
