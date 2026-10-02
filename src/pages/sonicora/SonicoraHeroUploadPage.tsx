import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';

export const SonicoraHeroUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroName, setHeroName] = useState('');
  const [role, setRole] = useState<'Hero / Actor' | 'Heroine / Actress' | 'Director' | 'Music Director'>('Hero / Actor');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/sonicora');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">Artist & Actor Directory</h1>
            <p className="page-subtitle">Register film artists, lead stars, and music directors</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Artist registered successfully! Redirecting...</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="hero_type">
              Artist Role Category <span className="star">*</span>
            </label>
            <select
              id="hero_type"
              className="form-select"
              value={role}
              onChange={e => setRole(e.target.value as any)}
            >
              <option value="Hero / Actor">Hero / Lead Actor</option>
              <option value="Heroine / Actress">Heroine / Lead Actress</option>
              <option value="Music Director">Music Director / Composer</option>
              <option value="Director">Film Director</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="song_name">
              Artist Full Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="song_name"
              className="form-input"
              placeholder="e.g. Mahesh Babu, Anushka Shetty, A.R. Rahman"
              value={heroName}
              onChange={e => setHeroName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Register Artist</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
