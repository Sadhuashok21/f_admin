import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Upload,
  Lock,
  CheckCircle,
  AlertCircle,
  Camera,
  Save,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserProfilePage: React.FC = () => {
  const { user, login } = useAuth();

  // Profile Information Form State
  const [fullName, setFullName] = useState(user?.name || 'Sadhu Ashok Kumar');
  const [email] = useState(user?.email || 'ashok@ascentracoresolutions.com');
  const [profilePreview, setProfilePreview] = useState<string>(
    user?.profile || '/as_logo.webp'
  );
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Update Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Handle Profile Photo Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Profile Form Submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Full name cannot be blank.');
      return;
    }

    if (user) {
      login({
        ...user,
        name: fullName,
        profile: profilePreview
      });
    }

    setProfileSuccessMsg('Profile information updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Handle Password Form Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccessMsg('');

    if (newPassword.length <= 7) {
      setPasswordError('Password must be greater than 7 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and Confirm password do not match.');
      return;
    }

    // Success simulation
    setPasswordSuccessMsg('Password has been updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ textTransform: 'capitalize' }}>Your Profile</h1>
          <p className="page-subtitle">
            Welcome back <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{user?.name || 'Administrator'}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Card & Photo Banner */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '1.25rem' }}>
            <img
              src={profilePreview}
              alt="Profile Avatar"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--border-color)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              title="Upload new avatar"
            >
              <Camera size={18} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 700 }}>{user?.name || 'Sadhu Ashok Kumar'}</h2>
          <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{email}</p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <Shield size={15} />
            <span>Administrator</span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Role Clearance:</span>
              <span style={{ fontWeight: 600 }}>Superuser / Root</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Platform Access:</span>
              <span style={{ fontWeight: 600 }}>All (SFS, Skiltrix, SonicOra)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
              <span style={{ fontWeight: 600 }}>Ascentracore Solutions</span>
            </div>
          </div>
        </div>

        {/* Update Profile Information Form (matching backend user_profile.html) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <UserIcon size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Update Profile Information</h2>
          </div>

          {profileSuccessMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <CheckCircle size={18} />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={email}
                readOnly
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Email is tied to your primary admin account and cannot be modified.
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Profile Photo
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
              >
                <Save size={16} />
                <span>Update Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Update Password Form (matching backend user_profile.html) */}
      <div className="card" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <KeyRound size={20} color="#eab308" />
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Update Password</h2>
        </div>

        {passwordError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <CheckCircle size={18} />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
              Old Password *
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-row-2col" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                New Password *
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '0.65rem 0.9rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Password must be greater than 7 characters and contain letters and numbers.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
            >
              <Lock size={16} />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
