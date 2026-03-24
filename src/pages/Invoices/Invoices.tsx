import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, MoreVertical, FileText, Filter, Calendar } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import './Invoices.css';

const fetchInvoices = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (name)
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const Invoices = () => {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading: loading, mutate } = useSWR('invoices', fetchInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Create and manage your professional invoices.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

      <div className="invoices-toolbar glass">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Filter by invoice ID or client..." />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn-secondary">
            <Calendar size={18} />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      <div className="card glass">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="empty-state">
                      <FileText size={48} color="var(--text-muted)" />
                      <h3>No invoices yet</h3>
                      <p>Click "New Invoice" to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} onClick={() => navigate(`/invoices/${invoice.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="invoice-id-cell">
                        <span className="id-tag">{invoice.invoice_number}</span>
                        <span className="date-sub">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>{invoice.clients?.name}</td>
                    <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td>₦{invoice.total.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${invoice.status}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => mutate()}
      />
    </div>
  );
};
