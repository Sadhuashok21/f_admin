import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, LogOut, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="dropdown-menu" onClick={e => e.stopPropagation()} style={{ width: '280px' }}>
      <div className="dropdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span>Account</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={user?.profile || '/as_logo.webp'}
          alt={user?.name || 'Admin'}
          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {user?.name || 'Administrator'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {user?.email || 'admin@ascentracore.com'}
          </div>
        </div>
      </div>

      <div style={{ padding: '0.4rem 0' }}>
        <div
          className="dropdown-item"
          onClick={() => {
            navigate('/profile');
            onClose();
          }}
        >
          <User size={16} color="var(--primary)" />
          <span>View Profile</span>
        </div>

        <div
          className="dropdown-item"
          onClick={() => {
            navigate('/profile/log-activity');
            onClose();
          }}
        >
          <Activity size={16} color="var(--warning)" />
          <span>Log Activity</span>
        </div>

        <div
          className="dropdown-item"
          style={{ color: 'var(--danger)' }}
          onClick={() => {
            logout();
            navigate('/access-restricted');
            onClose();
          }}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </div>
      </div>
    </div>
  );
};
