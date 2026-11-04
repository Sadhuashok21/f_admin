import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, Loader2, Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { getSfsImageUrl } from '../../utils/cdn';

export const SFSUploadCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [existingImg, setExistingImg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'approved' | 'disapproved'>('approved');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      api.getCategories().then(cats => {
        const found = cats.find(c => String(c.id) === editId || String((c as any).category_id) === editId);
        if (found) {
          setName(found.bp_name);
          setDescription(found.bp_para);
          setExistingImg(found.bp_img);
          if (found.bp_img) {
            setImagePreview(getSfsImageUrl(found.bp_img));
          }
          setStatus(found.status);
        }
      });
    }
  }, [editId]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    setErrorMessage(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (editId && existingImg) {
      setImagePreview(getSfsImageUrl(existingImg));
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      setErrorMessage('Please enter a category name.');
      return;
    }

    if (!editId && !imageFile) {
      setErrorMessage('Please choose a local banner image to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (editId) {
        formData.append('id', editId);
      }

      const res = await api.createCategory(formData);
      if (res && (res as any).status === false) {
        throw new Error((res as any).error || 'Failed to save category');
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/sfs/categories');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="page-title">{editId ? 'Edit Category' : 'Upload Category'}</h1>
            <p className="page-subtitle">Configure blueprint category collection and upload banner image directly to S3</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: '8px', color: '#22c55e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>Category {editId ? 'updated' : 'created'} successfully! Image uploaded to S3. Redirecting...</span>
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
          <div className="form-group">
            <label className="form-label" htmlFor="cat_name">
              Category Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="cat_name"
              className="form-input"
              placeholder="e.g. Orbital Space Stations"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cat_para">
              Category Description <span className="star">*</span>
            </label>
            <textarea
              id="cat_para"
              className="form-textarea"
              rows={3}
              placeholder="Describe the craft types, missions, and payloads in this category..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Local Banner Image File Upload Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="cat_img_file">
              Banner Image <span className="star">*</span>
            </label>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Select a local image from your device. It will be uploaded directly to the S3 bucket via boto3.
            </span>

            <input
              ref={fileInputRef}
              type="file"
              id="cat_img_file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFileInputChange}
            />

            {imagePreview ? (
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary, #1a2234)',
                  position: 'relative'
                }}
              >
                <div style={{ height: '200px', width: '100%', position: 'relative', background: '#0a0f1d' }}>
                  <img
                    src={imagePreview}
                    alt="Category Banner Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ImageIcon size={14} />
                    {imageFile ? `Local: ${imageFile.name} (${formatFileSize(imageFile.size)})` : `Existing Banner Image`}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {imageFile ? 'Ready to upload to S3 upon saving' : 'Current image on CDN'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>{imageFile ? 'Change File' : 'Replace Image'}</span>
                    </button>
                    {imageFile && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={handleRemoveImage}
                        title="Remove selection"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--primary, #38bdf8)' : 'var(--border-color)'}`,
                  background: isDragging ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary, #1a2234)',
                  borderRadius: '10px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    margin: '0 auto 12px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary, #38bdf8)'
                  }}
                >
                  <Upload size={24} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                  Click to select local image or drag & drop here
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, JPEG, WEBP • Max 15MB
                </div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="cat_status">
              Approval Status <span className="star">*</span>
            </label>
            <select
              id="cat_status"
              className="form-select"
              value={status}
              onChange={e => setStatus(e.target.value as 'approved' | 'disapproved')}
            >
              <option value="approved">Approved & Live</option>
              <option value="disapproved">Disapproved / Hidden</option>
            </select>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to S3 & Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editId ? 'Update Category' : 'Upload & Save Category'}</span>
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
