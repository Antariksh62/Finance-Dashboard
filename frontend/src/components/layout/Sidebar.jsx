import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#01696f"/>
          <path d="M10 24 L18 12 L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M13 20 H23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>FinanceOS</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={18}/> Dashboard
        </NavLink>
        <NavLink to="/records" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <FileText size={18}/> Records
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={18}/> Users
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0]}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className={`role-badge role-${user?.role}`}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <LogOut size={18}/>
        </button>
      </div>
    </aside>
  );
}