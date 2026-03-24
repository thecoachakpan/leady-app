import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '../../lib/supabase';
import { Save, User, Building2, CreditCard, Palette } from 'lucide-react';
import './Settings.css';
import { useBranding } from '../../lib/BrandingContext';

const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
};

export const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    profession: '',
    industry: '',
    phone: '',
    address: '',
    currency: 'NGN',
    website: ''
  });

  const { app_name, logo_url, primary_color, refreshBranding } = useBranding();
  const [appSettings, setAppSettings] = useState({
    app_name,
    logo_url,
    primary_color
  });

  const { data: profile, mutate: mutateProfile } = useSWR('profile', fetchProfile);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        business_name: profile.business_name || '',
        profession: profile.profession || '',
        industry: profile.industry || '',
        phone: profile.phone || '',
        address: profile.address || '',
        currency: profile.currency || 'NGN',
        website: profile.website || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...formData,
          updated_at: new Date()
        });

      if (error) throw error;
      mutateProfile();
      
      // Also update app settings
      const { data: currentSettings } = await supabase.from('app_settings').select('id').single();
      const { error: appError } = await supabase
        .from('app_settings')
        .upsert({ 
          id: currentSettings?.id,
          ...appSettings,
          updated_at: new Date()
        });
      
      if (appError) throw appError;
      
      // Refresh global branding
      await refreshBranding();

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your business identity and application preferences.</p>
      </div>

      <div className="settings-content">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-grid">
            {/* Business Profile Section */}
            <div className="settings-card glass">
              <div className="card-header">
                <Building2 size={20} />
                <h3>Business Profile</h3>
              </div>
              <div className="card-body">
                <div className="input-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Business Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Studio"
                    value={formData.business_name}
                    onChange={e => setFormData({...formData, business_name: e.target.value})}
                  />
                  <p className="input-hint">This will appear on all your invoices.</p>
                </div>
                <div className="input-group">
                  <label>Website</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Business Address</label>
                  <textarea 
                    placeholder="Physical address for your invoices"
                    rows={3}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="settings-card glass">
              <div className="card-header">
                <User size={20} />
                <h3>Contact Information</h3>
              </div>
              <div className="card-body">
                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+234 ..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Profession</label>
                  <input 
                    type="text" 
                    value={formData.profession}
                    onChange={e => setFormData({...formData, profession: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* App Branding Section */}
            <div className="settings-card glass box-highlight">
              <div className="card-header">
                <Palette size={20} />
                <h3>App Branding (Whitelabel)</h3>
              </div>
              <div className="card-body">
                <div className="input-group">
                  <label>Public App Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My Website Builder"
                    value={appSettings.app_name}
                    onChange={e => setAppSettings({...appSettings, app_name: e.target.value})}
                  />
                  <p className="input-hint">This name appears in the browser tab and sidebar.</p>
                </div>
                <div className="input-group">
                  <label>Primary Brand Color</label>
                  <div className="color-input-wrapper">
                    <input 
                      type="color" 
                      value={appSettings.primary_color}
                      onChange={e => setAppSettings({...appSettings, primary_color: e.target.value})}
                    />
                    <input 
                      type="text" 
                      value={appSettings.primary_color}
                      onChange={e => setAppSettings({...appSettings, primary_color: e.target.value})}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Logo URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={appSettings.logo_url}
                    onChange={e => setAppSettings({...appSettings, logo_url: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="settings-card glass">
              <div className="card-header">
                <CreditCard size={20} />
                <h3>Preferences</h3>
              </div>
              <div className="card-body">
                <div className="input-group">
                  <label>Default Currency</label>
                  <select 
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            {message.text && (
              <div className={`status-message ${message.type}`}>
                {message.text}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
