import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Upload, Image as ImageIcon, Search, Check, Trash2, Loader2 } from 'lucide-react';
import { cmsApi } from '../../services/cmsApi';
import { CmsMedia } from '../../types/cms';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (mediaUrl: string, altText?: string) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelectMedia }) => {
  const [mediaList, setMediaList] = useState<CmsMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<CmsMedia | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const items = await cmsApi.getMedia(search);
      setMediaList(items);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await cmsApi.uploadMedia(file, file.name);
      setMediaList(prev => [uploaded, ...prev]);
      setSelectedMedia(uploaded);
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Upload failed. Please ensure the file is an image (PNG, JPG, WebP, SVG).');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedMedia) {
      onSelectMedia(selectedMedia.file_url, selectedMedia.alt_text || selectedMedia.title);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Media Library & Image Selector" maxWidth="800px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Upload & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search images, diagrams, thumbnails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {/* Media Grid */}
        <div style={{ minHeight: '280px', maxHeight: '420px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p>Loading media library items...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed #1e293b', borderRadius: '10px' }}>
              <ImageIcon size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>No media items found</h4>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Upload course illustrations, diagrams, or YouTube video thumbnails above.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {mediaList.map((m) => {
                const isSelected = selectedMedia?.media_id === m.media_id;
                return (
                  <div
                    key={m.media_id}
                    onClick={() => setSelectedMedia(m)}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #1e293b',
                      background: '#020617',
                      cursor: 'pointer',
                      aspectRatio: '1',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={m.file_url}
                      alt={m.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '4px 6px', fontSize: '11px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            {selectedMedia ? `Selected: ${selectedMedia.title} (${selectedMedia.file_size_kb} KB)` : 'Click an image to select'}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedMedia}
              onClick={handleConfirmSelect}
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
