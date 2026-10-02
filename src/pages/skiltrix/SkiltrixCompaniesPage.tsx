import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialCompanies } from '../../data/mockData';
import { Company } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data && data.length > 0 ? data : initialCompanies);
    } catch {
      setCompanies(initialCompanies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleUploadCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(65);
      const created = await api.createCompany({
        name,
        description,
        image: imagePreview
      });

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setCompanies(prevList => [created, ...prevList]);
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setImagePreview('');
        setUploadProgress(0);
      }, 300);
    } catch (err) {
      console.error('Failed to create company:', err);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this company partner?')) {
      try {
        await api.deleteCompany(id);
        setCompanies(prev => prev.filter(c => c.company_id !== id));
      } catch (err) {
        console.error('Failed to delete company:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Companies Directory</h1>
          <p className="page-subtitle">Manage corporate hiring partners, recruitment profiles, and branding</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchCompanies} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Loading partner companies...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Company ID</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Active Positions</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(comp => (
                  <tr key={comp.company_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={comp.image}
                          alt={comp.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{comp.name}</div>
                      </div>
                    </td>

                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {comp.company_id}
                    </td>

                    <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {comp.description}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {comp.internships_count || 1}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{comp.created_at}</td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${comp.status}`}>{comp.status}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(comp.company_id)}
                          title="Delete Company"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Company Modal matching backend upload_company */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hiring Partner">
        <form onSubmit={handleUploadCompany}>
          <div className="form-group">
            <label className="form-label" htmlFor="company_name">
              Company Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="company_name"
              className="form-input"
              placeholder="e.g. Ascentracore Technologies"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="company_desc">
              Company Overview & Focus <span className="star">*</span>
            </label>
            <textarea
              id="company_desc"
              className="form-textarea"
              placeholder="Brief summary of company domain and technologies..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Brand Logo <span className="star">*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  required={!imagePreview}
                />
              </label>
            </div>
          </div>

          {isUploading && (
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Saving company...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              Create Partner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
