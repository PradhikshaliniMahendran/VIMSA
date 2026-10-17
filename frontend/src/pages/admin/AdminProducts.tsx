import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash, Edit, Search, PackageCheck, PackageX, AlertTriangle, X, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { productService } from '../../services/productService.ts';
import { ProductType } from '../../components/ui/ProductCard.tsx';
import { useCart } from '../../hooks/useCart.ts';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

interface AdminProductType extends ProductType {
  status?: 'active' | 'out_of_stock' | 'draft' | 'archived';
}

const getStockStatus = (p: AdminProductType): { label: string; color: string; bg: string } => {
  if (p.status === 'out_of_stock' || p.stockQuantity <= 0) {
    return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  }
  if (p.stockQuantity <= 5) {
    return { label: 'Low Stock', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
  }
  return { label: 'In Stock', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
};

const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCart();
  const [products, setProducts] = useState<AdminProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const activeType = searchParams.get('type') || '';
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & form steps
  const [showTypeSelectModal, setShowTypeSelectModal] = useState(searchParams.get('action') === 'new');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductType | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Form inputs
  const [selectedType, setSelectedType] = useState<'DRESS' | 'PLASTIC'>('DRESS');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [submitting, setSubmitting] = useState(false);

  // Categories & collections
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productColors, setProductColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#d4af37');
  const [sizes, setSizes] = useState<{ name: string; stock: string; price: string }[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const params: any = { limit: 200 };
      if (activeType) params.productType = activeType;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/products/admin/all', { params });
      if (res.data?.success && res.data?.data?.products) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const fetchCategories = async () => {
      try {
        const api = (await import('../../services/api.ts')).default;
        const res = await api.get('/admin/categories');
        if (res.data?.success && res.data?.data) {
          setCategories(res.data.data.categories || (Array.isArray(res.data.data) ? res.data.data : []));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, [activeType, searchQuery]);

  const handleTypeChoice = (type: 'DRESS' | 'PLASTIC') => {
    setSelectedType(type);
    setShowTypeSelectModal(false);
    setEditingProduct(null);
    setShowAddForm(true);
    
    // Reset form fields
    setName('');
    setPrice('');
    setSalePrice('');
    setStockQuantity('');
    setDescription('');
    setSku('');
    setImages([]);
    setSelectedFiles([]);
    setImageUrlInput('');
    setIsNewArrival(false);
    setIsFeatured(false);
    setStatus('active');
    setSelectedCategory('');
    setProductColors([]);
    setSizes(type === 'DRESS' ? [
      { name: 'S', stock: '10', price: '' },
      { name: 'M', stock: '10', price: '' },
      { name: 'L', stock: '10', price: '' }
    ] : []);
  };

  const handleStartEdit = (p: AdminProductType) => {
    const pType = (p.productType || '').toUpperCase() === 'PLASTIC' ? 'PLASTIC' : 'DRESS';
    setSelectedType(pType);
    setEditingProduct(p);
    setShowAddForm(true);
    setShowTypeSelectModal(false);

    setName(p.name);
    setPrice(p.price.toString());
    setSalePrice(p.salePrice ? p.salePrice.toString() : '');
    setStockQuantity(p.stockQuantity.toString());
    setDescription(p.description || '');
    setSku(p.sku);
    setImages(p.images || []);
    setSelectedFiles([]);
    setImageUrlInput('');
    setIsNewArrival(p.isNewArrival || false);
    setIsFeatured(p.isFeatured || false);
    setStatus(p.status === 'out_of_stock' ? 'active' : (p.status as any) || 'active');
    setSelectedCategory(p.category?._id || p.category || '');

    const initialColors = (p.colors || []).map((c: string) => {
      if (c.includes(':')) {
        const [cName, hex] = c.split(':');
        return { name: cName.trim(), hex: hex.trim() };
      }
      return { name: c, hex: c };
    });
    setProductColors(initialColors);

    const initialSizes = Array.isArray(p.sizes)
      ? p.sizes.map((s: any) => ({
          name: typeof s === 'string' ? s : s.name,
          stock: (typeof s === 'string' ? p.stockQuantity : s.stock || 0).toString(),
          price: (typeof s === 'string' ? '' : s.price ? s.price.toString() : ''),
        }))
      : [];
    setSizes(initialSizes);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const uploadSelectedImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    // 1. Try uploading to backend API
    try {
      const api = (await import('../../services/api.ts')).default;
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('images', file));
      const uploadRes = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (uploadRes.data?.success && Array.isArray(uploadRes.data?.data)) {
        return uploadRes.data.data.map((item: any) => item.url);
      }
    } catch (apiErr: any) {
      console.warn('Backend upload returned error, using local Data URL fallback:', apiErr);
    }

    // 2. Reliable client-side fallback: Convert files to Data URLs so saving never fails
    const localDataUrls = await Promise.all(
      selectedFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      })
    );

    return localDataUrls.filter(Boolean);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stockQuantity || !description) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      const api = (await import('../../services/api.ts')).default;

      // Auto-include pending URL if admin typed it but didn't click "+ Add URL"
      const pendingUrl = imageUrlInput.trim();
      const currentImages = [...images];
      if (pendingUrl && pendingUrl.startsWith('http')) {
        currentImages.push(pendingUrl);
      }

      const uploadedUrls = await uploadSelectedImages();
      const finalImages = [...currentImages, ...uploadedUrls];
      if (finalImages.length === 0) {
        finalImages.push(
          selectedType === 'DRESS'
            ? 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000'
            : 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1000'
        );
      }

      const colorsPayload = productColors.map((c) => `${c.name}:${c.hex}`);
      const parsedSizes = sizes.map((s) => ({
        name: s.name,
        stock: Number(s.stock || 0),
        price: s.price ? Number(s.price) : undefined,
      }));

      const defaultCategory = selectedCategory || categories[0]?._id;

      const payload = {
        name,
        description,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        stockQuantity: Number(stockQuantity),
        category: defaultCategory,
        images: finalImages,
        productType: selectedType,
        isNewArrival,
        isFeatured,
        status,
        sku: sku || `VIM-${selectedType === 'DRESS' ? 'DRS' : 'PLS'}-${Date.now().toString().slice(-4)}`,
        sizes: selectedType === 'DRESS' ? parsedSizes : [],
        colors: selectedType === 'DRESS' ? colorsPayload : [],
      };

      if (editingProduct) {
        const response = await api.put(`/products/${editingProduct._id}`, payload);
        if (response.data.success) {
          toast.success('Product updated successfully! 🎉');
        }
      } else {
        const response = await api.post('/products', payload);
        if (response.data.success) {
          toast.success('Product created successfully! 🎉');
        }
      }

      setShowAddForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.delete(`/products/${deletingProductId}`);
      if (response.data.success) {
        toast.success('Product deleted.');
        await fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to delete product.');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white" id="admin-product-management">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">Product Management</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 font-semibold">
            Create, Edit, and Control VIMSA Dresses &amp; Home Essentials
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowTypeSelectModal(true)}
          className="flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Search & Division Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 shadow-xs">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-gray-200 dark:border-dark-border pl-9 pr-3 py-2 text-xs outline-none focus:border-accent text-text-primary dark:text-white"
          />
        </div>

        {/* Division Filter Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 text-xs font-bold border transition-colors ${
              activeType === '' ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setSearchParams({ type: 'DRESS' })}
            className={`px-4 py-2 text-xs font-bold border transition-colors ${
              activeType === 'DRESS' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white'
            }`}
          >
            👗 Dresses
          </button>
          <button
            onClick={() => setSearchParams({ type: 'PLASTIC' })}
            className={`px-4 py-2 text-xs font-bold border transition-colors ${
              activeType === 'PLASTIC' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-white'
            }`}
          >
            📦 Home Essentials
          </button>
        </div>
      </div>

      {/* Step 1 Modal: SELECT PRODUCT TYPE */}
      {showTypeSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTypeSelectModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-surface p-8 shadow-2xl border border-gray-100 dark:border-dark-border text-center">
            <h3 className="font-outfit uppercase tracking-widest text-lg font-extrabold text-accent mb-2">
              Select Product Type
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-300 mb-8">
              Choose product division to load the appropriate management form.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeChoice('DRESS')}
                className="p-6 border-2 border-pink-500/40 hover:border-pink-500 bg-pink-500/5 hover:bg-pink-500/10 transition-all text-center flex flex-col items-center justify-center space-y-2 group rounded-md"
              >
                <span className="text-3xl mb-1">👗</span>
                <span className="font-extrabold text-sm text-text-primary dark:text-white group-hover:text-pink-500">
                  Dress / Clothing
                </span>
                <span className="text-[10px] text-text-secondary font-normal">
                  Requires size (S, M, L) &amp; color selection
                </span>
              </button>

              <button
                onClick={() => handleTypeChoice('PLASTIC')}
                className="p-6 border-2 border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center flex flex-col items-center justify-center space-y-2 group rounded-md"
              >
                <span className="text-3xl mb-1">📦</span>
                <span className="font-extrabold text-sm text-text-primary dark:text-white group-hover:text-emerald-500">
                  Home Essentials
                </span>
                <span className="text-[10px] text-text-secondary font-normal">
                  Everyday household item without clothing sizes
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 md:p-8 space-y-5 shadow-lg max-w-2xl text-[11px] relative">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-dark-border pb-3">
            <span className={`px-2.5 py-0.5 text-[10px] font-bold ${selectedType === 'DRESS' ? 'bg-pink-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {selectedType === 'DRESS' ? 'DRESS FORM' : 'HOME ESSENTIALS FORM'}
            </span>
            <h3 className="font-outfit uppercase text-sm font-extrabold text-text-primary dark:text-white">
              {editingProduct ? `Edit Product (${editingProduct.sku})` : 'New Product Details'}
            </h3>
          </div>

          <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Regular Price (Rs.) *" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input label="Sale Price (Rs.)" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Optional" />
            <Input label="Total Stock Qty *" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs uppercase font-outfit font-semibold mb-1.5 text-text-primary dark:text-gray-200">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border border-gray-300 dark:border-dark-border text-xs px-3 py-2 outline-none font-outfit text-text-primary dark:text-white"
              >
                <option value="" className="bg-white dark:bg-dark-surface text-black">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-white dark:bg-dark-surface text-black">{c.name}</option>
                ))}
              </select>
            </div>

            <Input label="SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} placeholder={`e.g. VIM-${selectedType === 'DRESS' ? 'DRS' : 'PLS'}-001`} />
          </div>

          {/* DRESS specific fields: Sizes & Colors */}
          {selectedType === 'DRESS' && (
            <div className="space-y-4 border border-pink-500/20 bg-pink-500/5 p-4 rounded-sm">
              <h4 className="font-outfit uppercase text-[10px] font-bold text-pink-500 tracking-widest">
                Clothing Sizes &amp; Colors (Required for Dresses)
              </h4>

              {/* Sizes toggle */}
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const isSelected = sizes.some((s) => s.name === sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSizes((prev) => prev.filter((s) => s.name !== sz));
                          } else {
                            setSizes((prev) => [...prev, { name: sz, stock: stockQuantity || '10', price: '' }]);
                          }
                        }}
                        className={`w-8 h-8 border text-xs font-bold transition-all ${
                          isSelected ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-text-primary dark:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Selector */}
              <div className="pt-3 border-t border-pink-500/20">
                <label className="text-[10px] uppercase font-bold text-text-secondary block mb-2">
                  Select Color Palette Swatches
                </label>

                {/* Preset Swatches Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 mb-4">
                  {[
                    { name: 'Black', hex: '#000000' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Royal Gold', hex: '#D4AF37' },
                    { name: 'Emerald Green', hex: '#2E3B2E' },
                    { name: 'Soft Beige', hex: '#F5F5DC' },
                    { name: 'Slate Gray', hex: '#708090' },
                    { name: 'Rose Pink', hex: '#FFB6C1' },
                    { name: 'Sky Blue', hex: '#87CEEB' },
                    { name: 'Crimson Red', hex: '#DC2626' },
                    { name: 'Navy Blue', hex: '#1E3A8A' },
                    { name: 'Velvet Purple', hex: '#7C3AED' },
                  ].map((preset) => {
                    const isSelected = productColors.some(
                      (c) => c.hex.toLowerCase() === preset.hex.toLowerCase() || c.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setProductColors((prev) =>
                              prev.filter(
                                (c) => c.hex.toLowerCase() !== preset.hex.toLowerCase() && c.name.toLowerCase() !== preset.name.toLowerCase()
                              )
                            );
                          } else {
                            setProductColors((prev) => [...prev, preset]);
                          }
                        }}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded border transition-all ${
                          isSelected ? 'border-pink-500 bg-pink-500/10 shadow-sm' : 'border-gray-200 dark:border-dark-border hover:border-gray-400'
                        }`}
                        title={preset.name}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/20 flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && (
                            <span className={`text-[10px] font-bold ${['#ffffff', '#f5f5dc', '#ffb6c1', '#87ceeb'].includes(preset.hex.toLowerCase()) ? 'text-black' : 'text-white'}`}>
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-[8px] font-semibold tracking-tighter truncate w-full text-center mt-1 text-text-primary dark:text-gray-300">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Colors Badges Bar */}
                {productColors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3 bg-white dark:bg-dark-surface p-2 border border-gray-100 dark:border-dark-border">
                    <span className="text-[9px] uppercase font-bold text-accent mr-1">Active Colors:</span>
                    {productColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-text-primary dark:text-white border border-gray-200 dark:border-dark-border"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        <button
                          type="button"
                          onClick={() => setProductColors((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 font-extrabold hover:text-red-700 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom Color Adder */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-dark-border p-1 bg-white dark:bg-dark-surface rounded">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded"
                      title="Pick custom color"
                    />
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Gold)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="bg-transparent text-xs outline-none px-2 font-outfit uppercase font-semibold text-text-primary dark:text-white w-36"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!customColorName.trim()) {
                        toast.error('Please enter a color name');
                        return;
                      }
                      setProductColors((prev) => [...prev, { name: customColorName.trim(), hex: customColorHex }]);
                      setCustomColorName('');
                    }}
                    className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-accent dark:hover:bg-accent hover:text-black transition-colors rounded"
                  >
                    + Add Custom Color
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Images Section */}
          <div className="space-y-3 border border-gray-200 dark:border-dark-border p-4 rounded bg-neutral-50/50 dark:bg-neutral-900/30">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-outfit font-bold text-text-primary dark:text-gray-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-accent" />
                <span>Product Images</span>
              </label>
              <span className="text-[10px] text-text-secondary lowercase font-normal">
                (Upload local files or paste image URLs)
              </span>
            </div>

            {/* File Upload Box */}
            <div className="relative border-2 border-dashed border-gray-300 dark:border-dark-border hover:border-accent dark:hover:border-accent transition-colors p-5 text-center rounded bg-white dark:bg-dark-surface cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="product-image-file-input"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <Upload className="w-6 h-6 text-text-secondary group-hover:text-accent transition-colors" />
                <p className="text-xs font-semibold text-text-primary dark:text-gray-200">
                  Click to browse or drag &amp; drop product images
                </p>
                <p className="text-[10px] text-text-secondary">
                  PNG, JPG, WEBP (Supports multiple images)
                </p>
              </div>
            </div>

            {/* URL Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-secondary" />
                <input
                  type="url"
                  placeholder="Or paste online image URL (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border pl-8 pr-3 py-1.5 text-xs outline-none focus:border-accent font-inter text-text-primary dark:text-white rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-black dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white text-[10px] font-bold uppercase rounded transition-colors whitespace-nowrap"
              >
                + Add URL
              </button>
            </div>

            {/* Preview Grid */}
            {(images.length > 0 || selectedFiles.length > 0) && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-text-secondary mb-2">
                  Attached Images ({images.length + selectedFiles.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {/* Existing Image URLs */}
                  {images.map((imgUrl, index) => (
                    <div key={`existing-${index}`} className="relative group border border-gray-200 dark:border-dark-border rounded overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800">
                      <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 shadow transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] py-0.5 text-center truncate px-1">
                        Saved
                      </span>
                    </div>
                  ))}

                  {/* Newly Selected Local Files */}
                  {selectedFiles.map((file, index) => (
                    <div key={`file-${index}`} className="relative group border-2 border-accent/60 rounded overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(index)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 shadow transition-opacity"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-accent text-black font-bold text-[8px] py-0.5 text-center truncate px-1">
                        New File
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="accent-accent" />
              <span className="text-xs uppercase font-semibold">New Arrival</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-accent" />
              <span className="text-xs uppercase font-semibold">Featured on Home</span>
            </label>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold mb-1.5 block">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border border-gray-300 dark:border-dark-border text-xs px-3 py-2 outline-none font-inter text-text-primary dark:text-white"
              rows={3}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Main Admin Product Table */}
      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[10px] text-text-secondary font-bold tracking-widest">
                <th className="pb-3">PRODUCT</th>
                <th className="pb-3">TYPE</th>
                <th className="pb-3">PRICE</th>
                <th className="pb-3">STOCK</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
              {products.map((p) => {
                const divisionName = (p.productType || '').toUpperCase() === 'PLASTIC' ? 'Home Essentials' : 'Dress';
                return (
                  <tr key={p._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 pr-3 font-bold text-text-primary dark:text-white flex items-center space-x-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-12 object-cover bg-neutral-100 border border-gray-100" />
                      <div>
                        <p className="line-clamp-1">{p.name}</p>
                        <p className="text-[9px] text-text-secondary font-mono">SKU: {p.sku}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <span className={`px-2.5 py-1 text-[9px] font-bold ${divisionName === 'Home Essentials' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-pink-500/10 text-pink-600'}`}>
                        {divisionName}
                      </span>
                    </td>
                    <td className="py-4 pr-3 font-bold text-accent">
                      {formatPrice(p.salePrice || p.price)}
                    </td>
                    <td className="py-4 pr-3">
                      {p.stockQuantity} units
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 text-accent hover:bg-accent/10 transition-colors rounded"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProductId(p._id)}
                          className="p-1.5 text-error hover:bg-error/10 transition-colors rounded"
                          title="Delete Product"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Safety Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setDeletingProductId(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-dark-surface p-6 shadow-2xl border border-gray-100 dark:border-dark-border text-center">
            <h3 className="font-outfit uppercase tracking-widest text-sm font-extrabold text-error mb-2">
              Delete this product?
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-300 font-inter mb-6">
              This action cannot be undone. The product will be permanently removed from public catalog.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="secondary" size="sm" onClick={() => setDeletingProductId(null)}>
                Cancel
              </Button>
              <Button variant="error" size="sm" onClick={handleConfirmDelete}>
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
