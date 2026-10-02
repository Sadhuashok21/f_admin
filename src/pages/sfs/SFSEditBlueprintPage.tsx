import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialBlueprints } from '../../data/mockData';
import { Blueprint } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SFSEditBlueprintPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const bpId = queryParams.get('bp_id') || 'bp_saturn_v';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<string>('blueprint');
  const [sfsLink, setSfsLink] = useState('');
  const [status, setStatus] = useState<Blueprint['status']>('approved');

  // Real metrics (read only)
  const [realViews, setRealViews] = useState(0);
  const [realLikes, setRealLikes] = useState(0);
  const [realDownloads, setRealDownloads] = useState(0);
  const [realShares, setRealShares] = useState(0);

  // Fake / boosted metrics (editable by admin)
  const [fakeViews, setFakeViews] = useState(0);
  const [fakeLikes, setFakeLikes] = useState(0);
  const [fakeDownloads, setFakeDownloads] = useState(0);
  const [fakeShares, setFakeShares] = useState(0);

  const [images, setImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadBlueprint = async () => {
      setLoading(true);
      try {
        let bp = await api.getBlueprint(bpId);
        if (!bp) {
          bp = initialBlueprints.find(b => b.bp_id === bpId) || initialBlueprints[0];
        }
        setBlueprint(bp);
        setName(bp.name);
        setType(bp.type || 'blueprint');
        setSfsLink(bp.sfs_link || '');
        setStatus(bp.status);

        setRealViews(bp.views || 0);
        setRealLikes(bp.likes || 0);
        setRealDownloads(bp.downloads || 0);
        setRealShares(bp.share || 0);

        setFakeViews(bp.fviews ?? bp.views);
        setFakeLikes(bp.flikes ?? bp.likes);
        setFakeDownloads(bp.fdownloads ?? bp.downloads);
        setFakeShares(bp.fshare ?? (bp.share || 0));

        setImages([
          bp.image,
          'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400',
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'
        ].filter(Boolean));
      } catch {
        const fallback = initialBlueprints.find(b => b.bp_id === bpId) || initialBlueprints[0];
        setBlueprint(fallback);
        setName(fallback.name);
        setType(fallback.type);
        setSfsLink(fallback.sfs_link || '');
        setStatus(fallback.status);
      } finally {
        setLoading(false);
      }
    };

    loadBlueprint();
  }, [bpId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateBlueprint(bpId, {
        name,
        type: type as Blueprint['type'],
        status,
        sfs_link: sfsLink,
        fviews: Number(fakeViews),
        flikes: Number(fakeLikes),
        fdownloads: Number(fakeDownloads),
        fshare: Number(fakeShares)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert('Failed to save blueprint changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blueprint permanently?')) {
      try {
        await api.deleteBlueprint(bpId);
        navigate('/sfs/blueprints');
      } catch {
        alert('Failed to delete blueprint.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading blueprint #{bpId} from database...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">Edit Blueprint: {name}</h1>
            <p className="page-subtitle">ID: {bpId} • Adjust visibility, status, and community boosting metrics</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Delete Blueprint</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Blueprint details saved successfully to database!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Craft Information</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="bp_name">
                Blueprint Name <span className="star">*</span>
              </label>
              <input
                type="text"
                id="bp_name"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bp_type">
                Type <span className="star">*</span>
              </label>
              <select
                id="bp_type"
                className="form-select"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="blueprint">Rocket Blueprint</option>
                <option value="planet">Planet & Custom Worlds</option>
                <option value="bp">General SFS Craft</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bp_status">
                Approval Status <span className="star">*</span>
              </label>
              <select
                id="bp_status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as Blueprint['status'])}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending Review</option>
                <option value="disapproved">Disapproved</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sfs_link">
              SFS Sharing Link <span className="star">*</span>
            </label>
            <textarea
              id="sfs_link"
              className="form-textarea"
              value={sfsLink}
              onChange={e => setSfsLink(e.target.value)}
              placeholder="https://sharing.spaceflightsimulator.app/rocket/..."
              required
            />
          </div>
        </div>

        {/* Real vs Fake Metrics Grid matching edit_bp.html .real_fake */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Metrics & Analytics (Real vs Admin Boosted)</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Real Metrics Column */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>
                REAL COMMUNITY METRICS (Read-only)
              </h3>

              <div className="form-group">
                <label className="form-label">Real Views</label>
                <input type="number" className="form-input" value={realViews} readOnly style={{ background: 'rgba(0,0,0,0.05)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Real Likes</label>
                <input type="number" className="form-input" value={realLikes} readOnly style={{ background: 'rgba(0,0,0,0.05)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Real Downloads</label>
                <input type="number" className="form-input" value={realDownloads} readOnly style={{ background: 'rgba(0,0,0,0.05)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Real Shares</label>
                <input type="number" className="form-input" value={realShares} readOnly style={{ background: 'rgba(0,0,0,0.05)' }} />
              </div>
            </div>

            {/* Fake / Display Metrics Column */}
            <div style={{ background: 'rgba(37, 99, 235, 0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                DISPLAY BOOSTED METRICS (Publicly Shown)
              </h3>

              <div className="form-group">
                <label className="form-label" htmlFor="fake_views">Fake Views <span className="star">*</span></label>
                <input
                  type="number"
                  id="fake_views"
                  className="form-input"
                  value={fakeViews}
                  onChange={e => setFakeViews(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fake_likes">Fake Likes <span className="star">*</span></label>
                <input
                  type="number"
                  id="fake_likes"
                  className="form-input"
                  value={fakeLikes}
                  onChange={e => setFakeLikes(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fake_downloads">Fake Downloads <span className="star">*</span></label>
                <input
                  type="number"
                  id="fake_downloads"
                  className="form-input"
                  value={fakeDownloads}
                  onChange={e => setFakeDownloads(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fake_shares">Fake Shares <span className="star">*</span></label>
                <input
                  type="number"
                  id="fake_shares"
                  className="form-input"
                  value={fakeShares}
                  onChange={e => setFakeShares(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery / Images matching edit_bp.html and blueprint.html */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Craft Screenshots & Media</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(true)}>
              <Upload size={14} />
              <span>Upload New Image</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img
                  src={img}
                  alt={`Screenshot ${i + 1}`}
                  style={{ width: '160px', height: '110px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Blueprint Changes'}</span>
          </button>
          <Link to="/sfs/blueprints" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {/* Upload Image Modal matching change_interface */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Craft Screenshot">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--border-color)',
              borderRadius: '10px',
              padding: '2.5rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={36} color="var(--primary)" />
            <span style={{ marginTop: '0.75rem', fontWeight: 600 }}>Click to browse image files</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 5MB</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  setImages(prev => [...prev, url]);
                  setIsModalOpen(false);
                }
              }}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
};
