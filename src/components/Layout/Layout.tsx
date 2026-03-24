import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Layout.css';

export const Layout = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">L</div>
            <span className="logo-text">Leady</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Clients</span>
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Receipt size={20} />
            <span>Invoices</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="search-bar glass">
            <input type="text" placeholder="Search invoices, clients..." />
          </div>
          <div className="user-profile">
            <div className="avatar">VA</div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};
