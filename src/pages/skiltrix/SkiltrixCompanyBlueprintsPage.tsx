import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Briefcase,
  Clock,
  Layers,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { initialCompanyBlueprints } from '../../data/mockData';
import { CompanyBlueprintItem } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixCompanyBlueprintsPage: React.FC = () => {
  const [blueprints, setBlueprints] = useState<CompanyBlueprintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Company Mocks');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [tier, setTier] = useState<'free' | 'pro'>('free');
  const [description, setDescription] = useState('');

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanyBlueprints();
      setBlueprints(data && data.length > 0 ? data : initialCompanyBlueprints);
    } catch {
      setBlueprints(initialCompanyBlueprints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCompanyBlueprint({
        company_name: companyName,
        slug: slug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        duration_minutes: durationMinutes,
        tier,
        description,
        sections_config: [
          { title: 'Section 1: CS Fundamentals', type: 'technical', marks: 20, duration: 25 },
          { title: 'Section 2: Coding Assessment', type: 'coding', marks: 80, duration: 65 }
        ],
        recommended_topics: ['DSA', 'CS Fundamentals'],
        is_active: true
      });
      setBlueprints(prev => [created, ...prev]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create blueprint:', err);
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setSlug('');
    setCategory('Company Mocks');
    setDurationMinutes(90);
    setTier('free');
    setDescription('');
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Delete this company blueprint?')) {
      try {
        await api.deleteCompanyBlueprint(id);
        setBlueprints(prev => prev.filter(b => b.blueprint_id !== id && b.id !== id));
      } catch (err) {
        console.error('Failed to delete blueprint:', err);
      }
    }
  };

  const handleGenerateMock = async (bp: CompanyBlueprintItem) => {
    try {
      setSyncStatus(`Generating mock for ${bp.company_name}...`);
      await api.createCompanyMock({
        title: bp.company_name,
        company_tag: bp.company_name.replace(' Mock', ''),
        category: bp.category,
        duration_minutes: bp.duration_minutes,
        total_marks: 100,
        pass_percentage: 70,
        is_company_mock: true,
        is_pro_only: bp.tier === 'pro',
        proctoring_enabled: true,
        active: true,
        description: bp.description,
      });
      setSyncStatus(`✓ Successfully generated mock for ${bp.company_name}`);
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      console.error('Failed to sync mock:', err);
      setSyncStatus(`Failed to generate mock: ${String(err)}`);
    }
  };

  const filteredBlueprints = blueprints.filter(b => {
    const matchesSearch =
      b.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === 'All' || b.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Blueprints</h1>
          <p className="page-subtitle">
            Hiring pattern blueprints for Amazon, Deloitte, TCS, Google, Microsoft, and tech companies
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/skiltrix/mocks" className="btn btn-secondary btn-sm">
            <Layers size={14} />
            <span>Company Mocks</span>
          </Link>
          <button className="btn btn-secondary btn-sm" onClick={fetchBlueprints} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Blueprint</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: '#10b98120',
          border: '1px solid #10b981',
          color: '#34d399',
          fontSize: '0.9rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Blueprints</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{blueprints.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Free Blueprints</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
            {blueprints.filter(b => b.tier === 'free').length}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Pro Tier Blueprints</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
            {blueprints.filter(b => b.tier === 'pro').length}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Hiring Rounds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7', marginTop: '4px' }}>
            {blueprints.reduce((acc, b) => acc + (b.sections_config?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search blueprints by company or role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={selectedTier}
          onChange={e => setSelectedTier(e.target.value)}
        >
          <option value="All">All Tiers</option>
          <option value="free">Free Practice</option>
          <option value="pro">Pro Subscription</option>
        </select>
      </div>

      {/* Grid of Blueprints */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
        {filteredBlueprints.map(bp => (
          <div
            key={bp.blueprint_id || bp.slug}
            style={{
              background: 'var(--card-bg, #1e293b)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #334155)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {bp.company_name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{bp.slug}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {bp.tier === 'pro' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f59e0b20', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                      <Lock size={12} /> PRO
                    </span>
                  ) : (
                    <span style={{ background: '#38bdf820', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                      FREE
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(bp.blueprint_id || (bp.id as any))}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    title="Delete Blueprint"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '8px 0 16px', lineHeight: 1.5 }}>
                {bp.description}
              </p>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#94a3b8" />
                  <span>{bp.duration_minutes} minutes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={14} color="#94a3b8" />
                  <span>{bp.sections_config?.length || 0} rounds configured</span>
                </div>
              </div>

              {/* Sections Badges */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Assessment Rounds
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(bp.sections_config || []).map((sec, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#33415580',
                        color: '#e2e8f0',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{sec.title}</span>
                      <span style={{ color: '#94a3b8' }}>({sec.marks} pts)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #334155' }}>
              <Link to="/skiltrix/mocks" style={{ color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Mock</span>
                <ExternalLink size={14} />
              </Link>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleGenerateMock(bp)}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Sparkles size={14} color="#f59e0b" />
                <span>Sync Mock</span>
              </button>
            </div>
          </div>
        ))}

        {filteredBlueprints.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b', background: 'var(--card-bg, #1e293b)', borderRadius: '12px' }}>
            No blueprints found matching your filter.
          </div>
        )}
      </div>

      {/* Modal for Creating Blueprint */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Company Blueprint">
        <form onSubmit={handleCreateBlueprint} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Amazon-style SDE Mock"
              value={companyName}
              onChange={e => {
                setCompanyName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">URL Slug *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. amazon-style-sde"
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Access Tier</label>
              <select
                className="form-control"
                value={tier}
                onChange={e => setTier(e.target.value as any)}
              >
                <option value="free">Free Practice</option>
                <option value="pro">Pro Subscription</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Company Mocks">Company Mocks</option>
                <option value="Mixed Placement Assessments">Mixed Placement Assessments</option>
                <option value="Coding Assessments">Coding Assessments</option>
                <option value="DSA Assessments">DSA Assessments</option>
              </select>
            </div>
            <div>
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                className="form-control"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe the company assessment format, difficulty, and skills tested..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Blueprint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

