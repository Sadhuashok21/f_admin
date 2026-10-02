import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'New Blueprint Submission',
      message: 'User Suresh Raina submitted "Saturn V Reusable Booster" for review.',
      time: '10m ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'Database Spike Alert',
      message: 'High read activity recorded on table `sfs_blueprints`.',
      time: '1h ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Welcome to AS. Admin',
      message: 'System audit and logging services are fully synchronized.',
      time: '2h ago',
      type: 'success'
    }
  ];

  return (
    <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} />
          <span>Notifications (3)</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {notifications.map(n => (
          <div key={n.id} className="dropdown-item">
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {n.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
              {n.type === 'warning' && <AlertTriangle size={18} color="var(--warning)" />}
              {n.type === 'info' && <Info size={18} color="var(--primary)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {n.message}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.6rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={onClose}>
          Mark All As Read
        </button>
      </div>
    </div>
  );
};
