import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Upload, CheckCircle2 } from 'lucide-react';
import { initialMovies } from '../../data/mockData';

export const SonicoraSongUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [songName, setSongName] = useState('');
  const [movieName, setMovieName] = useState(initialMovies[0]?.movie_name || '');
  const [heroName, setHeroName] = useState(initialMovies[0]?.hero || '');
  const [singer, setSinger] = useState('');
  const [language, setLanguage] = useState('Telugu');
  const [duration, setDuration] = useState('3:45');
  const [category, setCategory] = useState('Melody');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/sonicora');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">Song Track Upload</h1>
            <p className="page-subtitle">Upload master audio recording and associate with movie album</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Song track uploaded and cataloged successfully! Redirecting...</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="movie_se">
                Select Movie Album <span className="star">*</span>
              </label>
              <select
                id="movie_se"
                className="form-select"
                value={movieName}
                onChange={e => {
                  setMovieName(e.target.value);
                  const found = initialMovies.find(m => m.movie_name === e.target.value);
                  if (found) setHeroName(found.hero);
                }}
                required
              >
                {initialMovies.map(m => (
                  <option key={m.movie_id} value={m.movie_name}>
                    {m.movie_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hero_name">
                Lead Actor / Hero <span className="star">*</span>
              </label>
              <input
                type="text"
                id="hero_name"
                className="form-input"
                value={heroName}
                onChange={e => setHeroName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="song_name">
              Song Title <span className="star">*</span>
            </label>
            <input
              type="text"
              id="song_name"
              className="form-input"
              placeholder="e.g. Naatu Naatu"
              value={songName}
              onChange={e => setSongName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="singer">
                Playback Singer(s) <span className="star">*</span>
              </label>
              <input
                type="text"
                id="singer"
                className="form-input"
                placeholder="e.g. Sid Sriram, Shreya Ghoshal"
                value={singer}
                onChange={e => setSinger(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="language">
                Language <span className="star">*</span>
              </label>
              <input
                type="text"
                id="language"
                className="form-input"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="music_file">
              Audio File (FLAC, MP3, WAV) <span className="star">*</span>
            </label>
            <input
              type="file"
              id="music_file"
              className="form-input"
              accept="audio/*"
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="duration">
                Track Duration
              </label>
              <input
                type="text"
                id="duration"
                className="form-input"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Genre Category <span className="star">*</span>
              </label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="Melody">Melody</option>
                <option value="Dance / Mass">Dance / Mass</option>
                <option value="Devotional">Devotional</option>
                <option value="Classical">Classical</option>
                <option value="Folk">Folk</option>
                <option value="Romantic">Romantic</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <Upload size={16} />
              <span>Upload Song Track</span>
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
