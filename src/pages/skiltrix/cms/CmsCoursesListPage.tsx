import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  FolderTree,
  FilePlus,
  RefreshCw,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { CmsCourse } from '../../../types/cms';

export const CmsCoursesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CmsCourse | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Programming');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await cmsApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormCategory('Programming');
    setFormStatus('published');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (c: CmsCourse) => {
    setEditingCourse(c);
    setFormTitle(c.title);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormCategory(c.category || 'Programming');
    setFormStatus(c.status);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingCourse) {
      const slugVal = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(slugVal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim()) {
      setErrorMsg('Title and slug are required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingCourse) {
        await cmsApi.updateCourse(editingCourse.course_id, {
          title: formTitle.trim(),
          slug: formSlug.trim(),
          description: formDescription.trim(),
          category: formCategory.trim(),
          status: formStatus
        });
      } else {
        await cmsApi.createCourse({
          title: formTitle.trim(),
          slug: formSlug.trim(),
          description: formDescription.trim(),
          category: formCategory.trim(),
          status: formStatus
        });
      }
      setModalOpen(false);
      await fetchCourses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"? All associated page metadata will be removed.`)) {
      return;
    }
    try {
      await cmsApi.deleteCourse(courseId);
      await fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main, #f1f5f9)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={24} color="#6366f1" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Course Content Management (CMS)</h1>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
            Build, publish, and manage WordPress-style educational courses with file-based TSX generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/skiltrix/cms/pages/create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <FilePlus size={16} />
            Create New Page
          </button>
          <button
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>
      </div>

      {/* Top Search & Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card-bg, #1e293b)',
        padding: '0.85rem 1.2rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color, #334155)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted, #94a3b8)" />
          <input
            type="text"
            placeholder="Search courses by name or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              outline: 'none',
              width: '100%',
              fontSize: '0.92rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
          <span>Total Courses: <strong style={{ color: '#fff' }}>{courses.length}</strong></span>
          <button
            onClick={fetchCourses}
            title="Refresh"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <div>Loading courses...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color, #334155)'
        }}>
          <BookOpen size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No Courses Found</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem' }}>
            Get started by creating your first course hierarchy (e.g. C Programming).
          </p>
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.2rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {filtered.map(c => (
            <div
              key={c.course_id}
              style={{
                backgroundColor: 'var(--card-bg, #1e293b)',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #334155)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s, border-color 0.15s'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8'
                  }}>
                    {c.category || 'General'}
                  </span>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: c.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: c.status === 'published' ? '#34d399' : '#facc15'
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 600 }}>{c.title}</h3>

                <p style={{
                  margin: '0 0 12px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted, #94a3b8)',
                  lineHeight: '1.4',
                  minHeight: '38px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {c.description || 'No description provided.'}
                </p>

                <div style={{
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  /courses/{c.slug}/
                </div>
              </div>

              <div>
                {/* Meta stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-color, #334155)',
                  paddingTop: '10px',
                  marginBottom: '12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted, #94a3b8)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#6366f1" />
                    <span>{c.pages_count ?? 0} Pages</span>
                  </div>

                  <button
                    onClick={() => navigate(`/skiltrix/cms/navigation?course_id=${c.course_id}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FolderTree size={14} />
                    Hierarchy Tree
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/skiltrix/cms/pages?course_id=${c.course_id}`)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Pages
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => navigate(`/skiltrix/cms/pages/create?course_id=${c.course_id}`)}
                    title="Add Page"
                    style={{
                      padding: '0.5rem 0.65rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <FilePlus size={15} />
                  </button>

                  <button
                    onClick={() => openEditModal(c)}
                    title="Edit Course"
                    style={{
                      padding: '0.5rem 0.65rem',
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                      color: '#cbd5e1',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(c.course_id, c.title)}
                    title="Delete Course"
                    style={{
                      padding: '0.5rem 0.65rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Course */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #1e293b)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #334155)',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>

            {errorMsg && (
              <div style={{
                padding: '0.6rem 0.9rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                borderRadius: '6px',
                fontSize: '0.84rem',
                marginBottom: '1rem'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C Programming Masterclass"
                  value={formTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    color: 'inherit',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                  URL Slug *
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted, #94a3b8)',
                    fontFamily: 'monospace'
                  }}>
                    /courses/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="c-programming"
                    value={formSlug}
                    onChange={e => setFormSlug(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: '0 6px 6px 0',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Programming, Web Development, SAP ABAP"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    color: 'inherit',
                    outline: 'none',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of what students will learn..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    color: 'inherit',
                    outline: 'none',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    color: 'inherit',
                    outline: 'none',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="published">Published (Visible in Portal)</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.6rem 1.3rem',
                    backgroundColor: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CmsCoursesListPage;
