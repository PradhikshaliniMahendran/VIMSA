import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Button from '../ui/Button.tsx';
import toast from 'react-hot-toast';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSubmit: (returnItems: any[], reason: string) => Promise<void>;
}

const ReturnModal: React.FC<ReturnModalProps> = ({ isOpen, onClose, order, onSubmit }) => {
  const [selectedItems, setSelectedItems] = useState<{ product: string, quantity: number }[]>([]);
  const [reason, setReason] = useState('Size mismatch');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleItemToggle = (product: string, maxQuantity: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.product === product);
      if (existing) {
        return prev.filter(i => i.product !== product);
      }
      return [...prev, { product, quantity: maxQuantity }];
    });
  };

  const handleQuantityChange = (product: string, val: number, max: number) => {
    if (val < 1 || val > max) return;
    setSelectedItems(prev => prev.map(i => i.product === product ? { ...i, quantity: val } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(selectedItems, reason);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl border border-gray-100 dark:border-dark-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-outfit uppercase font-extrabold tracking-wider text-sm">Request Return</h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1">
          <div className="mb-6 bg-warning/10 border border-warning/20 p-4 flex space-x-3 items-start text-xs font-semibold text-warning">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>You can only return items within 14 days of delivery. Custom-sized items and final sale items are not eligible for returns.</p>
          </div>

          <h3 className="font-outfit uppercase font-bold text-[10px] tracking-widest text-text-secondary dark:text-gray-400 mb-3">
            Select Items to Return
          </h3>
          
          <div className="space-y-3 mb-6">
            {order.items.map((item: any) => {
              const isSelected = selectedItems.some(i => i.product === item.product?._id);
              const selectedItem = selectedItems.find(i => i.product === item.product?._id);
              
              return (
                <div key={item._id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-neutral-800/50">
                  <div className="flex items-center space-x-4">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleItemToggle(item.product?._id, item.quantity)}
                      className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                    />
                    <div className="flex space-x-3 items-center">
                      <img 
                        src={item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000'} 
                        alt={item.name} 
                        className="w-12 h-16 object-cover border border-gray-200 dark:border-dark-border"
                      />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wide">{item.name}</p>
                        <p className="text-[10px] text-text-secondary font-mono mt-0.5">{item.size} | {item.color}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Qty:</span>
                      <input 
                        type="number" 
                        min={1} 
                        max={item.quantity} 
                        value={selectedItem?.quantity || 1}
                        onChange={(e) => handleQuantityChange(item.product?._id, parseInt(e.target.value), item.quantity)}
                        className="w-16 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-dark-border text-xs px-2 py-1 text-center font-bold"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="font-outfit uppercase font-bold text-[10px] tracking-widest text-text-secondary dark:text-gray-400 mb-3">
            Reason for Return
          </h3>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-dark-border text-sm p-3 font-semibold mb-6 focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            required
          >
            <option value="Size mismatch">Size mismatch</option>
            <option value="Product defective">Product defective or damaged</option>
            <option value="Not as described">Not as described</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Wrong item received">Wrong item received</option>
          </select>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting || selectedItems.length === 0}>
              {submitting ? 'Submitting...' : 'Submit Return'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
