import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessRestrictedPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    login({
      name: 'Sadhu Ashok Kumar',
      email: 'ashok@ascentracoresolutions.com',
      role: 'Administrator'
    });
    navigate('/');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <img
          src="/as_logo.webp"
          alt="Ascentracore Solutions"
          style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'contain', marginBottom: '1rem', border: '1px solid var(--border-color)', padding: '4px', background: 'var(--bg-card)' }}
        />
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--danger)',
            marginBottom: '1.25rem'
          }}
        >
          <ShieldX size={38} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Access Restricted
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
          You do not have the required permissions or your administrative session has expired. Please authenticate to gain access to the Ascentracore Solutions Admin Portal.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSignIn}>
            <Lock size={16} />
            <span>Authenticate as Administrator</span>
            <ArrowRight size={16} />
          </button>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/')}>
            <span>Return to Public Site</span>
          </button>
        </div>
      </div>
    </div>
  );
};
