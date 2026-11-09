import React, { useEffect, useState, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  FileImage,
  Info
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { CmsMedia } from '../../../types/cms';

export const CmsMediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<CmsMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await cmsApi.getMedia(search || undefined);
      setMediaList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      await cmsApi.uploadMedia(selectedFile, uploadTitle.trim(), uploadAlt.trim());
      setSelectedFile(null);
      setUploadTitle('');
      setUploadAlt('');
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string, title: string) => {
    if (!window.confirm(`Delete media item "${title}"?`)) return;
    try {
      await cmsApi.deleteMedia(mediaId);
      await fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.alt_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main, #f1f5f9)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={24} color="#6366f1" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Media Library</h1>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
            Upload, inspect, and manage YouTube thumbnails, course illustrations, and diagram assets.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div style={{
        background: 'var(--card-bg, #1e293b)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #334155)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={18} color="#6366f1" />
          Upload New Image or Thumbnail
        </h3>

        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px dashed var(--border-color, #334155)',
                borderRadius: '8px',
                color: 'inherit',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <input
              type="text"
              placeholder="Title (optional)"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color, #334155)',
                borderRadius: '6px',
                color: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <input
              type="text"
              placeholder="Alt description for SEO"
              value={uploadAlt}
              onChange={e => setUploadAlt(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color, #334155)',
                borderRadius: '6px',
                color: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: selectedFile ? '#4f46e5' : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: selectedFile ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        {previewUrl && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={previewUrl}
              alt="Selected Preview"
              style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #475569' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              Ready to upload: {selectedFile?.name} ({(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) : 0)} KB)
            </span>
          </div>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card-bg, #1e293b)',
        padding: '0.75rem 1.2rem',
        borderRadius: '10px',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color, #334155)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted, #94a3b8)" />
          <input
            type="text"
            placeholder="Search media by title or alt text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              outline: 'none',
              width: '100%',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
          <span>Total Media Assets: <strong style={{ color: '#fff' }}>{mediaList.length}</strong></span>
          <button
            onClick={fetchMedia}
            title="Refresh"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <div>Loading media files...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--card-bg, #1e293b)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color, #334155)'
        }}>
          <FileImage size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No Media Found</h3>
          <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem' }}>
            Upload YouTube thumbnails and course diagrams using the form above.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {filtered.map(m => (
            <div
              key={m.media_id}
              style={{
                backgroundColor: 'var(--card-bg, #1e293b)',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #334155)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Image Preview Container */}
              <div style={{
                height: '150px',
                backgroundColor: '#0f172a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={m.file_url}
                  alt={m.alt_text || m.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Info & Metadata */}
              <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{
                    margin: '0 0 4px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {m.title}
                  </h4>
                  {m.alt_text && (
                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted, #94a3b8)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      Alt: {m.alt_text}
                    </p>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px' }}>
                    {m.file_size_kb ? `${m.file_size_kb} KB` : ''}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-color, #334155)' }}>
                  <button
                    onClick={() => handleCopyUrl(m.file_url, m.media_id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '0.4rem',
                      backgroundColor: copiedId === m.media_id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      color: copiedId === m.media_id ? '#34d399' : '#818cf8',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedId === m.media_id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === m.media_id ? 'Copied!' : 'Copy URL'}
                  </button>

                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Full Image"
                    style={{
                      padding: '0.4rem 0.55rem',
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                      color: '#cbd5e1',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => handleDelete(m.media_id, m.title)}
                    title="Delete Image"
                    style={{
                      padding: '0.4rem 0.55rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CmsMediaLibraryPage;
