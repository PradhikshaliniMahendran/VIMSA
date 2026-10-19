import React, { useEffect, useState, useRef } from 'react';
import { Plus, Trash, Edit, Sparkles, CheckCircle2, XCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import toast from 'react-hot-toast';

interface Promotion {
  _id: string;
  title: string;
  description?: string;
  discountText?: string;
  bannerImage?: string;
  ctaText: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
}

const PRESET_CTA_LINKS = [
  { label: '🌸 Dresses Collection', value: '/shop?type=DRESS' },
  { label: '📦 Home Essentials Collection', value: '/shop?type=PLASTIC' },
  { label: '🛍️ All Products Catalog', value: '/shop' },
  { label: '⚡ Flash Sales Page', value: '/flash-sales' },
  { label: '🌟 New Arrivals Page', value: '/new-arrivals' },
  { label: '🔥 Best Sellers Page', value: '/best-sellers' },
  { label: '🔗 Custom Web Page Link...', value: 'CUSTOM' },
];

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // File input ref for image browsing
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [selectedCtaPreset, setSelectedCtaPreset] = useState('/shop?type=DRESS');
  const [customCtaLink, setCustomCtaLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isFeatured, setIsFeatured] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const res = await api.get('/promotions/admin');
      if (res.data?.success) {
        setPromotions(res.data.data.promotions || []);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();

    // Default dates for new creation
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
  }, []);

  const handleStartEdit = (promo: Promotion) => {
    setEditingId(promo._id);
    setTitle(promo.title);
    setDescription(promo.description || '');
    setDiscountText(promo.discountText || '');
    setBannerImage(promo.bannerImage || '');
    setCtaText(promo.ctaText || 'Shop Now');
    
    // Check if link matches a preset
    const preset = PRESET_CTA_LINKS.find((p) => p.value === promo.ctaLink);
    if (preset) {
      setSelectedCtaPreset(preset.value);
      setCustomCtaLink('');
    } else {
      setSelectedCtaPreset('CUSTOM');
      setCustomCtaLink(promo.ctaLink || '/shop');
    }

    setStartDate(promo.startDate ? promo.startDate.split('T')[0] : '');
    setEndDate(promo.endDate ? promo.endDate.split('T')[0] : '');
    setStatus(promo.status);
    setIsFeatured(promo.isFeatured);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDiscountText('');
    setBannerImage('');
    setCtaText('Shop Now');
    setSelectedCtaPreset('/shop?type=DRESS');
    setCustomCtaLink('');
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
    setStatus('active');
    setIsFeatured(true);
  };

  // Image Upload / Browse Handler
  const handleImageBrowseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setUploadingImage(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.url) {
        setBannerImage(res.data.data.url);
        toast.success('Banner image uploaded successfully! 📷');
      } else {
        // Fallback to local Base64 preview if backend upload returns fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerImage(reader.result as string);
          toast.success('Image loaded! 📷');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Direct Base64 Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
        toast.success('Image loaded for offer! 📷');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter an offer title');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      toast.error('End date must be after the start date.');
      return;
    }

    const finalCtaLink = selectedCtaPreset === 'CUSTOM' ? (customCtaLink.trim() || '/shop') : selectedCtaPreset;

    setSubmitting(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        discountText: discountText.trim(),
        bannerImage: bannerImage.trim(),
        ctaText: ctaText.trim() || 'Shop Now',
        ctaLink: finalCtaLink,
        startDate,
        endDate,
        status,
        isFeatured,
      };

      if (editingId) {
        const res = await api.put(`/promotions/admin/${editingId}`, payload);
        if (res.data?.success) {
          toast.success('Promotion updated successfully! 🎉');
          handleResetForm();
          await fetchPromotions();
        }
      } else {
        const res = await api.post('/promotions/admin', payload);
        if (res.data?.success) {
          toast.success('Promotion created successfully! 🎉');
          handleResetForm();
          await fetchPromotions();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save promotion';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional offer?')) return;
    try {
      const api = (await import('../../services/api.ts')).default;
      const res = await api.delete(`/promotions/admin/${id}`);
      if (res.data?.success) {
        toast.success('Promotion deleted successfully');
        await fetchPromotions();
      }
    } catch (err) {
      toast.error('Failed to delete promotion');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title Header */}
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold">Promotions &amp; Offer Popup Management</h1>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
          Control homepage promotional popups, special discount banners, and featured sales campaigns
        </p>
      </div>

      {/* Promotion Creation / Edit Form */}
      <div className="bg-white dark:bg-dark-surface border border-accent/30 p-4 sm:p-6 md:p-8 shadow-md rounded-xs">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-extrabold text-accent tracking-widest">
            {editingId ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Offer Title *"
              placeholder="e.g. Weekend Special, Summer Flash Sale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Discount / Badge Text (e.g. 20% OFF)"
              placeholder="e.g. Up to 20% OFF, Buy 1 Get 1 Free"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
            />

            <div className="md:col-span-2">
              <Input
                label="Offer Description"
                placeholder="e.g. Enjoy 20% OFF selected dresses &amp; home essentials. Limited time offer."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Offer Banner Image File Browse & Upload */}
            <div className="md:col-span-2 bg-neutral-50 dark:bg-neutral-900/50 p-4 border border-gray-200 dark:border-dark-border rounded-sm">
              <label className="text-[10px] uppercase font-bold text-text-secondary dark:text-gray-300 block mb-2">
                Offer Banner Image (Browse from Computer)
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageBrowseUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={uploadingImage}
                  className="w-full sm:w-auto font-extrabold flex items-center justify-center space-x-2 border-accent text-accent hover:bg-accent hover:text-black"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Image File...</span>
                </Button>

                <span className="text-[10px] text-text-secondary dark:text-neutral-400 font-inter font-normal">
                  Select an image file (PNG, JPG, WEBP) from your device to display inside the popup.
                </span>
              </div>

              {/* Banner Image Preview */}
              {bannerImage && (
                <div className="mt-4 relative inline-block border border-accent/40 rounded overflow-hidden">
                  <img src={bannerImage} alt="Offer preview" className="h-28 w-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => setBannerImage('')}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/75 text-accent text-[9px] font-mono px-1.5 py-0.5 font-bold">
                    ✓ Image Loaded
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button Text */}
            <Input
              label="CTA Button Text *"
              placeholder="e.g. Shop Now, View Offer"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              helperText="The text shown on the popup action button."
              required
            />

            {/* Friendly CTA Target Page Dropdown */}
            <div>
              <label className="text-[10px] uppercase font-bold text-text-secondary dark:text-gray-400 block mb-1.5">
                Where should the 'Shop Now' button take the customer? *
              </label>
              <select
                value={selectedCtaPreset}
                onChange={(e) => setSelectedCtaPreset(e.target.value)}
                className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs px-3 py-2.5 outline-none font-outfit uppercase font-extrabold text-text-primary dark:text-white focus:border-accent"
              >
                {PRESET_CTA_LINKS.map((preset) => (
                  <option key={preset.value} value={preset.value} className="dark:bg-dark-surface py-1">
                    {preset.label}
                  </option>
                ))}
              </select>

              <span className="text-[10px] text-text-secondary dark:text-gray-400 font-normal mt-1 block font-inter">
                Select the store collection or page page that customers will visit when they click the button on the popup.
              </span>
            </div>

            {/* Custom Link Input if CUSTOM selected */}
            {selectedCtaPreset === 'CUSTOM' && (
              <div className="md:col-span-2">
                <Input
                  label="Enter Custom Web Link / Path *"
                  placeholder="e.g. /shop?type=DRESS or https://..."
                  value={customCtaLink}
                  onChange={(e) => setCustomCtaLink(e.target.value)}
                  required
                />
              </div>
            )}

            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <Input
              label="End Date *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />

            <div>
              <label className="text-[10px] uppercase font-bold text-text-secondary dark:text-gray-400 block mb-2">
                Status *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="accent-accent"
                  />
                  <span>Active (Live)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'inactive'}
                    onChange={() => setStatus('inactive')}
                    className="accent-accent"
                  />
                  <span>Inactive (Paused)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-text-secondary dark:text-gray-400 block mb-2">
                Featured Promotion *
              </label>
              <label className="flex items-center space-x-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                <span>Set as primary featured offer popup</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
            {editingId && (
              <Button type="button" variant="secondary" size="md" onClick={handleResetForm} className="w-full sm:w-auto">
                Cancel Edit
              </Button>
            )}
            <Button type="submit" variant="accent" size="md" isLoading={submitting} className="font-extrabold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5 inline" />
              <span>{editingId ? 'Update Promotion' : 'Save & Publish Promotion'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Promotions List Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-sm rounded-xs">
        <h2 className="text-sm font-extrabold text-text-primary dark:text-white mb-4 sm:mb-6 tracking-widest">
          Existing Promotions ({promotions.length})
        </h2>

        {loading ? (
          <div className="h-48 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-12 text-center text-text-secondary dark:text-gray-400">
            No promotions created yet. Fill out the form above to publish your first offer popup.
          </div>
        ) : (
          <div className="overflow-x-auto text-[11px] font-semibold -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                  <th className="pb-3 pr-4">Title &amp; Offer</th>
                  <th className="pb-3 pr-4">Button &amp; Destination Page</th>
                  <th className="pb-3 pr-4">Duration (Start → End)</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Featured</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {promotions.map((p) => {
                  const now = new Date();
                  const isDateActive = new Date(p.startDate) <= now && new Date(p.endDate) >= now;
                  const isLive = p.status === 'active' && isDateActive;

                  const preset = PRESET_CTA_LINKS.find((pr) => pr.value === p.ctaLink);
                  const displayCta = preset ? preset.label : p.ctaLink;

                  return (
                    <tr key={p._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-4 pr-4 font-bold min-w-[180px]">
                        <div>
                          <p className="text-text-primary dark:text-white font-extrabold">{p.title}</p>
                          {p.discountText && (
                            <span className="text-[9px] text-accent font-extrabold uppercase">{p.discountText}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] text-text-secondary dark:text-neutral-400">
                          [{p.ctaText}] → {displayCta}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 font-mono text-[10px] whitespace-nowrap">
                        {p.startDate ? p.startDate.split('T')[0] : ''} to {p.endDate ? p.endDate.split('T')[0] : ''}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded inline-flex items-center gap-1 ${
                            isLive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/30'
                          }`}
                        >
                          {isLive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{isLive ? 'Live Active' : p.status === 'inactive' ? 'Paused' : 'Expired/Scheduled'}</span>
                        </span>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {p.isFeatured ? (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/30 text-[9px] font-bold">
                            PRIMARY POPUP
                          </span>
                        ) : (
                          <span className="text-text-secondary dark:text-neutral-500 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="text-accent hover:text-white transition-colors p-1"
                            title="Edit Promotion"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="text-error hover:text-white transition-colors p-1"
                            title="Delete Promotion"
                          >
                            <Trash className="w-4 h-4 inline" />
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
      </div>
    </div>
  );
};

export default AdminPromotions;
