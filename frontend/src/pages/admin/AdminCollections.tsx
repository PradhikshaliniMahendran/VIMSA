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
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-dark-border pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold">Collections Catalog</h2>
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
          className="flex items-center space-x-1 py-1.5 px-3"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>{showAddForm ? 'Cancel' : 'Add Collection'}</span>
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border p-6 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-outfit uppercase text-[10px] font-bold text-accent mb-4">
            {editingId ? 'Edit Collection' : 'Create New Collection'}
          </h3>
          <Input label="Collection Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" variant="primary" isLoading={submitting}>
            {editingId ? 'Update Collection' : 'Save Collection'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="overflow-x-auto text-[11px] font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border pb-3 text-[9px] text-text-secondary">
                <th className="pb-3">Collection Name</th>
                <th className="pb-3">Slug</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {collections.map((c) => (
                <tr key={c._id}>
                  <td className="py-4 font-bold">{c.name}</td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400">{c.slug}</td>
                  <td className="py-4 text-text-secondary dark:text-neutral-400 normal-case">{c.description || '-'}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="text-accent hover:text-white transition-colors"
                        title="Edit Collection"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-error hover:text-white transition-colors"
                        title="Delete Collection"
                      >
                        <Trash className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCollections;
