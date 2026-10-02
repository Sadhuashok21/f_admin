import React, { useState, useEffect } from 'react';
import { Plus, Film, Trash2, Upload, PlayCircle, RefreshCw, Loader2 } from 'lucide-react';
import { initialVideos, initialCourses } from '../../data/mockData';
import { Video, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';

export const SkiltrixVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vids, crss] = await Promise.all([
        api.getVideos(),
        api.getCourses()
      ]);
      setVideos(vids && vids.length > 0 ? vids : initialVideos);
      const courseList = crss && crss.length > 0 ? crss : initialCourses;
      setCourses(courseList);
      if (courseList.length > 0 && !courseId) {
        setCourseId(courseList[0].course_id);
      }
    } catch {
      setVideos(initialVideos);
      setCourses(initialCourses);
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(65);
      const created = await api.createVideo({
        title,
        description,
        course_id: courseId,
        image: imagePreview
      });

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setVideos(prevList => [created, ...prevList]);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setImagePreview('');
        setUploadProgress(0);
      }, 300);
    } catch (err) {
      console.error('Failed to create video:', err);
      setIsUploading(false);
      setUploadProgress(0);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lecture Videos</h1>
          <p className="page-subtitle">Host video tutorials, lesson recordings, and course syllabus chapters</p>
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
                <th>Uploaded At</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video.video_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '70px', height: '44px', borderRadius: '6px', overflow: 'hidden' }}>
                        <img
                          src={video.image}
                          alt={video.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <PlayCircle size={18} />
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{video.title}</span>
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
                  <td style={{ maxWidth: '300px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    {video.description}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{video.created_at}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${video.status}`}>{video.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="action-btn delete" onClick={() => handleDelete(video.video_id)} title="Delete Video">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Video Modal matching videos.html */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Video Lecture">
        <form onSubmit={handleAddVideo}>
          <div className="form-group">
            <label className="form-label" htmlFor="video_title">
              Video Title <span className="star">*</span>
            </label>
            <input
              type="text"
              id="video_title"
              className="form-input"
              placeholder="e.g. Lesson 1: Introduction to Components"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
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
              accept="video/*"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video_cover">
              Thumbnail Cover Image <span className="star">*</span>
            </label>
            <input
              type="file"
              id="video_cover"
              className="form-input"
              accept="image/*"
              onChange={handleImageChange}
              required={!imagePreview}
            />
          </div>

          {imagePreview && (
            <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
              <img
                src={imagePreview}
                alt="Thumbnail Preview"
                style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
          )}

          {isUploading && (
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Uploading video stream and thumbnail...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="video_desc">
              Description <span className="star">*</span>
            </label>
            <textarea
              id="video_desc"
              className="form-textarea"
              placeholder="Lecture chapter overview and key takeaways..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              <Upload size={16} />
              <span>{isUploading ? 'Uploading Video...' : 'Add Video'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
