import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Upload, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../../services/api';
import { initialBlueprints } from '../../data/mockData';
import { Blueprint } from '../../types';
import { Modal } from '../../components/common/Modal';
import { getSfsImageUrl } from '../../utils/cdn';

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
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [uploadingImg, setUploadingImg] = useState(false);
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

        let allImgs: string[] = [];
        if (bp.images && Array.isArray(bp.images) && bp.images.length > 0) {
          allImgs = bp.images.map(img => getSfsImageUrl(img));
        } else if (bp.image) {
          allImgs = [getSfsImageUrl(bp.image)];
        }
        setImages(allImgs.filter(Boolean));
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

  const handleUploadAdditionalImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImg(true);
    try {
      const fileArray = Array.from(files);
      const res = await api.uploadBlueprintImages(bpId, fileArray);
      if (res && res.status && res.images && res.images.length > 0) {
        setImages(res.images);
      } else {
        const newUrls = fileArray.map(f => URL.createObjectURL(f));
        setImages(prev => [...prev, ...newUrls]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to upload screenshots:', err);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoveImage = async (imgUrl: string, index: number) => {
    if (images.length <= 1) {
      alert("At least one screenshot must be retained as the cover image.");
      return;
    }
    if (!window.confirm("Remove this screenshot from the blueprint gallery?")) return;
    try {
      await api.deleteBlueprintImage(bpId, imgUrl);
    } catch (e) {
      console.error("Delete screenshot error:", e);
    }
    setImages(prev => prev.filter((_, idx) => idx !== index));
    if (activePreviewIdx >= index && activePreviewIdx > 0) {
      setActivePreviewIdx(activePreviewIdx - 1);
    }
  };

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
                <option value="mod">Mods & Addons</option>
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
              SFS Sharing Link <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <textarea
              id="sfs_link"
              className="form-textarea"
              value={sfsLink}
              onChange={e => setSfsLink(e.target.value)}
              placeholder="https://sharing.spaceflightsimulator.app/rocket/... (Optional)"
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

        {/* Gallery / Images (Multi-Screenshot Preview Gallery) */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="card-title">Craft Screenshots & Media Gallery</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ({images.length} screenshot{images.length !== 1 ? 's' : ''})
              </span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(true)}>
              <Upload size={14} />
              <span>+ Add Screenshots</span>
            </button>
          </div>

          {images.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Main Active Screenshot Preview */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '280px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={images[activePreviewIdx] || images[0]}
                  alt={`Preview ${activePreviewIdx + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />

                {/* Badge Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: activePreviewIdx === 0 ? 'rgba(37,99,235,0.92)' : 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  {activePreviewIdx === 0 ? '★ Primary Cover Image' : `Screenshot #${activePreviewIdx + 1}`}
                </div>

                {/* Left / Right Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePreviewIdx(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Previous screenshot"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewIdx(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Next screenshot"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Remove current button if more than 1 */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(images[activePreviewIdx], activePreviewIdx)}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(239,68,68,0.92)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Remove this screenshot"
                  >
                    <Trash2 size={13} />
                    <span>Delete Screenshot</span>
                  </button>
                )}
              </div>

              {/* Thumbnails Row */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePreviewIdx(i)}
                    style={{
                      position: 'relative',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: i === activePreviewIdx ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                      width: '85px',
                      height: '60px',
                      cursor: 'pointer',
                      opacity: i === activePreviewIdx ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                      background: '#090d16'
                    }}
                  >
                    <img
                      src={img}
                      alt={`Screenshot ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {i === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: '#2563eb',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: 700,
                          textAlign: 'center',
                          lineHeight: '12px'
                        }}
                      >
                        COVER
                      </span>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    width: '85px',
                    height: '60px',
                    borderRadius: '6px',
                    border: '1px dashed var(--border-color)',
                    background: 'var(--surface-color)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    gap: '2px'
                  }}
                  title="Add more screenshots"
                >
                  <Upload size={14} />
                  <span>+ Add</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No screenshots available.
            </div>
          )}
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

      {/* Upload Image Modal with Multi-File Support */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Craft Screenshots">
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
              cursor: uploadingImg ? 'wait' : 'pointer',
              background: 'var(--bg-color)'
            }}
          >
            {uploadingImg ? (
              <>
                <Loader2 size={36} className="animate-spin" color="var(--primary)" />
                <span style={{ marginTop: '0.75rem', fontWeight: 600 }}>Uploading screenshots to CDN...</span>
              </>
            ) : (
              <>
                <Upload size={36} color="var(--primary)" />
                <span style={{ marginTop: '0.75rem', fontWeight: 600 }}>Click to browse one or multiple image files</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports PNG, JPG, WEBP (multiple selection enabled)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImg}
              style={{ display: 'none' }}
              onChange={e => handleUploadAdditionalImages(e.target.files)}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
};
