import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '../../lib/supabase';
import { Plus, Search, MoreVertical, Mail, MapPin, Users } from 'lucide-react';
import { Modal } from '../../components/Modal/Modal';
import './Clients.css';

const fetchClients = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('profile_id', user.id)
    .order('name');
  return data || [];
};

export const Clients = () => {
  const { data: clients = [], isLoading: loading, mutate } = useSWR('clients', fetchClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', street_address: '' });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('clients')
      .insert([{ ...newClient, profile_id: user.id }]);

    if (!error) {
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', street_address: '' });
      mutate();
    }
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage your client list and details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="clients-toolbar glass">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="clients-grid">
        {loading ? (
          <div>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state glass">
            <Users size={48} />
            <h3>No clients yet</h3>
            <p>Start by adding your first client to create invoices.</p>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="client-card glass">
              <div className="client-card-header">
                <div className="client-avatar">
                  {client.name.charAt(0)}
                </div>
                <button className="btn-icon">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="client-card-body">
                <h3>{client.name}</h3>
                <div className="client-info">
                  <Mail size={14} />
                  <span>{client.email}</span>
                </div>
                <div className="client-info">
                  <MapPin size={14} />
                  <span>{client.street_address || 'No address provided'}</span>
                </div>
              </div>
              <div className="client-card-footer">
                <button className="btn-text">View Invoices</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Client"
      >
        <form onSubmit={handleCreateClient} className="form-grid">
          <div className="input-group">
            <label>Client Name</label>
            <input 
              type="text" 
              placeholder="e.g. Acme Corp" 
              value={newClient.name}
              onChange={e => setNewClient({...newClient, name: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="client@example.com" 
              value={newClient.email}
              onChange={e => setNewClient({...newClient, email: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label>Street Address</label>
            <textarea 
              placeholder="123 Business Street, Lagos" 
              value={newClient.street_address}
              onChange={e => setNewClient({...newClient, street_address: e.target.value})}
              rows={3}
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Client</button>
        </form>
      </Modal>
    </div>
  );
};
