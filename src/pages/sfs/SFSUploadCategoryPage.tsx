import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialCategories } from '../../data/mockData';
import { BlueprintCategory } from '../../types';

export const SFSUploadCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'approved' | 'disapproved'>('approved');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editId) {
      api.getCategories().then(cats => {
        const found = cats.find(c => String(c.id) === editId);
        if (found) {
          setName(found.bp_name);
          setDescription(found.bp_para);
          setImageUrl(found.bp_img);
          setStatus(found.status);
        }
      });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCategory({
        name,
        description,
        image: imageUrl
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/sfs/categories');
      }, 1200);
    } catch {
      alert('Failed to save category.');
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="page-title">{editId ? 'Edit Category' : 'Upload Category'}</h1>
            <p className="page-subtitle">Configure blueprint category collection and metadata</p>
          </div>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Category {editId ? 'updated' : 'created'} successfully! Redirecting...</span>
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
              placeholder="Describe the type of craft and payloads in this category..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cat_img">
              Banner Image URL <span className="star">*</span>
            </label>
            <input
              type="url"
              id="cat_img"
              className="form-input"
              placeholder="https://..."
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
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

          <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving Category...' : 'Save Category'}</span>
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
