import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import toast from 'react-hot-toast';

interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const AdminCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/admin/collections');
      if (response.data.success) {
        const colData = response.data.data?.collections || [];
        setCollections(colData);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleStartEdit = (collection: Collection) => {
    setEditingId(collection._id);
    setName(collection.name);
    setDescription(collection.description || '');
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const api = (await import('../../services/api.ts')).default;
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      if (editingId) {
        const response = await api.put(`/admin/collections/${editingId}`, {
          name,
          slug,
          description,
        });

        if (response.data.success) {
          toast.success('Collection updated successfully! 🎉');
          setName('');
          setDescription('');
          setEditingId(null);
          setShowAddForm(false);
          await fetchCollections();
        }
      } else {
        const response = await api.post('/admin/collections', {
          name,
          slug,
          description,
        });

        if (response.data.success) {
          toast.success('Collection created successfully! 🎉');
          setName('');
          setDescription('');
          setShowAddForm(false);
          await fetchCollections();
        }
      }
    } catch (err) {
      toast.error(editingId ? 'Failed to update collection' : 'Failed to add collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this collection?');
    if (!confirm) return;

    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.delete(`/admin/collections/${id}`);
      if (response.data.success) {
        toast.success('Collection deleted.');
        await fetchCollections();
      }
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-6 text-xs font-outfit uppercase tracking-wider font-semibold text-text-primary dark:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold">Collections Catalog</h2>
          <p className="text-[10px] text-text-secondary dark:text-gray-400 mt-1 uppercase font-semibold">
            Define marketing groups, campaigns, and product divisions
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingId(null);
              setName('');
              setDescription('');
            } else {
              setShowAddForm(true);
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 py-2 px-3.5"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>{showAddForm ? 'Cancel' : 'Add Collection'}</span>
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-4 sm:p-6 space-y-4 max-w-xl animate-fade-in rounded-xs">
          <h3 className="font-outfit uppercase text-[10px] font-bold text-accent mb-3">
            {editingId ? 'Edit Collection' : 'Create New Collection'}
          </h3>
          <Input label="Collection Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" variant="primary" isLoading={submitting} className="w-full sm:w-auto">
              {editingId ? 'Update Collection' : 'Save Collection'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-3 sm:p-5 lg:p-6 shadow-sm overflow-x-auto text-[11px] font-semibold rounded-xs">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3 pr-4">Collection Name</th>
                <th className="pb-3 pr-4">Slug</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    No collections created yet.
                  </td>
                </tr>
              ) : (
                collections.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-4 pr-4 font-bold whitespace-nowrap">{c.name}</td>
                    <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 font-mono text-[10px] whitespace-nowrap">{c.slug}</td>
                    <td className="py-4 pr-4 text-text-secondary dark:text-neutral-400 normal-case min-w-[150px]">{c.description || '-'}</td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="text-accent hover:text-white transition-colors p-1"
                          title="Edit Collection"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-error hover:text-white transition-colors p-1"
                          title="Delete Collection"
                        >
                          <Trash className="w-4 h-4 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCollections;
