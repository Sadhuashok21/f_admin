import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Image as ImageIcon, FileArchive, X } from 'lucide-react';
import { api } from '../../services/api';
import { initialCategories } from '../../data/mockData';
import { BlueprintCategory } from '../../types';

export const SFSUploadBlueprintPage: React.FC = () => {
  const navigate = useNavigate();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<BlueprintCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeParam = queryParams.get('type');
  const initialType: 'bp' | 'pla' | 'mod' =
    typeParam === 'planet' || typeParam === 'pla' ? 'pla' :
    typeParam === 'mod' ? 'mod' : 'bp';
  const [type, setType] = useState<'bp' | 'pla' | 'mod'>(initialType);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [link, setLink] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true);
      try {
        const cats = await api.getCategories();
        const available = cats && cats.length > 0 ? cats : initialCategories;
        setCategories(available);
        // Pre-select first 2 categories as chips by default to guide the user
        if (available.length >= 2) {
          setSelectedCategories([
            String(available[0].category_id || available[0].id || available[0].bp_name),
            String(available[1].category_id || available[1].id || available[1].bp_name)
          ]);
        } else if (available.length === 1) {
          setSelectedCategories([String(available[0].category_id || available[0].id || available[0].bp_name)]);
        }
      } catch {
        setCategories(initialCategories);
        if (initialCategories.length >= 2) {
          setSelectedCategories([String(initialCategories[0].id), String(initialCategories[1].id)]);
        }
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const toggleCategory = (catIdentifier: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catIdentifier)) {
        return prev.filter(c => c !== catIdentifier);
      } else {
        return [...prev, catIdentifier];
      }
    });
    setErrorMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip') && !file.type.includes('zip')) {
        setErrorMessage('Please select a valid .zip file archive.');
        return;
      }
      setZipFile(file);
      setErrorMessage(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter a craft, planet, or mod name.');
      return;
    }

    // Require above two chips ONLY for blueprints (Planets and Worlds & Mods do not need chips)
    if (type === 'bp' && selectedCategories.length < 2) {
      setErrorMessage(`Please select above two category chips (minimum 2 categories required, currently ${selectedCategories.length} selected).`);
      return;
    }

    if (!imageFile) {
      setErrorMessage('Please upload a screenshot or preview image.');
      return;
    }

    if (!zipFile) {
      setErrorMessage('Please upload the blueprint or mod .zip archive file.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim() || `${name} (${type === 'mod' ? 'Mod' : type === 'pla' ? 'Planet Pack' : 'Blueprint'})`);
      formData.append('type', type);

      // Append each selected category chip ONLY for blueprints
      if (type === 'bp') {
        selectedCategories.forEach(cat => {
          formData.append('categories', cat);
        });
      }

      formData.append('image', imageFile);
      formData.append('zip_file', zipFile);
      if (link.trim()) {
        formData.append('sfs_link', link.trim());
      }

      const res = await api.uploadBlueprint(formData);
      if (res && (res as any).status === false) {
        throw new Error((res as any).message || 'Failed to upload blueprint');
      }

      setSubmitted(true);
      setTimeout(() => {
        if (type === 'mod') {
          navigate('/sfs/blueprints?type=mod');
        } else if (type === 'pla') {
          navigate('/sfs/blueprints?type=planet');
        } else {
          navigate('/sfs/blueprints');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">
              Upload {type === 'mod' ? 'Mod / Addon' : type === 'pla' ? 'Planet & World' : 'Blueprint'}
            </h1>
            <p className="page-subtitle">Publish a new rocket, custom planet pack, or community mod to SFS</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: '8px', color: '#22c55e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>
            {type === 'mod' ? 'Mod' : type === 'pla' ? 'Planet Pack' : 'Blueprint'} uploaded successfully! Redirecting...
          </span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Craft Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              {type === 'mod' ? 'Mod / Addon Name' : type === 'pla' ? 'Planet / World Pack Name' : 'Craft / Rocket Name'}{' '}
              <span className="star">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder={
                type === 'mod'
                  ? 'e.g. ISS Canadarm2 Robotic Arm Mod'
                  : type === 'pla'
                  ? 'e.g. Realistic Solar System 1:1'
                  : 'e.g. Starship Super Heavy Mk IV'
              }
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description <span className="star">*</span>
            </label>
            <textarea
              id="description"
              className="form-textarea"
              rows={3}
              placeholder={
                type === 'mod'
                  ? 'Describe mod features, compatibility, keybindings, and requirements...'
                  : 'Describe payload capability, stages, orbit profiles, and mission instructions...'
              }
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Type Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="type">
              Section / Content Type <span className="star">*</span>
            </label>
            <select
              id="type"
              className="form-select"
              value={type}
              onChange={e => setType(e.target.value as 'bp' | 'pla' | 'mod')}
              required
            >
              <option value="bp">Blueprints (Rockets, Landers & Craft)</option>
              <option value="pla">Planets and Worlds (Custom Systems & Textures)</option>
              <option value="mod">Mods and Addons (Custom Parts, Mechanics & Expansions)</option>
            </select>
          </div>

          {/* Category Chips Selection - ONLY for Blueprints (Planets and Worlds & Mods do not need chips) */}
          {type === 'bp' && (
            <div className="form-group" style={{ margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Categories (Chips Selection) <span className="star">*</span>
              </label>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: selectedCategories.length >= 2 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: selectedCategories.length >= 2 ? '#22c55e' : '#eab308',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {selectedCategories.length >= 2
                  ? `✓ ${selectedCategories.length} chips selected`
                  : `Please select above 2 chips (${selectedCategories.length}/2)`}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Click category chips to toggle selection. You must select <strong>above two chips</strong> (at least 2 categories).
            </p>

            {loadingCats ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Loading available categories...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0' }}>
                {categories.map(c => {
                  const catId = String(c.category_id || c.id || c.bp_name);
                  const isSelected = selectedCategories.includes(catId) || selectedCategories.includes(c.bp_name);
                  return (
                    <button
                      type="button"
                      key={c.id || c.category_id || c.bp_name}
                      onClick={() => toggleCategory(catId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-secondary, rgba(255, 255, 255, 0.04))',
                        color: isSelected ? '#38bdf8' : 'var(--text-color)',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{c.bp_name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedCategories.length < 2 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#eab308', marginTop: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Need to select at least 2 category chips before submitting.
              </span>
            )}
          </div>
          )}

          {/* Screenshots / Preview Image */}
          <div className="form-group">
            <label className="form-label" htmlFor="images">
              {type === 'mod' ? 'Mod Cover / Screenshot' : 'Craft / Planet Screenshots'}{' '}
              <span className="star">*</span>
            </label>
            <input
              ref={imgInputRef}
              type="file"
              id="images"
              className="form-input"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div style={{ marginTop: '10px', position: 'relative', width: 'fit-content' }}>
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (imgInputRef.current) imgInputRef.current.value = '';
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Select high resolution screenshots (PNG, JPG, WEBP)
            </span>
          </div>

          {/* Zip Archive */}
          <div className="form-group">
            <label className="form-label" htmlFor="zipfile">
              {type === 'mod' ? 'Mod Zip Archive (.zip)' : 'Blueprint Zip Archive (.zip)'}{' '}
              <span className="star">*</span>
            </label>
            <input
              ref={zipInputRef}
              type="file"
              id="zipfile"
              className="form-input"
              accept=".zip"
              onChange={handleZipChange}
              required
            />
            {zipFile && (
              <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileArchive size={14} />
                <span>{zipFile.name} ({formatFileSize(zipFile.size)})</span>
              </div>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Upload SFS Blueprint .bp or custom mod zip package
            </span>
          </div>

          {/* SFS Sharing Link (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="link">
              SFS Sharing Link <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <input
              type="url"
              id="link"
              className="form-input"
              placeholder={
                type === 'mod'
                  ? 'https://github.com/... or forum thread link (Optional)'
                  : 'https://sharing.spaceflightsimulator.app/rocket/... (Optional)'
              }
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to S3 & Publishing...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload {type === 'mod' ? 'Mod' : type === 'pla' ? 'Planet Pack' : 'Blueprint'}</span>
                </>
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
