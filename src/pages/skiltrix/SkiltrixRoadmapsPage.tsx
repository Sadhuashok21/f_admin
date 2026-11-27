import React, { useEffect, useState } from 'react';
import {
  Compass,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  AdminRoadmapDTO,
  AdminRoadmapStageDTO,
  roadmapsAdminApi,
} from '../../services/roadmapsAdmin';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '1.1rem',
};

const btnPrimary: React.CSSProperties = {
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.5rem 0.9rem',
  fontWeight: 600,
  fontSize: '0.84rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const btnSecondary: React.CSSProperties = {
  background: 'var(--bg-main)',
  color: 'var(--text-main)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.45rem 0.85rem',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const STAGE_COLORS = ['#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

const createBlankStage = (stageNum: number): AdminRoadmapStageDTO => ({
  stage_number: stageNum,
  badge_text: `STEP ${String(stageNum).padStart(2, '0')}`,
  title: '',
  description: '',
  color: STAGE_COLORS[(stageNum - 1) % STAGE_COLORS.length],
  difficulty: 'Beginner',
  estimated_hours: '15 Hours',
  tutorial_link: '/tutorials',
  practice_link: '/codelab',
  topics: [],
});

export const SkiltrixRoadmapsPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<AdminRoadmapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminRoadmapDTO>({
    key: '',
    title: '',
    category: 'Web Development',
    badge: 'INFOGRAPHICS TIMELINE',
    description: '',
    icon: 'code',
    accent_color: '#3B82F6',
    estimated_weeks: '12-16 Weeks',
    order: 1,
    is_active: true,
    stages: [createBlankStage(1)],
  });

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await roadmapsAdminApi.listRoadmaps();
      setRoadmaps(res.roadmaps || []);
    } catch (err: any) {
      setBanner({ type: 'err', text: err?.message || 'Failed to load roadmaps.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const openCreateModal = () => {
    setEditingKey(null);
    setForm({
      key: '',
      title: '',
      category: 'Web Development',
      badge: 'INFOGRAPHICS TIMELINE',
      description: '',
      icon: 'code',
      accent_color: '#3B82F6',
      estimated_weeks: '12-16 Weeks',
      order: roadmaps.length + 1,
      is_active: true,
      stages: [createBlankStage(1)],
    });
    setShowModal(true);
  };

  const openEditModal = (rm: AdminRoadmapDTO) => {
    setEditingKey(rm.key);
    setForm({
      ...rm,
      stages: Array.isArray(rm.stages) && rm.stages.length > 0 ? rm.stages.map(s => ({ ...s, topics: [...(s.topics || [])] })) : [createBlankStage(1)],
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      const normalizedStages = form.stages.map((st, idx) => ({
        ...st,
        stage_number: idx + 1,
        badge_text: st.badge_text.trim() || `STEP ${String(idx + 1).padStart(2, '0')}`,
      }));
      const payload = { ...form, stages: normalizedStages };
      if (editingKey) {
        await roadmapsAdminApi.updateRoadmap(editingKey, payload);
        setBanner({ type: 'ok', text: `Roadmap "${form.title}" updated successfully.` });
      } else {
        await roadmapsAdminApi.createRoadmap(payload);
        setBanner({ type: 'ok', text: `Roadmap "${form.title}" created successfully.` });
      }
      setShowModal(false);
      await loadRoadmaps();
    } catch (err: any) {
      setBanner({ type: 'err', text: err?.message || 'Failed to save roadmap.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rm: AdminRoadmapDTO) => {
    if (!window.confirm(`Delete roadmap "${rm.title}"? This will also remove learner progress for this track.`)) {
      return;
    }
    try {
      await roadmapsAdminApi.deleteRoadmap(rm.key);
      setBanner({ type: 'ok', text: `Deleted roadmap "${rm.title}".` });
      await loadRoadmaps();
    } catch (err: any) {
      setBanner({ type: 'err', text: err?.message || 'Failed to delete roadmap.' });
    }
  };

  const handleToggleActive = async (rm: AdminRoadmapDTO) => {
    try {
      await roadmapsAdminApi.updateRoadmap(rm.key, { is_active: !rm.is_active });
      setRoadmaps(prev => prev.map(item => (item.key === rm.key ? { ...item, is_active: !rm.is_active } : item)));
    } catch (err: any) {
      setBanner({ type: 'err', text: err?.message || 'Failed to update status.' });
    }
  };

  const moveStage = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= form.stages.length) return;
    setForm(prev => {
      const next = [...prev.stages];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return {
        ...prev,
        stages: next.map((st, idx) => ({ ...st, stage_number: idx + 1 })),
      };
    });
  };

  const filtered = roadmaps.filter(rm => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      rm.title.toLowerCase().includes(q) ||
      rm.category.toLowerCase().includes(q) ||
      rm.key.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={24} color="var(--primary)" />
            Career Roadmaps Manager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Add, edit, reorder phases, or remove SkilTrix career roadmaps. Full roadmap details require user sign-in.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Search roadmaps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          <button style={btnSecondary} onClick={loadRoadmaps} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button style={btnPrimary} onClick={openCreateModal}>
            <Plus size={15} /> New Roadmap
          </button>
        </div>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: banner.type === 'ok' ? 'rgba(22,163,74,0.14)' : 'rgba(220,38,38,0.14)',
            color: banner.type === 'ok' ? '#16a34a' : '#dc2626',
            border: `1px solid ${banner.type === 'ok' ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          Loading career roadmaps...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          No roadmaps found. Click &quot;New Roadmap&quot; to create one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1rem' }}>
          {filtered.map(rm => (
            <div key={rm.key} style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '6px', background: rm.accent_color || '#3B82F6' }} />
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px', background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                      {rm.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: rm.is_active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                      {rm.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{rm.title}</h3>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    key: {rm.key} • order #{rm.order}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {rm.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Layers size={13} /> {(rm.stages || []).length} phases
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} /> {rm.estimated_weeks}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <button style={btnSecondary} onClick={() => handleToggleActive(rm)} title={rm.is_active ? 'Hide from learners' : 'Publish to learners'}>
                  {rm.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {rm.is_active ? 'Visible' : 'Hidden'}
                </button>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button style={btnSecondary} onClick={() => openEditModal(rm)}>
                    <Edit3 size={13} /> Edit Contents
                  </button>
                  <button style={{ ...btnSecondary, color: '#dc2626' }} onClick={() => handleDelete(rm)} title="Delete Roadmap">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <form
            onSubmit={handleSave}
            style={{
              ...cardStyle,
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>
                {editingKey ? `Edit Roadmap: ${form.title}` : 'Create Career Roadmap'}
              </h2>
              <button type="button" style={btnSecondary} onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Title *</label>
                <input
                  required
                  style={{ width: '100%' }}
                  placeholder="e.g. Frontend Web Roadmap"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Key (slug)</label>
                <input
                  disabled={Boolean(editingKey)}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  placeholder="auto-generated if blank"
                  value={form.key}
                  onChange={e => setForm({ ...form, key: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category</label>
                <input
                  style={{ width: '100%' }}
                  placeholder="Web Development"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 90px auto', gap: '0.6rem', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Estimated Weeks</label>
                <input
                  style={{ width: '100%' }}
                  value={form.estimated_weeks}
                  onChange={e => setForm({ ...form, estimated_weeks: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Badge</label>
                <input
                  style={{ width: '100%' }}
                  value={form.badge}
                  onChange={e => setForm({ ...form, badge: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Icon</label>
                <select style={{ width: '100%' }} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}>
                  <option value="code">code</option>
                  <option value="terminal">terminal</option>
                  <option value="layers">layers</option>
                  <option value="coffee">coffee</option>
                  <option value="smartphone">smartphone</option>
                  <option value="shield">shield</option>
                  <option value="compass">compass</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Color</label>
                <input
                  type="color"
                  style={{ width: '100%', height: '38px', padding: '2px' }}
                  value={form.accent_color || '#3B82F6'}
                  onChange={e => setForm({ ...form, accent_color: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Order</label>
                <input
                  type="number"
                  style={{ width: '100%' }}
                  value={form.order}
                  onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, paddingBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea
                rows={2}
                style={{ width: '100%' }}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Stages Editor */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                  Roadmap Phases / Stages ({form.stages.length})
                </h3>
                <button
                  type="button"
                  style={btnSecondary}
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      stages: [...prev.stages, createBlankStage(prev.stages.length + 1)],
                    }))
                  }
                >
                  <Plus size={14} /> Add Phase
                </button>
              </div>

              {form.stages.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.84rem' }}>Phase #{idx + 1}</strong>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button type="button" style={btnSecondary} disabled={idx === 0} onClick={() => moveStage(idx, -1)}>
                        <ArrowUp size={13} />
                      </button>
                      <button type="button" style={btnSecondary} disabled={idx === form.stages.length - 1} onClick={() => moveStage(idx, 1)}>
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        style={{ ...btnSecondary, color: '#dc2626' }}
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            stages: prev.stages.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '110px 2fr 1fr 110px 60px', gap: '0.5rem' }}>
                    <input
                      placeholder="STEP 01"
                      value={st.badge_text}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, badge_text: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                    <input
                      required
                      placeholder="Phase Title"
                      value={st.title}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, title: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                    <select
                      value={st.difficulty}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, difficulty: e.target.value as any };
                        setForm({ ...form, stages: next });
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <input
                      placeholder="15 Hours"
                      value={st.estimated_hours}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, estimated_hours: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                    <input
                      type="color"
                      style={{ width: '100%', height: '36px', padding: '2px' }}
                      value={st.color || '#3B82F6'}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, color: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                  </div>

                  <input
                    placeholder="Short phase description..."
                    value={st.description}
                    onChange={e => {
                      const next = [...form.stages];
                      next[idx] = { ...st, description: e.target.value };
                      setForm({ ...form, stages: next });
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      placeholder="Tutorial link (e.g. /tutorials/html)"
                      value={st.tutorial_link}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, tutorial_link: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                    <input
                      placeholder="Practice link (e.g. /codelab)"
                      value={st.practice_link}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = { ...st, practice_link: e.target.value };
                        setForm({ ...form, stages: next });
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                      Topics (one per line)
                    </label>
                    <textarea
                      rows={3}
                      style={{ width: '100%', fontSize: '0.8rem' }}
                      value={(st.topics || []).join('\n')}
                      onChange={e => {
                        const next = [...form.stages];
                        next[idx] = {
                          ...st,
                          topics: e.target.value.split('\n'),
                        };
                        setForm({ ...form, stages: next });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '0.4rem' }}>
              <button type="button" style={btnSecondary} disabled={saving} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" style={btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : 'Save Roadmap'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
