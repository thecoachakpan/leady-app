import useSWR from 'swr';
import { supabase } from '../../lib/supabase';
import { Plus, ArrowUpRight, ArrowDownLeft, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const fetchDashboardData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, business_name, email')
    .eq('id', user.id)
    .single();
  
  const userName = profile?.first_name || profile?.business_name || profile?.email?.split('@')[0] || 'User';

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('total, status');

  let totals = { totalInvoiced: 0, totalPaid: 0, pendingPayment: 0 };
  if (allInvoices) {
    totals.totalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    totals.totalPaid = allInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0);
    totals.pendingPayment = allInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + Number(inv.total), 0);
  }

  return { userName, recentInvoices: invoices || [], totals };
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading: loading } = useSWR('dashboard', fetchDashboardData);

  const totals = data?.totals || { totalInvoiced: 0, totalPaid: 0, pendingPayment: 0 };
  const recentInvoices = data?.recentInvoices || [];
  const userName = data?.userName || '';

  const stats = [
    { label: 'Total Invoiced', value: `₦${totals.totalInvoiced.toLocaleString()}`, icon: <ArrowUpRight size={20} />, color: 'var(--primary)' },
    { label: 'Total Paid', value: `₦${totals.totalPaid.toLocaleString()}`, icon: <ArrowDownLeft size={20} />, color: 'var(--success)' },
    { label: 'Pending Payment', value: `₦${totals.pendingPayment.toLocaleString()}`, icon: <Clock size={20} />, color: 'var(--warning)' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {userName}</h1>
          <p>Here's what's happening with your invoices today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
          <Plus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card glass">
            <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="card glass">
          <div className="card-header">
            <h3>Recent Invoices</h3>
            <button className="btn-text" onClick={() => navigate('/invoices')}>View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</td></tr>
                ) : recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                      <div className="empty-state">
                        <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No invoices found. Create your first one to see stats!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr key={invoice.id} onClick={() => navigate(`/invoices/${invoice.id}`)} style={{ cursor: 'pointer' }}>
                      <td><span className="id-tag">{invoice.invoice_number}</span></td>
                      <td>{invoice.clients?.name}</td>
                      <td>{new Date(invoice.issue_date).toLocaleDateString()}</td>
                      <td>₦{Number(invoice.total).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${invoice.status}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

