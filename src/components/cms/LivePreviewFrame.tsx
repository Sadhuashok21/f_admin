import React from 'react';
import { Monitor, Tablet, Smartphone, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface LivePreviewFrameProps {
  title: string;
  courseTitle?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  htmlContent: string;
  customCss?: string;
  videoData?: {
    url?: string;
    thumbnail?: string;
    title?: string;
  };
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  onChangeDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  title,
  courseTitle = 'C Programming',
  breadcrumbs,
  htmlContent,
  customCss = '',
  videoData,
  deviceMode,
  onChangeDeviceMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const videoHtml = videoData?.url
    ? `
      <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; background: #070b13; border: 1px solid #1e293b;">
        <a href="${videoData.url}" target="_blank" rel="noopener noreferrer" style="display: block; position: relative; text-decoration: none;">
          <div style="position: relative; padding-top: 56.25%; width: 100%; background: #020617;">
            <img src="${videoData.thumbnail || '/yt_img.jpg'}" alt="Preview" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
              <div style="width: 54px; height: 54px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" style="margin-left: 2px;">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
          ${videoData.title ? `<div style="padding: 10px 14px; font-weight: 600; font-size: 13px; color: #f8fafc; background: #0f172a;">${videoData.title}</div>` : ''}
        </a>
      </div>
    `
    : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#030712',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      {/* Viewport Control Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          background: '#0b0f19',
          borderBottom: '1px solid #1e293b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Preview
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            ({deviceMode === 'desktop' ? 'Desktop Full Width' : deviceMode === 'tablet' ? 'Tablet 768px' : 'Mobile 375px'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className={`btn btn-sm ${deviceMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onChangeDeviceMode('desktop')}
            title="Desktop View"
            style={{ padding: '4px 8px' }}
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${deviceMode === 'tablet' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onChangeDeviceMode('tablet')}
            title="Tablet View (768px)"
            style={{ padding: '4px 8px' }}
          >
            <Tablet size={14} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${deviceMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onChangeDeviceMode('mobile')}
            title="Mobile View (375px)"
            style={{ padding: '4px 8px' }}
          >
            <Smartphone size={14} />
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
              style={{ padding: '4px 8px', marginLeft: '6px' }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          padding: deviceMode === 'desktop' ? '0' : '20px 10px',
          background: '#050811'
        }}
      >
        <div
          style={{
            width: getContainerWidth(),
            minHeight: '100%',
            background: '#070b13',
            border: deviceMode === 'desktop' ? 'none' : '2px solid #1e293b',
            borderRadius: deviceMode === 'desktop' ? '0' : '16px',
            boxShadow: deviceMode === 'desktop' ? 'none' : '0 20px 40px rgba(0,0,0,0.7)',
            padding: '24px 28px',
            boxSizing: 'border-box',
            transition: 'width 0.25s ease',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Breadcrumbs Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            <span>Courses</span>
            <span>&gt;</span>
            <span style={{ color: '#94a3b8' }}>{courseTitle}</span>
            <span>&gt;</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{title || 'Untitled Page'}</span>
          </div>

          {/* Page Heading */}
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            {title || 'Untitled Educational Topic'}
          </h1>

          {/* YouTube Video Header if present */}
          {videoHtml && <div dangerouslySetInnerHTML={{ __html: videoHtml }} />}

          {/* Injected Scoped CSS */}
          <style>{customCss}</style>

          {/* Educational Content */}
          <div
            className="generated-content"
            style={{ lineHeight: 1.7, fontSize: '15px', color: '#cbd5e1' }}
            dangerouslySetInnerHTML={{ __html: htmlContent || '<p style="color: #64748b; font-style: italic;">No content written yet. Type in CKEditor or insert blocks from the left palette to see live rendering...</p>' }}
          />

          {/* Next/Prev Navigation Mock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              &larr; Previous Topic
            </div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
              Next Topic &rarr;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
