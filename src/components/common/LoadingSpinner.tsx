import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Retrieving from database...',
  size = 28,
  inline = false,
}) => {
  if (inline) {
    return (
      <span className="loading-spinner-inline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Loader2 className="admin-spin" size={size} />
        {message && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{message}</span>}
      </span>
    );
  }

  return (
    <div
      className="loading-spinner-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '12px',
        color: 'var(--primary)',
        width: '100%'
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="admin-spin" size={size} />
      </div>
      {message && (
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.01em'
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};
