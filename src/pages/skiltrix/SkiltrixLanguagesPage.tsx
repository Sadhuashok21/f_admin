import React, { useState } from 'react';
import { Plus, Languages, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { initialLanguages } from '../../data/mockData';
import { Language } from '../../types';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';

export const SkiltrixLanguagesPage: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [languageName, setLanguageName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const data = await api.getLanguages();
      if (data && data.length > 0) {
        setLanguages(data);
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLanguages();
  }, []);

  const [actionLoading, setActionLoading] = useState(false);

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await api.createLanguage({
        name: languageName,
        status
      });
      setLanguages(prev => [...prev, created]);
      setIsModalOpen(false);
      setLanguageName('');
    } catch (err) {
      console.error('Failed to create language:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this language configuration?')) {
      try {
        await api.deleteLanguage(id);
        setLanguages(prev => prev.filter(l => l.language_id !== id));
      } catch (err) {
        console.error('Failed to delete language:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Supported Programming Languages</h1>
          <p className="page-subtitle">Configure runtime compilers, language tags, and submission execution flags</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchLanguages} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Language</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Language Name</th>
                <th>Language ID</th>
                <th>Created By</th>
                <th>Created At</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map(lang => (
                <tr key={lang.language_id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lang.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {lang.language_id}
                  </td>
                  <td>{lang.created_by}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{lang.created_at}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${lang.status}`}>{lang.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="action-btn delete" onClick={() => handleDelete(lang.language_id)} title="Delete Language">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Language Modal matching languages.html */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Programming Language">
        <form onSubmit={handleAddLanguage}>
          <div className="form-group">
            <label className="form-label" htmlFor="lang_name">
              Language <span className="star">*</span>
            </label>
            <input
              type="text"
              id="lang_name"
              className="form-input"
              placeholder="e.g. Rust, Kotlin, Go..."
              value={languageName}
              onChange={e => setLanguageName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lang_status">
              Status <span className="star">*</span>
            </label>
            <select
              id="lang_status"
              className="form-select"
              value={status}
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              <span>{actionLoading ? 'Saving...' : 'Add Language'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
