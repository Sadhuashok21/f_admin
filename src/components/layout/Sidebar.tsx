import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Rocket,
  Database,
  Music,
  GraduationCap,
  Hammer,
  TrainTrack,
  ScrollText,
  Users,
  CreditCard,
  LogOut,
  ArrowLeft,
  Globe2,
  FolderTree,
  BellRing,
  Briefcase,
  BookOpen,
  Film,
  Building2,
  Code2,
  Languages,
  FolderGit2,
  Bug,
  Activity,
  FileCheck,
  BadgeIndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const pathname = location.pathname;

  // Determine which sub-menu we are in, if any
  const isSFS = pathname.startsWith('/sfs');
  const isSkiltrix = pathname.startsWith('/skiltrix');
  const isLogs = pathname.startsWith('/logs');

  const handleItemClick = () => {
    if (window.innerWidth < 768 && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/access-restricted');
  };

  // Render SFS specific sidebar if inside SFS routes
  if (isSFS) {
    return (
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div
          className="sidebar-header"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}
        >
          <ArrowLeft size={16} />
          <h2 style={{ color: '#93c5fd', margin: 0 }}>Back to Main Panel</h2>
        </div>

        <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          SFS Blueprints
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="/sfs" end className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Rocket size={18} />
              <span className="sidebar_icons_name">SFS Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/blueprints" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <FolderTree size={18} />
              <span className="sidebar_icons_name">Blueprints</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/planets" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Globe2 size={18} />
              <span className="sidebar_icons_name">Planets & Worlds</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/categories" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <FolderGit2 size={18} />
              <span className="sidebar_icons_name">Categories</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/users" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Users size={18} />
              <span className="sidebar_icons_name">SFS Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/notifications" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <BellRing size={18} />
              <span className="sidebar_icons_name">Push Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sfs/logs" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <ScrollText size={18} />
              <span className="sidebar_icons_name">SFS Logs</span>
            </NavLink>
          </li>
        </ul>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <button className="sidebar_item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none' }}>
              <LogOut size={18} color="var(--danger)" />
              <span className="sidebar_icons_name" style={{ color: 'var(--danger)' }}>Log out</span>
            </button>
          </div>
        )}
      </aside>
    );
  }

  // Render Skiltrix specific sidebar if inside Skiltrix routes
  if (isSkiltrix) {
    return (
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div
          className="sidebar-header"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}
        >
          <ArrowLeft size={16} />
          <h2 style={{ color: '#93c5fd', margin: 0 }}>Back to Main Panel</h2>
        </div>

        <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          SkilTrix Learning
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="/skiltrix" end className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <GraduationCap size={18} />
              <span className="sidebar_icons_name">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/internships" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Briefcase size={18} />
              <span className="sidebar_icons_name">Internships</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/courses" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <BookOpen size={18} />
              <span className="sidebar_icons_name">Courses</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/videos" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Film size={18} />
              <span className="sidebar_icons_name">Videos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/companies" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Building2 size={18} />
              <span className="sidebar_icons_name">Companies</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/code" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Code2 size={18} />
              <span className="sidebar_icons_name">Code Sandbox</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/languages" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Languages size={18} />
              <span className="sidebar_icons_name">Languages</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/file-system" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <FolderGit2 size={18} />
              <span className="sidebar_icons_name">File System</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/users" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Users size={18} />
              <span className="sidebar_icons_name">Skiltrix Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/submissions" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <FileCheck size={18} />
              <span className="sidebar_icons_name">Submissions</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/skiltrix/compiler-pricing" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <BadgeIndianRupee size={18} />
              <span className="sidebar_icons_name">ABAP Pricing & Coupons</span>
            </NavLink>
          </li>
        </ul>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <button className="sidebar_item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none' }}>
              <LogOut size={18} color="var(--danger)" />
              <span className="sidebar_icons_name" style={{ color: 'var(--danger)' }}>Log out</span>
            </button>
          </div>
        )}
      </aside>
    );
  }

  // Render Logs specific sidebar if inside Logs routes
  if (isLogs) {
    return (
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div
          className="sidebar-header"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}
        >
          <ArrowLeft size={16} />
          <h2 style={{ color: '#93c5fd', margin: 0 }}>Back to Main Panel</h2>
        </div>

        <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
          System Logs
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="/logs" end className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <ScrollText size={18} />
              <span className="sidebar_icons_name">All Logs</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/logs/errors" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Bug size={18} />
              <span className="sidebar_icons_name">Error Audit</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/logs/total-activity" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
              <Activity size={18} />
              <span className="sidebar_icons_name">Total Activity</span>
            </NavLink>
          </li>
        </ul>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <button className="sidebar_item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none' }}>
              <LogOut size={18} color="var(--danger)" />
              <span className="sidebar_icons_name" style={{ color: 'var(--danger)' }}>Log out</span>
            </button>
          </div>
        )}
      </aside>
    );
  }

  // Default Main Admin Panel Sidebar (matches backend sidebar.html)
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem' }}>
        <img
          src="/as_logo.webp"
          alt="Ascentracore Solutions"
          style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }}
        />
        <div>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '0.2px' }}>
            Admin
          </h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Ascentracore Solutions
          </div>
        </div>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" end className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <LayoutDashboard size={18} />
            <span className="sidebar_icons_name">Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/sfs" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <Rocket size={18} />
            <span className="sidebar_icons_name">SFS</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/database" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <Database size={18} />
            <span className="sidebar_icons_name">Database</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/sonicora" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <Music size={18} />
            <span className="sidebar_icons_name">SonicOra</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/skiltrix" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <GraduationCap size={18} />
            <span className="sidebar_icons_name">SkilTrix</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/krishi" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <Hammer size={18} />
            <span className="sidebar_icons_name">Krishi</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/transport-hub" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <TrainTrack size={18} />
            <span className="sidebar_icons_name">Transport Hub</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/logs" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <ScrollText size={18} />
            <span className="sidebar_icons_name">Logs</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/users" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <Users size={18} />
            <span className="sidebar_icons_name">Users</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/payments" className={({ isActive }) => `sidebar_item ${isActive ? 'active' : ''}`} onClick={handleItemClick}>
            <CreditCard size={18} />
            <span className="sidebar_icons_name">Payments</span>
          </NavLink>
        </li>
      </ul>

      {isAuthenticated && (
        <div className="sidebar-footer">
          <button className="sidebar_item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none' }}>
            <LogOut size={18} color="var(--danger)" />
            <span className="sidebar_icons_name" style={{ color: 'var(--danger)' }}>Log out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
