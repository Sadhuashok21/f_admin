import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Video,
  FileCode,
  RefreshCw,
  FolderTree
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { CmsCourse, CmsPage } from '../../../types/cms';

interface CmsPagesListPageProps {
  initialStatusFilter?: 'all' | 'draft' | 'published' | 'archived';
  pageTitle?: string;
}

export const CmsPagesListPage: React.FC<CmsPagesListPageProps> = ({
  initialStatusFilter = 'all',
  pageTitle = 'Course Pages Management'
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const courseIdParam = searchParams.get('course_id') || '';
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [search, setSearch] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesData, pagesData] = await Promise.all([
        cmsApi.getCourses(),
        cmsApi.getPages({
          course_id: selectedCourseId || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search || undefined
        })
      ]);
      setCourses(coursesData);
      setPages(pagesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourseId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (courseId) {
      setSearchParams({ course_id: courseId });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async (pageId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete page "${title}"? Any generated physical files on disk will also be cleaned up.`)) {
      return;
    }
    try {
      await cmsApi.deletePage(pageId);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete page');
    }
  };

  // Get frontend domain for live preview links
  const frontendHost = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5176';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main, #f1f5f9)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="#6366f1" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{pageTitle}</h1>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
            {statusFilter === 'draft' && 'Viewing all draft pages awaiting publication.'}
            {statusFilter === 'published' && 'Viewing all published course pages with generated TSX/CSS files.'}
            {statusFilter === 'all' && 'All pages across courses with live status and generated file indicators.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate(selectedCourseId ? `/skiltrix/cms/pages/create?course_id=${selectedCourseId}` : '/skiltrix/cms/pages/create')}
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
            <Plus size={16} />
            Create New Page
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--card-bg, #1e293b)',
        padding: '0.85rem 1.2rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color, #334155)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Course Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--text-muted, #94a3b8)" />
            <select
              value={selectedCourseId}
              onChange={e => handleCourseChange(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                color: 'inherit',
                border: '1px solid var(--border-color, #334155)',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="">All Courses ({courses.length})</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="var(--text-muted, #94a3b8)" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                color: 'inherit',
                border: '1px solid var(--border-color, #334155)',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            padding: '0.45rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <Search size={15} color="var(--text-muted, #94a3b8)" />
            <input
              type="text"
              placeholder="Search page title or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                outline: 'none',
                fontSize: '0.85rem',
                width: '180px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.45rem 0.8rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={fetchData}
            title="Refresh"
            style={{
              padding: '0.45rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
          </button>
        </form>
      </div>

      {/* Pages Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <div>Loading course pages...</div>
        </div>
      ) : pages.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color, #334155)'
        }}>
          <FileText size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No Pages Found</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem' }}>
            {selectedCourseId
              ? 'No pages found for this selected course. Create one to begin generating course content.'
              : 'No pages matching your search criteria.'}
          </p>
          <button
            onClick={() => navigate(selectedCourseId ? `/skiltrix/cms/pages/create?course_id=${selectedCourseId}` : '/skiltrix/cms/pages/create')}
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
            Create Page
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #334155)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-color, #334155)',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Page Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Course</th>
                  <th style={{ padding: '0.85rem 1rem' }}>URL Path</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Disk Artifacts</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Updated</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => {
                  const course = courses.find(c => c.course_id === p.course_id);
                  const isPublished = p.status === 'published';

                  return (
                    <tr
                      key={p.page_id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #334155)',
                        transition: 'background-color 0.1s'
                      }}
                    >
                      {/* Page Title & Badges */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{p.title}</span>
                          {p.video_url && (
                            <span title="Contains YouTube Video" style={{ display: 'flex', color: '#ef4444' }}>
                              <Video size={14} />
                            </span>
                          )}
                        </div>
                        {p.parent_id && (
                          <div style={{ fontSize: '0.74rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <FolderTree size={11} />
                            Sub-page
                          </div>
                        )}
                      </td>

                      {/* Course Name */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          whiteSpace: 'nowrap'
                        }}>
                          {course ? course.title : 'Unknown'}
                        </span>
                      </td>

                      {/* URL Path */}
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {p.url_path}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          color: isPublished ? '#34d399' : '#facc15'
                        }}>
                          {isPublished ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {p.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Generated Files on Disk */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {p.file_path ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#10b981' }}>
                            <FileCode size={13} />
                            <span>index.tsx, .css</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>Not generated</span>
                        )}
                      </td>

                      {/* Updated date */}
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap' }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => navigate(`/skiltrix/cms/pages/${p.page_id}`)}
                            title="Edit in Page Builder"
                            style={{
                              padding: '0.4rem 0.65rem',
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            <Edit size={13} />
                            Edit
                          </button>

                          {isPublished && (
                            <a
                              href={`${frontendHost}${p.url_path}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View Live Page on Skiltrix"
                              style={{
                                padding: '0.4rem 0.5rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}

                          <button
                            onClick={() => handleDelete(p.page_id, p.title)}
                            title="Delete Page"
                            style={{
                              padding: '0.4rem 0.5rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default CmsPagesListPage;
