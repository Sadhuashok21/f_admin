import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Upload, CheckCircle2 } from 'lucide-react';
import { validateAdminUploadSize, formatFileSize } from '../../utils/uploadLimit';

export const SonicoraSongUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [songName, setSongName] = useState('');
  const [movieName, setMovieName] = useState('');
  const [heroName, setHeroName] = useState('');
  const [singer, setSinger] = useState('');
  const [language, setLanguage] = useState('Telugu');
  const [duration, setDuration] = useState('3:45');
  const [category, setCategory] = useState('Melody');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateAdminUploadSize(file);
      if (!check.valid) {
        setFileError(check.error || 'Audio file exceeds the 1 GB admin limit.');
        e.target.value = '';
        setAudioFile(null);
        return;
      }
      setFileError(null);
      setAudioFile(file);
      if (!songName) {
        setSongName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } else {
      setAudioFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) return;
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
                Movie Album Title <span className="star">*</span>
              </label>
              <input
                type="text"
                id="movie_se"
                className="form-control"
                value={movieName}
                onChange={e => setMovieName(e.target.value)}
                placeholder="Enter movie title"
                required
              />
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
              onChange={handleAudioChange}
              required
            />
            {audioFile && (
              <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '4px' }}>
                Selected: {audioFile.name} ({formatFileSize(audioFile.size)})
              </p>
            )}
            {fileError && (
              <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>
                {fileError}
              </p>
            )}
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Admin Panel Upload Limit: up to 1 GB per audio master
            </span>
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
