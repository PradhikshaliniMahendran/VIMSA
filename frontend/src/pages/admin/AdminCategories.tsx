import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit, Tag, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  division?: 'DRESS' | 'PLASTIC' | 'BOTH';
  description?: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [division, setDivision] = useState<'DRESS' | 'PLASTIC' | 'BOTH'>('DRESS');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        const catData = response.data.data;
        setCategories(catData?.categories || (Array.isArray(catData) ? catData : []));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleStartEdit = (category: Category) => {
    setEditingId(category._id);
    setName(category.name);
    setDivision(category.division || 'DRESS');
    setDescription(category.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDivision('DRESS');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setSubmitting(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const payload = {
        name: name.trim(),
        slug,
        division,
        description: description.trim(),
      };

      if (editingId) {
        const response = await api.put(`/admin/categories/${editingId}`, payload);
        if (response.data.success) {
          toast.success('Category updated successfully! 🎉');
          handleCancelEdit();
          await fetchCategories();
        }
      } else {
        const response = await api.post('/admin/categories', payload);
        if (response.data.success) {
          toast.success('Category created successfully! 🎉');
          handleCancelEdit();
          await fetchCategories();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || (editingId ? 'Failed to update category' : 'Failed to add category');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.delete(`/admin/categories/${id}`);
      if (response.data.success) {
        toast.success('Category deleted successfully.');
        await fetchCategories();
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title */}
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold">Store Categories Catalog</h1>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
          Create, edit, and organize product categories for Dresses &amp; Home Essentials
        </p>
      </div>

      {/* Prominent Always-Visible Category Creation Form */}
      <div className="bg-white dark:bg-dark-surface border border-accent/30 p-4 sm:p-6 md:p-8 shadow-md rounded-xs">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Tag className="w-5 h-5 text-accent" />
          <h2 className="text-sm font-extrabold text-accent tracking-widest">
            {editingId ? 'Edit Store Category' : 'Add New Category'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Category Name *"
              placeholder="e.g. Maxi Dresses, Kitchenware, Nightwear"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="text-[10px] uppercase font-bold text-text-secondary dark:text-gray-400 block mb-2">
                Category Division / Product Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDivision('DRESS')}
                  className={`py-2 px-3 border text-[11px] font-bold uppercase transition-all rounded text-center ${
                    division === 'DRESS'
                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-300 hover:border-pink-500'
                  }`}
                >
                  👗 Dresses &amp; Clothing
                </button>
                <button
                  type="button"
                  onClick={() => setDivision('PLASTIC')}
                  className={`py-2 px-3 border text-[11px] font-bold uppercase transition-all rounded text-center ${
                    division === 'PLASTIC'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-300 hover:border-emerald-500'
                  }`}
                >
                  📦 Home Essentials
                </button>
                <button
                  type="button"
                  onClick={() => setDivision('BOTH')}
                  className={`py-2 px-3 border text-[11px] font-bold uppercase transition-all rounded text-center ${
                    division === 'BOTH'
                      ? 'bg-accent text-black border-accent shadow-sm font-extrabold'
                      : 'border-gray-200 dark:border-dark-border text-text-primary dark:text-gray-300 hover:border-accent'
                  }`}
                >
                  🌐 Universal / Both
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Category Description (Optional)"
                placeholder="Brief description of products in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
            {editingId && (
              <Button type="button" variant="secondary" size="md" onClick={handleCancelEdit} className="w-full sm:w-auto">
                Cancel Edit
              </Button>
            )}
            <Button type="submit" variant="accent" size="md" isLoading={submitting} className="font-extrabold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5 inline" />
              <span>{editingId ? 'Update Category' : 'Save & Create Category'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Category List Table */}
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 shadow-sm rounded-xs">
        <h2 className="text-sm font-extrabold text-text-primary dark:text-white mb-4 sm:mb-6 tracking-widest">
          Existing Categories ({categories.length})
        </h2>

        {loading ? (
          <div className="h-48 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-text-secondary dark:text-gray-400">
            No categories created yet. Fill out the form above to add your first category.
          </div>
        ) : (
          <div className="overflow-x-auto text-[11px] font-semibold -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left min-w-[620px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                  <th className="pb-3 pr-4">Category Name</th>
                  <th className="pb-3 pr-4">Division</th>
                  <th className="pb-3 pr-4">URL Slug</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {categories.map((c) => {
                  const divType = c.division || 'DRESS';
                  return (
                    <tr key={c._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-4 pr-4 font-bold whitespace-nowrap">{c.name}</td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded ${
                            divType === 'PLASTIC'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : divType === 'DRESS'
                              ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30'
                              : 'bg-accent/10 text-accent border border-accent/30'
                          }`}
                        >
                          {divType === 'PLASTIC' ? '📦 Home Essentials' : divType === 'DRESS' ? '👗 Dresses & Clothing' : '🌐 Universal'}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 font-mono text-[10px] whitespace-nowrap">{c.slug}</td>
                      <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 normal-case min-w-[150px]">{c.description || '-'}</td>
                      <td className="py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="text-accent hover:text-white transition-colors p-1"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="text-error hover:text-white transition-colors p-1"
                            title="Delete Category"
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

export default AdminCategories;
