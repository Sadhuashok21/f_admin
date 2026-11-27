import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  PlayCircle,
  RefreshCw,
  MessageSquare,
  X,
  Send,
  Video as VideoIcon,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Video, Course, VideoComment, VideoChapter } from '../../types';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { validateAdminUploadSize, formatFileSize } from '../../utils/uploadLimit';

const formatMmSs = (sec: number): string => {
  const safe = Math.max(0, Math.floor(Number(sec) || 0));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
};

const parseMmSs = (val: string): number => {
  const clean = val.trim();
  if (!clean) return 0;
  if (clean.includes(':')) {
    const parts = clean.split(':').map(Number);
    if (parts.length === 2 && !parts.some(Number.isNaN)) {
      return Math.max(0, parts[0] * 60 + parts[1]);
    }
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
      return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
  }
  const num = Number(clean);
  return Number.isNaN(num) ? 0 : Math.max(0, Math.floor(num));
};

type DraftChapterRow = { timeInput: string; title: string };

const toVideoChapters = (rows: DraftChapterRow[]): VideoChapter[] =>
  rows
    .filter(r => r.title.trim())
    .map(r => ({ time: parseMmSs(r.timeInput), title: r.title.trim() }))
    .sort((a, b) => a.time - b.time);

export const SkiltrixVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [createChapterRows, setCreateChapterRows] = useState<DraftChapterRow[]>([]);

  // Video Player Modal state
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  // Timeline Chapters & Lesson Content Modal state
  const [editingTimelineVideo, setEditingTimelineVideo] = useState<Video | null>(null);
  const [timelineRows, setTimelineRows] = useState<DraftChapterRow[]>([]);
  const [transcriptRows, setTranscriptRows] = useState<DraftChapterRow[]>([]);
  const [lessonNotesDraft, setLessonNotesDraft] = useState('');
  const [codeLangDraft, setCodeLangDraft] = useState('python');
  const [codeSnippetDraft, setCodeSnippetDraft] = useState('');
  const [savingTimeline, setSavingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState('');

  // Comments Modal state
  const [activeCommentsVideo, setActiveCommentsVideo] = useState<Video | null>(null);
  const [commentsList, setCommentsList] = useState<VideoComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vids, crss] = await Promise.all([
        api.getVideos(),
        api.getCourses()
      ]);
      setVideos(vids || []);
      const courseList = crss || [];
      setCourses(courseList);
      if (courseList.length > 0 && !courseId) {
        setCourseId(courseList[0].course_id);
      }
    } catch {
      setVideos([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateAdminUploadSize(file);
      if (!check.valid) {
        setFormError(check.error || 'Video file exceeds the 1 GB admin upload limit.');
        e.target.value = '';
        setVideoFile(null);
        return;
      }
      setFormError('');
      setVideoFile(file);
      if (!title) {
        // Auto-suggest title from filename without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    } else {
      setVideoFile(null);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!videoFile) {
      setFormError('Please select a video media file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setUploadStatusText('Uploading video to CDN...');

    try {
      // 1. Upload Video file directly to CDN endpoint
      const videoUploadRes = await api.uploadCdnAsset(videoFile, 'st_video', percent => {
        setUploadProgress(Math.min(70, Math.round(percent * 0.7)));
      });

      // 2. Upload Thumbnail if selected
      let imageFilename = 'default_video.webp';
      if (imageFile) {
        setUploadStatusText('Uploading thumbnail image to CDN...');
        const imageUploadRes = await api.uploadCdnAsset(imageFile, 'st_image', percent => {
          setUploadProgress(70 + Math.min(20, Math.round(percent * 0.2)));
        });
        imageFilename = imageUploadRes.filename || imageUploadRes.url;
      }

      // 3. Save Video record to database
      setUploadStatusText('Saving video lecture to SkilTrix...');
      setUploadProgress(95);

      const created = await api.createVideo({
        title,
        description,
        course_id: courseId,
        video: videoUploadRes.filename || videoUploadRes.url,
        image: imageFilename,
        chapters: toVideoChapters(createChapterRows),
      });

      setUploadProgress(100);
      setUploadStatusText('Complete!');

      setTimeout(() => {
        setIsUploading(false);
        setVideos(prevList => [created, ...prevList]);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setImageFile(null);
        setImagePreview('');
        setCreateChapterRows([]);
        setUploadProgress(0);
        setUploadStatusText('');
      }, 400);
    } catch (err: any) {
      console.error('Failed to upload/create video:', err);
      setFormError(err.message || 'Failed to upload video media. Please check API server.');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this lecture video?')) {
      try {
        await api.deleteVideo(id);
        setVideos(prev => prev.filter(v => v.video_id !== id));
      } catch (err) {
        console.error('Failed to delete video:', err);
      }
    }
  };

  const handleOpenTimeline = (video: Video) => {
    setEditingTimelineVideo(video);
    setTimelineError('');
    const existing = Array.isArray(video.chapters) ? video.chapters : [];
    setTimelineRows(
      existing.length > 0
        ? existing.map(ch => ({ timeInput: formatMmSs(ch.time), title: ch.title }))
        : []
    );
    const existingTranscript = Array.isArray(video.transcript) ? video.transcript : [];
    setTranscriptRows(
      existingTranscript.length > 0
        ? existingTranscript.map(tr => ({ timeInput: formatMmSs(tr.start), title: tr.text }))
        : []
    );
    setLessonNotesDraft(video.lesson_notes || '');
    setCodeLangDraft(video.code_language || 'python');
    setCodeSnippetDraft(video.code_snippet || '');
  };

  const handleSaveTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimelineVideo) return;
    setSavingTimeline(true);
    setTimelineError('');
    try {
      const cleaned = toVideoChapters(timelineRows);
      const cleanedTranscript = toVideoChapters(transcriptRows).map(c => ({
        start: c.time,
        end: c.time + 10,
        text: c.title,
      }));
      const updated = await api.updateVideo(editingTimelineVideo.video_id, {
        chapters: cleaned,
        transcript: cleanedTranscript,
        lesson_notes: lessonNotesDraft,
        code_snippet: codeSnippetDraft,
        code_language: codeLangDraft,
      });
      setVideos(prev =>
        prev.map(v =>
          v.video_id === editingTimelineVideo.video_id
            ? {
                ...v,
                chapters: updated.chapters ?? cleaned,
                transcript: updated.transcript ?? cleanedTranscript,
                lesson_notes: updated.lesson_notes ?? lessonNotesDraft,
                code_snippet: updated.code_snippet ?? codeSnippetDraft,
                code_language: updated.code_language ?? codeLangDraft,
              }
            : v
        )
      );
      setEditingTimelineVideo(null);
    } catch (err: any) {
      setTimelineError(err?.message || 'Failed to save lesson content.');
    } finally {
      setSavingTimeline(false);
    }
  };

  const renderChapterEditor = (
    rows: DraftChapterRow[],
    setRows: React.Dispatch<React.SetStateAction<DraftChapterRow[]>>,
    disabled = false
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {rows.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          No timeline chapters added yet. Leave empty or click &quot;Add Milestone&quot;.
        </p>
      ) : (
        rows.map((row, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="00:00"
              value={row.timeInput}
              disabled={disabled}
              onChange={e =>
                setRows(prev => prev.map((r, i) => (i === idx ? { ...r, timeInput: e.target.value } : r)))
              }
            />
            <input
              type="text"
              className="form-input"
              placeholder="Milestone title (e.g. Overview & Setup)"
              value={row.title}
              disabled={disabled}
              onChange={e =>
                setRows(prev => prev.map((r, i) => (i === idx ? { ...r, title: e.target.value } : r)))
              }
            />
            <button
              type="button"
              className="action-btn delete"
              disabled={disabled}
              title="Remove Milestone"
              onClick={() => setRows(prev => prev.filter((_, i) => i !== idx))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))
      )}
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={disabled}
          onClick={() => setRows(prev => [...prev, { timeInput: prev.length === 0 ? '00:00' : '01:00', title: '' }])}
        >
          <Plus size={14} />
          <span>Add Milestone</span>
        </button>
      </div>
    </div>
  );

  // Comments Modal Handlers
  const handleOpenComments = async (video: Video) => {
    setActiveCommentsVideo(video);
    setLoadingComments(true);
    try {
      const list = await api.getComments(video.video_id);
      setCommentsList(list);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setCommentsList([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentsVideo) return;

    setPostingComment(true);
    try {
      const added = await api.createComment({
        video_id: activeCommentsVideo.video_id,
        comment: newCommentText.trim()
      });
      if (added) {
        setCommentsList(prev => [added, ...prev]);
        setNewCommentText('');
        // Update comments_count in local video row
        setVideos(prev =>
          prev.map(v =>
            v.video_id === activeCommentsVideo.video_id
              ? { ...v, comments_count: (v.comments_count || 0) + 1 }
              : v
          )
        );
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      setCommentsList(prev => prev.filter(c => c.id !== commentId));
      if (activeCommentsVideo) {
        setVideos(prev =>
          prev.map(v =>
            v.video_id === activeCommentsVideo.video_id
              ? { ...v, comments_count: Math.max(0, (v.comments_count || 1) - 1) }
              : v
          )
        );
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lecture Videos</h1>
          <p className="page-subtitle">Directly upload videos to CDN and sync seamlessly with SkilTrix</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Video Title</th>
                <th>Video ID</th>
                <th>Assigned Course</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Comments</th>
                <th>Uploaded At</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Retrieving video lectures from database...</span>
                    </div>
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <VideoIcon size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No video lectures uploaded yet.</p>
                    <p style={{ fontSize: '0.85rem' }}>Click &quot;Add Video&quot; above to upload your first lecture video to CDN.</p>
                  </td>
                </tr>
              ) : (
                videos.map(video => (
                  <tr key={video.video_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            position: 'relative',
                            width: '76px',
                            height: '46px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: '#1e293b'
                          }}
                          onClick={() => setPlayingVideo(video)}
                          title="Click to play video"
                        >
                          <img
                            src={video.image}
                            alt={video.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300';
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              transition: 'opacity 0.2s'
                            }}
                          >
                            <PlayCircle size={20} />
                          </div>
                        </div>
                        <div>
                          <div
                            style={{ fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                            onClick={() => setPlayingVideo(video)}
                            title="Click to preview video"
                          >
                            {video.title}
                          </div>
                          {video.video_url && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                              CDN Linked
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {video.video_id}
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.86rem' }}>
                        {video.course_name || video.course_id}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px', color: 'var(--text-muted)', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {video.description}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleOpenComments(video)}
                        title="Manage comments for this video"
                      >
                        <MessageSquare size={13} />
                        <span>{video.comments_count || 0}</span>
                      </button>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{video.created_at}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${video.status}`}>{video.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 9px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenTimeline(video)}
                          title="Set or edit Timeline Chapters"
                        >
                          <Clock size={13} />
                          <span>{(video.chapters?.length || 0) > 0 ? `${video.chapters?.length} Chapters` : 'Set Timeline'}</span>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => setPlayingVideo(video)}
                          title="Preview Video"
                          style={{ color: 'var(--primary)' }}
                        >
                          <PlayCircle size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(video.video_id)}
                          title="Delete Video"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Video Modal with Direct Video Upload */}
      <Modal isOpen={isModalOpen} onClose={() => !isUploading && setIsModalOpen(false)} title="Upload Video Lecture to SkilTrix">
        <form onSubmit={handleAddVideo}>
          {formError && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="video_title">
              Video Title <span className="star">*</span>
            </label>
            <input
              type="text"
              id="video_title"
              className="form-input"
              placeholder="e.g. Lesson 1: Introduction to Components & Hooks"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video_course">
              Associated Course <span className="star">*</span>
            </label>
            <select
              id="video_course"
              className="form-select"
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              required
              disabled={isUploading}
            >
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video_file">
              Video Media File <span className="star">*</span>
            </label>
            <input
              type="file"
              id="video_file"
              className="form-input"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
              onChange={handleVideoChange}
              required
              disabled={isUploading}
            />
            {videoFile && (
              <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={13} />
                <span>Selected: {videoFile.name} ({formatFileSize(videoFile.size)})</span>
              </p>
            )}
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px', display: 'block' }}>
              Admin Panel Upload Limit: up to 1 GB per video file
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video_cover">
              Thumbnail Cover Image
            </label>
            <input
              type="file"
              id="video_cover"
              className="form-input"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </div>

          {imagePreview && (
            <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
              <img
                src={imagePreview}
                alt="Thumbnail Preview"
                style={{ width: '160px', height: '95px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="video_desc">
              Description <span className="star">*</span>
            </label>
            <textarea
              id="video_desc"
              className="form-textarea"
              placeholder="Lecture chapter overview and key takeaways for learners..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Timeline Chapters (Optional — format MM:SS)</label>
            {renderChapterEditor(createChapterRows, setCreateChapterRows, isUploading)}
          </div>

          {isUploading && (
            <div style={{ margin: '1.25rem 0', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 500 }}>
                <span>{uploadStatusText || 'Uploading...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.25s' }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              <Upload size={16} />
              <span>{isUploading ? 'Uploading Video...' : 'Upload Video'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Video Player Modal */}
      {playingVideo && (
        <Modal isOpen={!!playingVideo} onClose={() => setPlayingVideo(null)} title={playingVideo.title}>
          <div style={{ padding: '0.5rem 0' }}>
            {playingVideo.video_url ? (
              <video
                controls
                autoPlay
                src={playingVideo.video_url}
                poster={playingVideo.image}
                style={{ width: '100%', maxHeight: '65vh', borderRadius: '8px', background: '#000' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>No video URL available for playback.</p>
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {playingVideo.course_name}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {playingVideo.video_id}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {playingVideo.description}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Timeline Chapters & Lesson Content Modal */}
      {editingTimelineVideo && (
        <Modal
          isOpen={!!editingTimelineVideo}
          onClose={() => !savingTimeline && setEditingTimelineVideo(null)}
          title={`Timeline, Transcript & Notes — ${editingTimelineVideo.title}`}
        >
          <form onSubmit={handleSaveTimeline} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '72vh', overflowY: 'auto' }}>
            {timelineError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.84rem' }}>
                {timelineError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Timeline Chapters (MM:SS)</label>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                Add lesson milestone timestamps (e.g. <code>00:00</code>, <code>03:15</code>).
              </p>
              {renderChapterEditor(timelineRows, setTimelineRows, savingTimeline)}
            </div>

            <div className="form-group">
              <label className="form-label">Subtitles Transcript Cues (MM:SS)</label>
              {renderChapterEditor(transcriptRows, setTranscriptRows, savingTimeline)}
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Notes &amp; Key Takeaways</label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="Write lesson summary notes and takeaways..."
                value={lessonNotesDraft}
                disabled={savingTimeline}
                onChange={e => setLessonNotesDraft(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Lesson Code Example</label>
                <select
                  className="form-select"
                  style={{ width: '140px', padding: '0.25rem 0.5rem' }}
                  value={codeLangDraft}
                  disabled={savingTimeline}
                  onChange={e => setCodeLangDraft(e.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>
              <textarea
                rows={4}
                className="form-textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                placeholder="Optional runnable code snippet for the Try the Code tab..."
                value={codeSnippetDraft}
                disabled={savingTimeline}
                onChange={e => setCodeSnippetDraft(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={savingTimeline}
                onClick={() => setEditingTimelineVideo(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={savingTimeline}>
                <Clock size={15} />
                <span>{savingTimeline ? 'Saving...' : 'Save Lesson Content'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Comments Section Modal for Video */}
      {activeCommentsVideo && (
        <Modal
          isOpen={!!activeCommentsVideo}
          onClose={() => setActiveCommentsVideo(null)}
          title={`Discussion & Comments (${activeCommentsVideo.title})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* New Comment Form */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write an admin comment or reply..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                style={{ flex: 1 }}
                disabled={postingComment}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={postingComment || !newCommentText.trim()}
                style={{ padding: '0.5rem 1rem' }}
              >
                <Send size={15} />
                <span>{postingComment ? 'Posting...' : 'Reply'}</span>
              </button>
            </form>

            {/* Comments List */}
            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Loading comments...</p>
                </div>
              ) : commentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '8px' }}>
                  <MessageSquare size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 500 }}>No comments yet on this video.</p>
                  <p style={{ fontSize: '0.8rem' }}>Learner questions and comments will appear here.</p>
                </div>
              ) : (
                commentsList.map(comment => (
                  <div
                    key={comment.id}
                    style={{
                      background: 'var(--bg-main)',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {comment.user_name || 'Learner'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {comment.created_at || 'Recently'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
                        {comment.comment}
                      </p>
                    </div>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete Comment"
                      style={{ padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
