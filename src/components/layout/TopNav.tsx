import React, { useState } from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDrawer } from './ProfileDrawer';

interface TopNavProps {
  onToggleSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, login } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="upbar">
      <div className="upbar_con">
        <div className="upbar_grid" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </div>

        <div className="upbar_profile" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <img src="/as_logo.webp" alt="Ascentracore Solutions" className="upbar_profile_img" />
          <h1 className="heading-logo">
            Admin <span className="heading-sub">| Ascentracore Solutions</span>
          </h1>
        </div>
      </div>

      <div className="upbar_icons">
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => login()}
            style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: 0, cursor: 'pointer' }}
          >Sign in</button>
        )}
        <button
          className="icon_btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="icon_btn"
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowProfile(false);
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notification_badge">3</span>
          </button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="icon_btn"
            style={{ padding: '2px', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => {
              setShowProfile(prev => !prev);
              setShowNotifications(false);
            }}
            title="Account profile"
          >
            <img
              src={user?.profile || '/as_logo.webp'}
              alt="Profile"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </button>
          <ProfileDrawer isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </div>
      </div>
    </header>
  );
};
