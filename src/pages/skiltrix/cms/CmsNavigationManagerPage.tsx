import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FolderTree,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  FilePlus,
  Edit,
  ExternalLink,
  RefreshCw,
  CornerDownRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { CmsCourse, CmsNavNode } from '../../../types/cms';

interface FlatNode {
  page_id: string;
  title: string;
  slug: string;
  url_path: string;
  status: string;
  page_order: number;
  parent_id: string | null;
  level: number;
}

export const CmsNavigationManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(searchParams.get('course_id') || '');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [nodes, setNodes] = useState<FlatNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all courses
  useEffect(() => {
    cmsApi.getCourses().then(data => {
      setCourses(data);
      if (!selectedCourseId && data.length > 0) {
        setSelectedCourseId(data[0].course_id);
        setSearchParams({ course_id: data[0].course_id });
      }
    });
  }, []);

  // Fetch tree for selected course
  const fetchTree = async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    try {
      const data = await cmsApi.getNavigationTree(cid);
      setCourseTitle(data.course?.title || '');

      // Flatten the hierarchical tree for easy reordering and nesting
      const flattened: FlatNode[] = [];
      function walk(items: CmsNavNode[], level: number, parentId: string | null) {
        items.forEach((it, idx) => {
          flattened.push({
            page_id: it.page_id,
            title: it.title,
            slug: it.slug,
            url_path: it.url_path,
            status: it.status,
            page_order: idx,
            parent_id: parentId,
            level
          });
          if (it.children && it.children.length > 0) {
            walk(it.children, level + 1, it.page_id);
          }
        });
      }
      walk(data.tree, 0, null);
      setNodes(flattened);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchTree(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCourseChange = (cid: string) => {
    setSelectedCourseId(cid);
    setSearchParams({ course_id: cid });
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nodes.length) return;

    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIdx];
    newNodes[targetIdx] = temp;
    setNodes(newNodes);
  };

  const toggleNesting = (index: number) => {
    if (index === 0) return; // Cannot indent the very first item
    const newNodes = [...nodes];
    const current = newNodes[index];
    const prev = newNodes[index - 1];

    if (current.level === 0) {
      // Indent under previous item
      current.level = 1;
      current.parent_id = prev.level === 0 ? prev.page_id : prev.parent_id;
    } else {
      // Outdent back to top level
      current.level = 0;
      current.parent_id = null;
    }
    setNodes(newNodes);
  };

  const handleSaveOrder = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = nodes.map((n, i) => ({
        page_id: n.page_id,
        order: i,
        parent_id: n.parent_id
      }));
      await cmsApi.reorderNavigation(selectedCourseId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchTree(selectedCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to reorder navigation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main, #f1f5f9)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={24} color="#6366f1" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Course Navigation Hierarchy</h1>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
            Arrange chapters, sections, and nested subtopics. The order set here powers the learner course sidebar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSaveOrder}
            disabled={saving || nodes.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.25rem',
              backgroundColor: saveSuccess ? '#10b981' : '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {saveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saveSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* Course Selector Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={18} color="#818cf8" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Course:</span>
          <select
            value={selectedCourseId}
            onChange={e => handleCourseChange(e.target.value)}
            style={{
              backgroundColor: '#0f172a',
              color: 'inherit',
              border: '1px solid var(--border-color, #334155)',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          >
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate(`/skiltrix/cms/pages/create?course_id=${selectedCourseId}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <FilePlus size={14} />
            Add Page to this Course
          </button>

          <button
            onClick={() => fetchTree(selectedCourseId)}
            title="Refresh"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Hierarchy List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <div>Loading navigation hierarchy...</div>
        </div>
      ) : nodes.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color, #334155)'
        }}>
          <FolderTree size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No Pages in Course Hierarchy</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem' }}>
            Create some pages under this course to build your syllabus hierarchy.
          </p>
          <button
            onClick={() => navigate(`/skiltrix/cms/pages/create?course_id=${selectedCourseId}`)}
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
            <FilePlus size={16} />
            Create First Page
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #334155)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {nodes.map((node, idx) => (
            <div
              key={node.page_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #334155)',
                marginLeft: `${node.level * 28}px`,
                transition: 'margin 0.15s ease'
              }}
            >
              {/* Left Title & Hierarchy indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {node.level > 0 && <CornerDownRight size={16} color="#818cf8" />}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f8fafc' }}>
                      {node.title}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: node.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: node.status === 'published' ? '#34d399' : '#facc15'
                    }}>
                      {node.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {node.url_path}
                  </div>
                </div>
              </div>

              {/* Right Order & Nesting Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => toggleNesting(idx)}
                  title={node.level === 0 ? 'Nest as Sub-page' : 'Move to Top-level'}
                  style={{
                    padding: '0.35rem 0.6rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {node.level === 0 ? 'Nest' : 'Outdent'}
                </button>

                <button
                  disabled={idx === 0}
                  onClick={() => moveNode(idx, 'up')}
                  title="Move Up"
                  style={{
                    padding: '0.35rem 0.5rem',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    color: idx === 0 ? '#475569' : '#cbd5e1',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex'
                  }}
                >
                  <ArrowUp size={14} />
                </button>

                <button
                  disabled={idx === nodes.length - 1}
                  onClick={() => moveNode(idx, 'down')}
                  title="Move Down"
                  style={{
                    padding: '0.35rem 0.5rem',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    color: idx === nodes.length - 1 ? '#475569' : '#cbd5e1',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '6px',
                    cursor: idx === nodes.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex'
                  }}
                >
                  <ArrowDown size={14} />
                </button>

                <button
                  onClick={() => navigate(`/skiltrix/cms/pages/${node.page_id}`)}
                  title="Edit Page"
                  style={{
                    padding: '0.35rem 0.55rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CmsNavigationManagerPage;
