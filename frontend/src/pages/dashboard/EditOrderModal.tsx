import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button.tsx';
import Input from '../../components/ui/Input.tsx';
import { StrictNumberInput } from '../../components/ui/StrictNumberInput.tsx';
import { orderService } from '../../services/orderService.ts';
import toast from 'react-hot-toast';

interface EditOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, isOpen, onClose, onOrderUpdated }) => {
  const [items, setItems] = useState<any[]>(order.items || []);
  const [shippingAddress, setShippingAddress] = useState<any>(order.shippingAddress || {});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleQuantityChange = (idx: number, qty: number) => {
    if (qty < 1) return;
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], quantity: qty };
    setItems(newItems);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = { items, shippingAddress };
      const res = await orderService.editOrder(order._id, updates);
      if (res.success) {
        toast.success('Order updated successfully!');
        onOrderUpdated();
        onClose();
      } else {
        toast.error(res.message || 'Failed to update order');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-gray-100 dark:border-dark-border shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-text-primary dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="font-outfit text-xl font-bold uppercase tracking-widest text-accent mb-6">Edit Order</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xs uppercase mb-3">Order Items</h3>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-100 dark:border-dark-border p-3">
                    <div className="text-xs">
                      <p className="font-bold uppercase">{item.name}</p>
                      <p className="text-text-secondary">Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-[10px] font-bold uppercase">Qty:</label>
                      <StrictNumberInput
                        value={item.quantity}
                        onValueChange={(val) => handleQuantityChange(idx, parseInt(val) || 1)}
                        min={1}
                        className="w-16 h-8 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase mb-3">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.fullName || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                />
                <Input
                  label="Mobile Number"
                  value={shippingAddress.mobileNumber || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, mobileNumber: e.target.value })}
                />
                <Input
                  label="Address Line 1"
                  value={shippingAddress.addressLine1 || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                />
                <Input
                  label="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2 || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                />
                <Input
                  label="City"
                  value={shippingAddress.city || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
                <Input
                  label="Postal Code"
                  value={shippingAddress.postalCode || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-dark-border">
              <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
