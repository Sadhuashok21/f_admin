import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Video, ExternalLink } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (videoHtml: string) => void;
  onOpenMediaPicker?: () => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, onInsert, onOpenMediaPicker }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    const targetAttr = openInNewTab ? '_blank' : '_self';
    const relAttr = openInNewTab ? 'noopener noreferrer' : '';

    const htmlSnippet = `
      <div class="cms-youtube-card" style="margin: 28px 0; border-radius: 12px; overflow: hidden; background: #070b13; border: 1px solid #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
        <a href="${videoUrl.trim()}" target="${targetAttr}" rel="${relAttr}" style="display: block; position: relative; text-decoration: none; overflow: hidden; group;">
          <div style="position: relative; padding-top: 56.25%; width: 100%; background: #020617;">
            <img
              src="${thumbnailUrl.trim() || '/as_logo.webp'}"
              alt="${title || 'Watch Video Lecture'}"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
            />
            <!-- Play Button Overlay -->
            <div style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; transition: background 0.2s ease;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(239, 68, 68, 0.6);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" style="margin-left: 3px;">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
          ${title ? `
            <div style="padding: 12px 18px; background: #0f172a; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; font-size: 14px; color: #f8fafc;">${title}</span>
              <span style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                Watch on YouTube &rarr;
              </span>
            </div>
          ` : ''}
        </a>
      </div>
    `;

    onInsert(htmlSnippet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert YouTube Video Card">
      <form onSubmit={handleInsert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">YouTube Video URL</label>
          <input
            type="url"
            className="form-input"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ margin: 0 }}>Thumbnail Image URL</label>
            {onOpenMediaPicker && (
              <button
                type="button"
                onClick={onOpenMediaPicker}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer' }}
              >
                Choose from Media Library
              </button>
            )}
          </div>
          <input
            type="text"
            className="form-input"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://... or select from media"
          />
        </div>

        <div>
          <label className="form-label">Video Title (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. C Programming Tutorial: Variables Explained"
          />
        </div>

        <div>
          <label className="form-label">Open Behavior</label>
          <select
            className="form-select"
            value={openInNewTab ? '_blank' : '_self'}
            onChange={(e) => setOpenInNewTab(e.target.value === '_blank')}
          >
            <option value="_blank">Open in New Tab (_blank) - Recommended</option>
            <option value="_self">Open in Current Tab (_self)</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Insert Video
          </button>
        </div>
      </form>
    </Modal>
  );
};
