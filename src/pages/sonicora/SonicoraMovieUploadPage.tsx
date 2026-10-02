import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Upload, CheckCircle2 } from 'lucide-react';

export const SonicoraMovieUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState('');
  const [hero, setHero] = useState('');
  const [heroine, setHeroine] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/sonicora');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">Movie Upload</h1>
            <p className="page-subtitle">Publish a new cinema title and album soundtrack to SonicOra</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Movie metadata and poster uploaded successfully! Redirecting...</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="movie_name">
              Movie Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="movie_name"
              className="form-input"
              placeholder="e.g. Baahubali 3: Before the Beginning"
              value={movieName}
              onChange={e => setMovieName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="movie_img">
              Movie Poster Image <span className="star">*</span>
            </label>
            <input
              type="file"
              id="movie_img"
              className="form-input"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          {posterPreview && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <img
                src={posterPreview}
                alt="Poster Preview"
                style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
          )}

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="hero">
                Star Hero / Lead Actor <span className="star">*</span>
              </label>
              <input
                type="text"
                id="hero"
                className="form-input"
                placeholder="e.g. Prabhas, NTR Jr, Mahesh Babu"
                value={hero}
                onChange={e => setHero(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="heroine">
                Lead Actress / Heroine <span className="star">*</span>
              </label>
              <input
                type="text"
                id="heroine"
                className="form-input"
                placeholder="e.g. Anushka Shetty, Alia Bhatt"
                value={heroine}
                onChange={e => setHeroine(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="release_year">
              Release Year <span className="star">*</span>
            </label>
            <input
              type="number"
              id="release_year"
              className="form-input"
              min="1950"
              max="2035"
              value={releaseYear}
              onChange={e => setReleaseYear(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <Upload size={16} />
              <span>Upload Movie</span>
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
