import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/Modal/Modal';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceModal = ({ isOpen, onClose, onSuccess }: InvoiceModalProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    issue_date: new Date().toISOString().split('T')[0],
    payment_terms: 'Net 30',
    due_date: '',
    tax_rate: 7.5, // Standard Nigerian VAT
    shipping: 0,
  });

  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0, total: 0 }]);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  // Calculate due date based on terms
  useEffect(() => {
    if (formData.issue_date && formData.payment_terms) {
      const days = parseInt(formData.payment_terms.replace('Net ', '')) || 0;
      const date = new Date(formData.issue_date);
      date.setDate(date.getDate() + days);
      setFormData(prev => ({ ...prev, due_date: date.toISOString().split('T')[0] }));
    }
  }, [formData.issue_date, formData.payment_terms]);

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('name');
    if (data) setClients(data);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      item.total = item.quantity * item.rate;
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * formData.tax_rate) / 100;
  const totalAmount = subtotal + taxAmount + Number(formData.shipping);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create Invoice
      const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert([{
          profile_id: user.id,
          client_id: formData.client_id,
          invoice_number: formData.invoice_number,
          issue_date: formData.issue_date,
          payment_terms: formData.payment_terms,
          due_date: formData.due_date,
          subtotal,
          tax: taxAmount,
          shipping: formData.shipping,
          total: totalAmount,
          status: 'pending'
        }])
        .select()
        .single();

      if (invError) throw invError;

      // 2. Create Invoice Items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map(item => ({
          invoice_id: invoice.id,
          ...item
        })));

      if (itemsError) throw itemsError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice">
      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-section">
          <div className="input-group">
            <label>Client</label>
            <select 
              value={formData.client_id} 
              onChange={e => setFormData({...formData, client_id: e.target.value})}
              required
            >
              <option value="">Select a client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Invoice #</label>
              <input 
                type="text" 
                value={formData.invoice_number} 
                onChange={e => setFormData({...formData, invoice_number: e.target.value})}
                required 
              />
            </div>
            <div className="input-group">
              <label>Terms</label>
              <select 
                value={formData.payment_terms} 
                onChange={e => setFormData({...formData, payment_terms: e.target.value})}
              >
                <option>Due on Receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 60</option>
              </select>
            </div>
          </div>
        </div>

        <div className="items-section">
          <h3>Line Items</h3>
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input 
                placeholder="Item description" 
                className="item-desc"
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
                required
              />
              <input 
                type="number" 
                placeholder="Qty" 
                className="item-qty"
                value={item.quantity}
                onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                required 
              />
              <input 
                type="number" 
                placeholder="Rate" 
                className="item-rate"
                value={item.rate}
                onChange={e => updateItem(index, 'rate', Number(e.target.value))}
                required 
              />
              <div className="item-total">₦{item.total.toLocaleString()}</div>
              <button type="button" onClick={() => removeItem(index)} className="btn-icon">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn-text">
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="summary-section glass">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>VAT (7.5%)</span>
            <span>₦{taxAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Generate Invoice'}
        </button>
      </form>
    </Modal>
  );
};
