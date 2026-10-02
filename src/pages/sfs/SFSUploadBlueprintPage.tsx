import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialCategories } from '../../data/mockData';
import { BlueprintCategory } from '../../types';

export const SFSUploadBlueprintPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlueprintCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [name, setName] = useState('');
  const [type, setType] = useState('bp');
  const [link, setLink] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true);
      try {
        const cats = await api.getCategories();
        setCategories(cats && cats.length > 0 ? cats : initialCategories);
        if (cats && cats.length > 0) {
          setSelectedCategory(cats[0].bp_name);
        }
      } catch {
        setCategories(initialCategories);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/sfs/blueprints');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">Upload Blueprint</h1>
            <p className="page-subtitle">Publish a new rocket or custom planet pack to SFS</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Blueprint uploaded successfully! Redirecting...</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Craft / Planet Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="e.g. Starship Super Heavy Mk IV"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="type">
                Type <span className="star">*</span>
              </label>
              <select
                id="type"
                className="form-select"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              >
                <option value="bp">Blueprint (Rocket / Craft)</option>
                <option value="pla">Planets and Worlds</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cat">
                Primary Category <span className="star">*</span>
              </label>
              <select
                id="cat"
                className="form-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                required
                disabled={loadingCats}
              >
                {loadingCats ? (
                  <option>Loading live categories...</option>
                ) : (
                  categories.map(c => (
                    <option key={c.id} value={c.bp_name}>
                      {c.bp_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="images">
              Craft Images / Screenshots <span className="star">*</span>
            </label>
            <input
              type="file"
              id="images"
              className="form-input"
              accept="image/*"
              multiple
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Select one or multiple craft screenshots in HD
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zipfile">
              Blueprint Zip Archive (.zip)
            </label>
            <input
              type="file"
              id="zipfile"
              className="form-input"
              accept=".zip"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Upload SFS Blueprint .bp or custom world zip folder
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="link">
              SFS App Sharing URL <span className="star">*</span>
            </label>
            <input
              type="url"
              id="link"
              className="form-input"
              placeholder="https://sharing.spaceflightsimulator.app/rocket/..."
              value={link}
              onChange={e => setLink(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              <Upload size={16} />
              <span>Upload Blueprint</span>
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
