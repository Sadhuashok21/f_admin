import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Image as ImageIcon, FileArchive, X } from 'lucide-react';
import { api } from '../../services/api';
import { BlueprintCategory } from '../../types';
import { validateAdminUploadSize, formatFileSize } from '../../utils/uploadLimit';

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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true);
      try {
        const cats = await api.getCategories();
        const available = cats || [];
        setCategories(available);
        // Pre-select first category as chip by default to guide the user
        if (available.length >= 1) {
          setSelectedCategories([String(available[0].category_id || available[0].id || available[0].bp_name)]);
        }
      } catch {
        setCategories([]);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setErrorMessage('Please select valid image files (PNG, JPG, WEBP, etc.)');
          return;
        }
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }

      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setErrorMessage(null);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePreviewIndex >= indexToRemove && activePreviewIndex > 0) {
      setActivePreviewIndex(activePreviewIndex - 1);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip') && !file.type.includes('zip')) {
        setErrorMessage('Please select a valid .zip file archive.');
        return;
      }
      const check = validateAdminUploadSize(file);
      if (!check.valid) {
        setErrorMessage(check.error || 'Zip archive exceeds the 1 GB admin upload limit.');
        return;
      }
      setZipFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter a craft, planet, or mod name.');
      return;
    }

    // Require at least one chip ONLY for blueprints (Planets and Worlds & Mods do not need chips)
    if (type === 'bp' && selectedCategories.length < 1) {
      setErrorMessage('Please select at least one category chip.');
      return;
    }

    if (type === 'bp' && !link.trim()) {
      setErrorMessage('Please enter the SFS Sharing Link.');
      return;
    }

    if (imageFiles.length === 0) {
      setErrorMessage('Please upload at least one screenshot or preview image.');
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

      // Primary cover screenshot
      formData.append('image', imageFiles[0]);
      // All preview gallery screenshots
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      formData.append('zip_file', zipFile);
      if (type === 'bp' && link.trim()) {
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
                  background: selectedCategories.length >= 1 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: selectedCategories.length >= 1 ? '#22c55e' : '#eab308',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {selectedCategories.length >= 1
                  ? `✓ ${selectedCategories.length} chip${selectedCategories.length > 1 ? 's' : ''} selected`
                  : `Please select at least 1 chip (0/1)`}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Click category chips to toggle selection. You must select at least 1 category chip.
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

            {selectedCategories.length < 1 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#eab308', marginTop: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Need to select at least 1 category chip before submitting.
              </span>
            )}
          </div>
          )}

          {/* Screenshots / Preview Images (Multi-Image Support) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="images" style={{ margin: 0 }}>
                {type === 'mod' ? 'Mod Cover & Screenshots' : 'Craft / Planet Screenshots'} <span className="star">*</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: imageFiles.length > 0 ? '#3b82f6' : 'var(--text-muted)', fontWeight: 600 }}>
                {imageFiles.length > 0
                  ? `${imageFiles.length} screenshot${imageFiles.length > 1 ? 's' : ''} selected (1st is cover)`
                  : 'Upload one or multiple images'}
              </span>
            </div>

            <input
              ref={imgInputRef}
              type="file"
              id="images"
              className="form-input"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: imagePreviews.length > 0 ? 'none' : 'block' }}
              required={imageFiles.length === 0}
            />

            {imagePreviews.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Active Main Preview Image */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '460px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#090d16' }}>
                  <img
                    src={imagePreviews[activePreviewIndex] || imagePreviews[0]}
                    alt="Active Preview"
                    style={{ width: '100%', height: '230px', objectFit: 'contain', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: activePreviewIndex === 0 ? 'rgba(37,99,235,0.92)' : 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.3px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {activePreviewIndex === 0 ? '★ Primary Cover' : `Screenshot #${activePreviewIndex + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(activePreviewIndex)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239,68,68,0.92)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Remove this image"
                  >
                    <X size={13} />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Thumbnails Strip */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {imagePreviews.map((previewUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      style={{
                        position: 'relative',
                        width: '74px',
                        height: '54px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: idx === activePreviewIndex ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                        opacity: idx === activePreviewIndex ? 1 : 0.7,
                        transition: 'all 0.15s ease',
                        background: '#090d16'
                      }}
                      title={idx === 0 ? 'Primary Cover Thumbnail' : `Screenshot #${idx + 1}`}
                    >
                      <img
                        src={previewUrl}
                        alt={`Thumb ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {idx === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: '#2563eb',
                            color: '#fff',
                            fontSize: '9px',
                            fontWeight: 700,
                            textAlign: 'center',
                            lineHeight: '13px'
                          }}
                        >
                          COVER
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add More Screenshots Button */}
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    style={{
                      width: '74px',
                      height: '54px',
                      borderRadius: '6px',
                      border: '1px dashed var(--border-color)',
                      background: 'var(--surface-color)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      gap: '2px'
                    }}
                    title="Upload more screenshots"
                  >
                    <Upload size={14} />
                    <span>+ Add</span>
                  </button>
                </div>
              </div>
            )}

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Select high resolution screenshots (PNG, JPG, WEBP). First screenshot will be used as the catalog cover.
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
              Upload SFS Blueprint .bp or custom mod zip package (Admin limit: up to 1 GB)
            </span>
          </div>

          {/* SFS Sharing Link - ONLY for Blueprints (Mandatory). Removed for Planet & World and Mod. */}
          {type === 'bp' && (
            <div className="form-group">
              <label className="form-label" htmlFor="link">
                SFS Sharing Link <span className="star">*</span>
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
          )}

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
