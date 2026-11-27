import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Video, Play, ExternalLink, Image as ImageIcon, Check } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (videoHtml: string) => void;
  onOpenMediaPicker?: () => void;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  onOpenMediaPicker
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [embedMode, setEmbedMode] = useState<'card' | 'iframe'>('card');
  const [autoThumbnail, setAutoThumbnail] = useState('');

  // Automatically extract video ID and detect thumbnail
  useEffect(() => {
    const id = extractYouTubeId(videoUrl);
    if (id) {
      setAutoThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    } else {
      setAutoThumbnail('');
    }
  }, [videoUrl]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setVideoUrl('');
      setThumbnailUrl('');
      setTitle('');
      setOpenInNewTab(true);
      setEmbedMode('card');
      setAutoThumbnail('');
    }
  }, [isOpen]);

  const activeThumbnail = thumbnailUrl.trim() || autoThumbnail || '/as_logo.webp';
  const youtubeId = extractYouTubeId(videoUrl);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    let htmlSnippet = '';
    const targetAttr = openInNewTab ? '_blank' : '_self';
    const relAttr = openInNewTab ? 'noopener noreferrer' : '';

    if (embedMode === 'iframe' && youtubeId) {
      // Direct responsive iframe player
      htmlSnippet = `
        <div class="cms-video-embed" style="position: relative; width: 100%; aspect-ratio: 16 / 9; min-height: 320px; margin: 24px 0; border-radius: 12px; overflow: hidden; background: #000000; border: 1px solid #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${youtubeId}"
            title="${(title || 'Video Player').replace(/"/g, '&quot;')}"
            style="width: 100%; height: 100%; min-height: 320px; border: none; display: block;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `.trim();
    } else {
      // Clean CKEditor-compatible Video Card (avoids block elements inside <a>)
      const safeTitle = (title || 'Watch Video Lecture').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeAlt = (title || 'Watch Video Lecture').replace(/"/g, '&quot;');
      htmlSnippet = `
        <div class="cms-youtube-card" style="margin: 24px 0; border-radius: 12px; overflow: hidden; background: #0f172a; border: 1px solid #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);">
          <a href="${videoUrl.trim()}" target="${targetAttr}" rel="${relAttr}">
            <img
              src="${activeThumbnail}"
              alt="${safeAlt}"
              style="display: block; width: 100%; max-height: 420px; object-fit: cover;"
            />
          </a>
          <div class="cms-youtube-caption" style="padding: 12px 18px; background: #0f172a; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <span style="font-weight: 600; font-size: 14px; color: #f8fafc;">${safeTitle}</span>
            <a href="${videoUrl.trim()}" target="${targetAttr}" rel="${relAttr}" style="font-size: 12px; font-weight: 600; color: #38bdf8; text-decoration: none; white-space: nowrap;">
              Watch on YouTube &rarr;
            </a>
          </div>
        </div>
      `.trim();
    }

    onInsert(htmlSnippet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Video at Cursor">
      <form onSubmit={handleInsert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">
            YouTube Video URL <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="url"
            className="form-input"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            required
            autoFocus
          />
          {youtubeId && (
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> Detected YouTube Video ID: <strong>{youtubeId}</strong>
            </div>
          )}
        </div>

        {/* Display Style Choice */}
        <div>
          <label className="form-label">Display Style</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setEmbedMode('card')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: embedMode === 'card' ? '2px solid #3b82f6' : '1px solid #1e293b',
                background: embedMode === 'card' ? 'rgba(59, 130, 246, 0.15)' : '#090e1a',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={14} color="#ef4444" /> Video Card
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                High-res thumbnail with play button
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEmbedMode('iframe')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: embedMode === 'iframe' ? '2px solid #3b82f6' : '1px solid #1e293b',
                background: embedMode === 'iframe' ? 'rgba(59, 130, 246, 0.15)' : '#090e1a',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Video size={14} color="#38bdf8" /> Embedded Player
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Direct iframe player inside the page
              </div>
            </button>
          </div>
        </div>

        {/* Video Title */}
        <div>
          <label className="form-label">Video Title (Optional caption banner)</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Android Studio Alert Dialog in 5 Minutes | Java Tutorial"
          />
        </div>

        {embedMode === 'card' && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Custom Thumbnail URL (Optional)</label>
                {onOpenMediaPicker && (
                  <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ImageIcon size={12} /> Choose from Media Library
                  </button>
                )}
              </div>
              <input
                type="text"
                className="form-input"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder={autoThumbnail ? `Auto-detected from YouTube` : 'https://... or choose from library'}
              />
            </div>

            <div>
              <label className="form-label">Link Behavior</label>
              <select
                className="form-select"
                value={openInNewTab ? '_blank' : '_self'}
                onChange={(e) => setOpenInNewTab(e.target.value === '_blank')}
              >
                <option value="_blank">Open on YouTube in New Tab (_blank) - Recommended</option>
                <option value="_self">Open in Current Tab (_self)</option>
              </select>
            </div>
          </>
        )}

        {/* Live Visual Preview of the Video Card */}
        {videoUrl && (
          <div style={{ marginTop: '4px', padding: '10px', background: '#030712', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Preview:</div>
            <div style={{ position: 'relative', width: '100%', paddingTop: '40%', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
              <img
                src={activeThumbnail}
                alt="Preview"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/as_logo.webp';
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={18} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
              </div>
            </div>
            {title && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginTop: '6px' }}>{title}</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Tip: Video is placed at your exact cursor position. You can add as many videos as you want!
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!videoUrl.trim()}>
              Insert Video at Cursor
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
