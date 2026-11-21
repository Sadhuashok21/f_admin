import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  Settings,
  Code2,
  PenTool,
  Sparkles,
  Video,
  CheckCircle,
  Clock,
  Loader2,
  X,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  Layers,
  FolderTree,
  Sun,
  Moon,
  Info,
  AlertTriangle,
  Table as TableIcon,
  BookOpen,
  FileText
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { CmsCourse, CmsPage } from '../../../types/cms';
import { CKEditorWrapper } from '../../../components/cms/CKEditorWrapper';
import { LivePreviewFrame } from '../../../components/cms/LivePreviewFrame';
import { CodeBlockModal } from '../../../components/cms/CodeBlockModal';
import { YouTubeModal } from '../../../components/cms/YouTubeModal';
import { TopicCardsModal } from '../../../components/cms/TopicCardsModal';
import { DefinitionBoxModal } from '../../../components/cms/DefinitionBoxModal';
import { MediaPickerModal } from '../../../components/cms/MediaPickerModal';
import { Modal } from '../../../components/common/Modal';

export const CmsPageBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId?: string }>();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course_id') || '';

  // Core metadata states
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [siblingPages, setSiblingPages] = useState<CmsPage[]>([]);
  const [page, setPage] = useState<CmsPage | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [pageOrder, setPageOrder] = useState<number>(1);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Educational Content states
  const [contentHtml, setContentHtml] = useState<string>('');
  const [customCss, setCustomCss] = useState<string>('');
  const [customJs, setCustomJs] = useState<string>('');

  // Video states
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoTarget, setVideoTarget] = useState<'_blank' | '_self'>('_blank');

  // Navigation states
  const [prevPageId, setPrevPageId] = useState<string | null>(null);
  const [nextPageId, setNextPageId] = useState<string | null>(null);

  // SEO states
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDescription, setSeoDescription] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Blogger-Style Mode: 'normal' (Compose) vs 'code' (HTML source)
  const [editorMode, setEditorMode] = useState<'normal' | 'code'>('normal');

  // Canvas Theme: 'dark' vs 'light'
  const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light'>('dark');

  // Drawers and Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Educational Block Modals
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [definitionModalOpen, setDefinitionModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Device mode for Preview
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // CKEditor reference
  const editorRef = useRef<any>(null);

  // Load courses and initial page details
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    cmsApi
      .getCourses()
      .then((cList) => {
        if (!mounted) return;
        setCourses(cList);
        if (!selectedCourseId && cList.length > 0) {
          setSelectedCourseId(cList[0].course_id);
        }
      })
      .catch((err) => console.error('Failed to load courses:', err));

    if (pageId && pageId !== 'create') {
      cmsApi
        .getPageDetail(pageId)
        .then((p) => {
          if (!mounted) return;
          setPage(p);
          setTitle(p.title);
          setSlug(p.slug);
          setSelectedCourseId(p.course_id);
          setParentId(p.parent_id || null);
          setPageOrder(p.page_order);
          setStatus(p.status);
          setContentHtml(p.content_html || '');
          setCustomCss(p.content_css || '');
          setCustomJs(p.content_js || '');
          setVideoUrl(p.video_url || '');
          setVideoThumbnail(p.video_thumbnail || '');
          setVideoTitle(p.video_title || '');
          setVideoTarget((p.video_target as any) || '_blank');
          setPrevPageId(p.prev_page_id || null);
          setNextPageId(p.next_page_id || null);
          setSeoTitle(p.seo_title || '');
          setSeoDescription(p.seo_description || '');
        })
        .catch((err) => console.error('Failed to fetch page:', err))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setTitle('Untitled Page');
      setSlug('');
      setContentHtml(
        `<h2>Welcome to Course Page</h2><p>Start writing your educational content, or insert code blocks, tables, and callouts from the top toolbar.</p>`
      );
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [pageId]);

  // Load sibling pages for parent selection and navigation
  useEffect(() => {
    if (!selectedCourseId) return;
    cmsApi
      .getPages({ course_id: selectedCourseId })
      .then((pList) => {
        setSiblingPages(pList.filter((p) => p.page_id !== pageId));
      })
      .catch((err) => console.error('Failed to load siblings:', err));
  }, [selectedCourseId, pageId]);

  // Auto-slug generator
  useEffect(() => {
    if ((!slug || !pageId || pageId === 'create') && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  }, [title]);

  // Handle Switch to Code (Normal -> Code)
  const handleSwitchToCode = () => {
    if (editorRef.current) {
      const currentData = editorRef.current.getData();
      setContentHtml(currentData);
    }
    setEditorMode('code');
  };

  // Handle Switch to Normal (Code -> Normal)
  const handleSwitchToNormal = () => {
    setEditorMode('normal');
    if (editorRef.current) {
      editorRef.current.setData(contentHtml);
    }
  };

  // Insert HTML at Cursor / Append
  const insertHtmlSnippet = (html: string) => {
    if (editorMode === 'normal') {
      if (editorRef.current) {
        try {
          editorRef.current.model.change(() => {
            const viewFragment = editorRef.current.data.processor.toView(html);
            const modelFragment = editorRef.current.data.toModel(viewFragment);
            editorRef.current.model.insertContent(modelFragment);
          });
          setContentHtml(editorRef.current.getData());
        } catch {
          const currentData = editorRef.current.getData();
          const updated = currentData ? `${currentData}\n${html}` : html;
          editorRef.current.setData(updated);
          setContentHtml(updated);
        }
      } else {
        setContentHtml((prev) => (prev ? `${prev}\n${html}` : html));
      }
    } else {
      setContentHtml((prev) => (prev ? `${prev}\n\n${html}` : html));
    }
    setIsBlockMenuOpen(false);
  };

  // Format HTML (Beautify)
  const handleBeautifyHtml = () => {
    try {
      let formatted = '';
      let indent = 0;
      const tab = '  ';
      const clean = contentHtml.replace(/>\s*</g, '><').trim();
      const tags = clean.split(/(<[^>]+>)/g).filter(Boolean);

      for (let i = 0; i < tags.length; i++) {
        const t = tags[i];
        if (t.startsWith('</')) {
          indent = Math.max(0, indent - 1);
          formatted += tab.repeat(indent) + t + '\n';
        } else if (t.startsWith('<') && !t.endsWith('/>') && !t.startsWith('<!') && !t.startsWith('<?')) {
          const isVoid = /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[ >]/i.test(t);
          formatted += tab.repeat(indent) + t + '\n';
          if (!isVoid) indent++;
        } else {
          const text = t.trim();
          if (text) formatted += tab.repeat(indent) + text + '\n';
        }
      }
      setContentHtml(formatted.trim());
    } catch {
      // Keep as-is if parsing fails
    }
  };

  // Quick HTML Tag Inserter for Code Mode
  const insertTagInCode = (tag: string) => {
    const snippet = `<${tag}></${tag}>`;
    setContentHtml((prev) => `${prev}\n${snippet}`);
  };

  // Copy HTML Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(contentHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    let finalHtml = contentHtml;
    if (editorMode === 'normal' && editorRef.current) {
      finalHtml = editorRef.current.getData();
      setContentHtml(finalHtml);
    }

    if (!title.trim()) {
      alert('Please enter a page title.');
      return;
    }
    if (!selectedCourseId) {
      alert('Please select a course for this page in Page Settings.');
      setIsSettingsOpen(true);
      return;
    }

    setSaving(true);
    try {
      const metadataPayload: Partial<CmsPage> = {
        course_id: selectedCourseId,
        title: title.trim(),
        slug: slug.trim() || 'untitled-page',
        parent_id: parentId || null,
        page_order: pageOrder,
        status: 'draft',
        content_html: finalHtml,
        content_css: customCss,
        content_js: customJs,
        video_url: videoUrl,
        video_thumbnail: videoThumbnail,
        video_title: videoTitle,
        video_target: videoTarget,
        prev_page_id: prevPageId || null,
        next_page_id: nextPageId || null,
        seo_title: seoTitle,
        seo_description: seoDescription
      };

      if (!pageId || pageId === 'create') {
        const created = await cmsApi.createPage({
          course_id: selectedCourseId,
          title: title.trim(),
          slug: slug.trim(),
          parent_id: parentId,
          page_order: pageOrder
        });
        await cmsApi.updatePageMetadata(created.page_id, metadataPayload);
        setStatus('draft');
        setLastSaved(new Date().toLocaleTimeString());
        setSaveMessage('Draft page saved successfully!');
        navigate(`/skiltrix/cms/pages/${created.page_id}`, { replace: true });
      } else {
        await cmsApi.updatePageMetadata(pageId, metadataPayload);
        setStatus('draft');
        setLastSaved(new Date().toLocaleTimeString());
        setSaveMessage('Draft page updated successfully!');
      }
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  // Publish / Recompile Handler
  const handlePublish = async () => {
    let finalHtml = contentHtml;
    if (editorMode === 'normal' && editorRef.current) {
      finalHtml = editorRef.current.getData();
      setContentHtml(finalHtml);
    }

    if (!title.trim()) {
      alert('Please enter a page title before publishing.');
      return;
    }
    if (!selectedCourseId) {
      alert('Please select a course in Page Settings.');
      setIsSettingsOpen(true);
      return;
    }

    setPublishing(true);
    try {
      let activeId = pageId;
      if (!activeId || activeId === 'create') {
        const created = await cmsApi.createPage({
          course_id: selectedCourseId,
          title: title.trim(),
          slug: slug.trim(),
          parent_id: parentId,
          page_order: pageOrder
        });
        activeId = created.page_id;
        navigate(`/skiltrix/cms/pages/${created.page_id}`, { replace: true });
      }

      await cmsApi.updatePageMetadata(activeId, {
        course_id: selectedCourseId,
        title: title.trim(),
        slug: slug.trim(),
        parent_id: parentId,
        page_order: pageOrder,
        seo_title: seoTitle,
        seo_description: seoDescription
      });

      const pubRes = await cmsApi.publishPage(activeId, {
        html_content: finalHtml,
        custom_css: customCss,
        custom_js: customJs,
        title: title.trim(),
        seo_title: seoTitle,
        seo_description: seoDescription,
        video_url: videoUrl,
        video_thumbnail: videoThumbnail,
        video_title: videoTitle,
        video_target: videoTarget,
        prev_page_id: prevPageId,
        next_page_id: nextPageId
      });

      setStatus('published');
      setLastSaved(new Date().toLocaleTimeString());
      setSaveMessage(`Page compiled & published live to ${pubRes.url_path}!`);
      setTimeout(() => setSaveMessage(null), 4500);
    } catch (err: any) {
      alert(err.message || 'Failed to publish page.');
    } finally {
      setPublishing(false);
    }
  };

  // Insert Callout Presets
  const insertCallout = (type: 'info' | 'warning' | 'success' | 'danger') => {
    const config = {
      info: { title: 'Information Note', bg: 'rgba(30, 58, 138, 0.22)', border: '#3b82f6', text: '#60a5fa' },
      warning: { title: 'Important Warning', bg: 'rgba(180, 83, 9, 0.22)', border: '#f59e0b', text: '#fbbf24' },
      success: { title: 'Best Practice', bg: 'rgba(22, 101, 52, 0.22)', border: '#22c55e', text: '#4ade80' },
      danger: { title: 'Critical Alert', bg: 'rgba(185, 28, 28, 0.22)', border: '#ef4444', text: '#f87171' }
    }[type];

    const html = `
      <div class="cms-callout-box cms-callout-${type}" style="background: ${config.bg}; border-left: 4px solid ${config.border}; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: ${config.text}; margin: 0 0 6px 0; font-weight: 700;">${config.title}</h4>
        <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;">Enter important educational insight, explanation, or syntax rule here...</p>
      </div>
    `;
    insertHtmlSnippet(html);
  };

  const insertComparisonTable = () => {
    const html = `
      <div style="overflow-x: auto; margin: 24px 0;">
        <table class="cms-comparison-table" style="width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; border-radius: 8px;">
          <thead>
            <tr style="background: #1e293b; color: #f8fafc;">
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Feature / Concept</th>
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Approach A</th>
              <th style="padding: 12px 16px; border: 1px solid #334155; text-align: left;">Approach B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #334155; font-weight: 600; color: #94a3b8;">Memory Size</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">4 Bytes</td>
              <td style="padding: 12px 16px; border: 1px solid #334155; color: #cbd5e1;">8 Bytes</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    insertHtmlSnippet(html);
  };

  const currentCourse = courses.find((c) => c.course_id === selectedCourseId);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <Loader2 size={32} className="animate-spin" style={{ marginRight: '12px' }} />
        <span>Loading Blogger Course Editor...</span>
      </div>
    );
  }

  return (
    <div className="blogger-editor-page">
      {/* ── Top Header Bar (Blogger Post Style) ────────────────────────────────── */}
      <header className="blogger-top-header">
        {/* Left: Back & Title Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 auto', minWidth: '320px' }}>
          <button
            type="button"
            onClick={() => navigate('/skiltrix/cms/pages')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '6px'
            }}
            title="Back to All Pages"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Large Blogger Title Input */}
          <input
            type="text"
            className="blogger-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
        </div>

        {/* Center: Normal <-> Code Mode Switcher */}
        <div className="blogger-mode-pill">
          <button
            type="button"
            className={editorMode === 'normal' ? 'active' : ''}
            onClick={handleSwitchToNormal}
            title="Visual WYSIWYG Compose View (Normal)"
          >
            <PenTool size={14} />
            <span>Compose (Normal)</span>
          </button>

          <button
            type="button"
            className={editorMode === 'code' ? 'active' : ''}
            onClick={handleSwitchToCode}
            title="Raw HTML Source Editor (Code)"
          >
            <Code2 size={14} />
            <span>HTML (Code)</span>
          </button>
        </div>

        {/* Right Actions: Theme, Inserter, Preview, Save, Publish, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Canvas Theme Switcher */}
          <button
            type="button"
            onClick={() => setCanvasTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            style={{
              background: '#030712',
              border: '1px solid #1e293b',
              color: canvasTheme === 'dark' ? '#fbbf24' : '#60a5fa',
              borderRadius: '8px',
              padding: '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
            title={canvasTheme === 'dark' ? 'Switch to Classic White Document Sheet' : 'Switch to Midnight Dark Sheet'}
          >
            {canvasTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{canvasTheme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          {/* Quick Insert Video Button (Custom Place & Custom Number of Videos) */}
          <button
            type="button"
            onClick={() => setYoutubeModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
            title="Insert YouTube Video Card or Embedded Player at current cursor position"
          >
            <Video size={14} color="#ef4444" />
            <span>+ Video</span>
          </button>

          {/* Quick Insert Code Block Button */}
          <button
            type="button"
            onClick={() => setCodeModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
            title="Insert Syntax Highlighted Code Block at current cursor position"
          >
            <Code2 size={14} color="#38bdf8" />
            <span>+ Code</span>
          </button>

          {/* Educational Block Inserter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsBlockMenuOpen(!isBlockMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              <Sparkles size={14} />
              <span>+ Components</span>
              <ChevronDown size={13} />
            </button>

            {isBlockMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '260px',
                  background: '#090e1a',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  padding: '8px 0',
                  zIndex: 50
                }}
              >
                <div style={{ padding: '4px 14px 6px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Educational Blocks
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCodeModalOpen(true);
                    setIsBlockMenuOpen(false);
                  }}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Code2 size={15} color="#38bdf8" />
                  <span>Code Block (Syntax Highlighted)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setYoutubeModalOpen(true);
                    setIsBlockMenuOpen(false);
                  }}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Video size={15} color="#ef4444" />
                  <span>YouTube Video Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTopicModalOpen(true);
                    setIsBlockMenuOpen(false);
                  }}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Layers size={15} color="#c084fc" />
                  <span>Topic Cards Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDefinitionModalOpen(true);
                    setIsBlockMenuOpen(false);
                  }}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <BookOpen size={15} color="#34d399" />
                  <span>Definition Box</span>
                </button>

                <div style={{ borderTop: '1px solid #1e293b', margin: '6px 0' }} />
                <div style={{ padding: '4px 14px 6px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Callout Notes
                </div>

                <button
                  type="button"
                  onClick={() => insertCallout('info')}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Info size={15} color="#3b82f6" />
                  <span>Info Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertCallout('warning')}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <AlertTriangle size={15} color="#f59e0b" />
                  <span>Warning Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertComparisonTable()}
                  style={{ width: '100%', padding: '8px 14px', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <TableIcon size={15} color="#94a3b8" />
                  <span>Comparison Table</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Preview Modal Button */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: '#030712',
              color: '#38bdf8',
              border: '1px solid #1e293b',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Save Draft</span>
          </button>

          {/* Publish / Update Button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || publishing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>{status === 'published' ? 'Update & Compile' : 'Publish'}</span>
          </button>

          {/* Toggle Slide-Over Page Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            style={{
              padding: '7px 9px',
              borderRadius: '8px',
              background: isSettingsOpen ? '#1e293b' : '#030712',
              color: isSettingsOpen ? '#38bdf8' : '#94a3b8',
              border: '1px solid #1e293b',
              cursor: 'pointer'
            }}
            title="Page Settings (Course, Slug, SEO, CSS)"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            right: '24px',
            zIndex: 99,
            background: '#064e3b',
            color: '#a7f3d0',
            border: '1px solid #059669',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          <CheckCircle size={16} color="#34d399" />
          <span>{saveMessage}</span>
          <button onClick={() => setSaveMessage(null)} style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Main Blogger Workspace (Full Blank Screen) ────────────────────────── */}
      <div className="blogger-workspace">
        {/* Canvas Area: Full Screen Sheet */}
        <div className="blogger-canvas-area">
          <div className="blogger-canvas-sheet">
            {/* ── Normal / Visual Mode: CKEditor 5 Full Canvas ─────────────────── */}
            <div
              style={{
                display: editorMode === 'normal' ? 'flex' : 'none',
                width: '100%',
                flex: 1,
                flexDirection: 'column'
              }}
            >
              <CKEditorWrapper
                value={contentHtml}
                onChange={(data) => setContentHtml(data)}
                onReady={(editor) => {
                  editorRef.current = editor;
                }}
                canvasTheme={canvasTheme}
              />
            </div>

            {/* ── Code / HTML Mode: Raw HTML Source Editor ─────────────────────── */}
            <div
              style={{
                display: editorMode === 'code' ? 'flex' : 'none',
                width: '100%',
                flex: 1,
                flexDirection: 'column'
              }}
            >
              <div className="blogger-code-workspace">
                <div className="blogger-code-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={16} color="#38bdf8" />
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>HTML Source Editor</span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>
                      (Direct raw HTML editing with dynamic sync to Normal Compose)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Quick Tag Chips */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['h2', 'p', 'div', 'code', 'table'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => insertTagInCode(t)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#94a3b8',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          &lt;{t}&gt;
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleBeautifyHtml}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Format HTML
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: copiedCode ? '#34d399' : '#cbd5e1',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  className="blogger-code-editor-textarea"
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="<!-- Write or paste raw HTML code here... -->"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Slide-Over Page Settings Drawer (Collapsible) ───────────────────── */}
        <aside className={`blogger-slide-drawer ${isSettingsOpen ? '' : 'drawer-closed'}`}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Page Settings
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Course Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Assigned Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '13px' }}
              >
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Topic */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Parent Section / Topic
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '13px' }}
              >
                <option value="">(None - Top Level Chapter)</option>
                {siblingPages.map((sp) => (
                  <option key={sp.page_id} value={sp.page_id}>
                    {sp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* URL Slug */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. integer-variables"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '13px' }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Path: /courses/{currentCourse?.slug || 'course'}/{slug || 'page'}
              </div>
            </div>

            {/* Ordering */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={pageOrder}
                onChange={(e) => setPageOrder(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '13px' }}
              />
            </div>

            {/* Scoped Custom CSS */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Page-Specific Scoped CSS (.css)
              </label>
              <textarea
                rows={4}
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder="/* Specific CSS rules compiled into this page's .css file */"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            {/* Scoped Custom JS */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Page-Specific Custom JS (.js)
              </label>
              <textarea
                rows={3}
                value={customJs}
                onChange={(e) => setCustomJs(e.target.value)}
                placeholder="// Scoped client logic compiled into this page's .js file"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            {/* SEO Settings */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                SEO Meta Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Master C Variables - Complete Course"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief meta description for search engines..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modal Live Preview ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Live Preview: ${title || 'Untitled'}`}
        maxWidth="1200px"
      >
        <div style={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
          <LivePreviewFrame
            title={title}
            courseTitle={currentCourse?.title}
            htmlContent={contentHtml}
            customCss={customCss}
            videoData={{
              url: videoUrl,
              thumbnail: videoThumbnail || '/as_logo.webp',
              title: videoTitle,
              isHeroBanner: false
            }}
            deviceMode={deviceMode}
            onChangeDeviceMode={setDeviceMode}
          />
        </div>
      </Modal>

      {/* ── Educational Block Modals ───────────────────────────────────────────── */}
      <CodeBlockModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onInsert={(codeHtml) => insertHtmlSnippet(codeHtml)}
      />

      <YouTubeModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onInsert={(videoHtml) => insertHtmlSnippet(videoHtml)}
        onOpenMediaPicker={() => {
          setYoutubeModalOpen(false);
          setMediaModalOpen(true);
        }}
      />

      <TopicCardsModal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        onInsert={(cardsHtml) => insertHtmlSnippet(cardsHtml)}
      />

      <DefinitionBoxModal
        isOpen={definitionModalOpen}
        onClose={() => setDefinitionModalOpen(false)}
        onInsert={(defHtml) => insertHtmlSnippet(defHtml)}
      />

      <MediaPickerModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectMedia={(mediaUrl: string, altText?: string) => {
          const imgHtml = `<img src="${mediaUrl}" alt="${altText || 'Course Illustration'}" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />`;
          insertHtmlSnippet(imgHtml);
          setMediaModalOpen(false);
        }}
      />
    </div>
  );
};
