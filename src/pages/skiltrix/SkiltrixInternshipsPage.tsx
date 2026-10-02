import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Calendar, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialInternships, initialCompanies } from '../../data/mockData';
import { Internship, Company } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixInternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [type, setType] = useState<'remote' | 'offline' | 'hybrid'>('remote');
  const [paid, setPaid] = useState<0 | 1>(0);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [internData, compData] = await Promise.all([
        api.getInternships(),
        api.getCompanies()
      ]);
      setInternships(internData && internData.length > 0 ? internData : initialInternships);
      const comps = compData && compData.length > 0 ? compData : initialCompanies;
      setCompanies(comps);
      if (comps.length > 0 && !companyId) {
        setCompanyId(comps[0].company_id);
      }
    } catch {
      setInternships(initialInternships);
      setCompanies(initialCompanies);
    } finally {
      setLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this internship posting?')) {
      setActionLoading(true);
      try {
        await api.deleteInternship(id);
        setInternships(prev => prev.filter(item => item.internship_id !== id));
      } catch (err) {
        console.error('Failed to delete internship:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const selectedComp = companies.find(c => c.company_id === companyId) || {
      name: 'Ascentracore Solutions',
      image: '/as_logo.webp'
    };

    try {
      const created = await api.createInternship({
        name,
        company_id: companyId,
        company: selectedComp,
        type,
        paid,
        price: paid === 1 ? Number(price) : undefined,
        location,
        apply_link: applyLink,
        description,
        deadline,
        status: 'active'
      });

      setInternships(prev => [created, ...prev]);
      setIsModalOpen(false);

      // Reset Form
      setName('');
      setLocation('');
      setApplyLink('');
      setDescription('');
      setPrice(undefined);
    } catch (err) {
      console.error('Failed to publish internship:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internships</h1>
          <p className="page-subtitle">Manage company career openings, stipend tiers, and application links</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Internship</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Loading internships catalog...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Internship Role & Company</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Compensation</th>
                  <th>Location & Deadline</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map(intern => (
                  <tr key={intern.internship_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={intern.company.image}
                          alt={intern.company.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{intern.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {intern.company.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {intern.internship_id}
                    </td>

                    <td>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          background: 'rgba(0,0,0,0.05)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {intern.type}
                      </span>
                    </td>

                    <td>
                      {intern.paid === 1 ? (
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                          Paid • ₹{intern.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Free</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--text-muted)" />
                        <span>{intern.location}</span>
                      </div>
                      {intern.deadline && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Calendar size={12} />
                          <span>Deadline: {intern.deadline}</span>
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${intern.status}`}>{intern.status}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {intern.apply_link && (
                          <a
                            href={intern.apply_link}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn"
                            title="Apply Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(intern.internship_id)}
                          title="Delete Internship"
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

      {/* Add Internship Modal matching backend form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Internship">
        <form onSubmit={handleAddInternship}>
          <div className="form-group">
            <label className="form-label" htmlFor="intern_name">
              Internship Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="intern_name"
              className="form-input"
              placeholder="e.g. Full Stack React & Node Intern"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="intern_company">
                Company <span className="star">*</span>
              </label>
              <select
                id="intern_company"
                className="form-select"
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                required
              >
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="intern_type">
                Work Type <span className="star">*</span>
              </label>
              <select
                id="intern_type"
                className="form-select"
                value={type}
                onChange={e => setType(e.target.value as 'remote' | 'offline' | 'hybrid')}
                required
              >
                <option value="remote">Remote</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="intern_paid">
                Compensation Tier <span className="star">*</span>
              </label>
              <select
                id="intern_paid"
                className="form-select"
                value={paid}
                onChange={e => setPaid(Number(e.target.value) as 0 | 1)}
                required
              >
                <option value={0}>Free Training (Unpaid)</option>
                <option value={1}>Paid Stipend</option>
              </select>
            </div>

            {paid === 1 && (
              <div className="form-group">
                <label className="form-label" htmlFor="intern_price">
                  Stipend Amount (₹) <span className="star">*</span>
                </label>
                <input
                  type="number"
                  id="intern_price"
                  className="form-input"
                  placeholder="e.g. 15000"
                  value={price || ''}
                  onChange={e => setPrice(Number(e.target.value))}
                  required
                />
              </div>
            )}
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="intern_location">
                Location <span className="star">*</span>
              </label>
              <input
                type="text"
                id="intern_location"
                className="form-input"
                placeholder="e.g. Bangalore, India (or Remote)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="intern_deadline">
                Application Deadline <span className="star">*</span>
              </label>
              <input
                type="date"
                id="intern_deadline"
                className="form-input"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intern_apply">
              Direct Application Link / URL <span className="star">*</span>
            </label>
            <input
              type="url"
              id="intern_apply"
              className="form-input"
              placeholder="https://..."
              value={applyLink}
              onChange={e => setApplyLink(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="intern_desc">
              Job Description & Responsibilities <span className="star">*</span>
            </label>
            <textarea
              id="intern_desc"
              className="form-textarea"
              placeholder="Detailed candidate requirements and projects..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{actionLoading ? 'Publishing...' : 'Publish Internship'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
