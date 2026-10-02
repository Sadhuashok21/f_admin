import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, Upload, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialCourses } from '../../data/mockData';
import { Course } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [paid, setPaid] = useState<0 | 1>(0);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data && data.length > 0 ? data : initialCourses);
    } catch {
      setCourses(initialCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(65);
      const created = await api.createCourse({
        name,
        type,
        paid,
        price: paid === 1 ? Number(price) : undefined,
        description,
        image: imagePreview
      });

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setCourses(prevList => [created, ...prevList]);
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setImagePreview('');
        setPrice(undefined);
        setUploadProgress(0);
      }, 300);
    } catch (err) {
      console.error('Failed to create course:', err);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this course from catalog?')) {
      try {
        await api.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.course_id !== id));
      } catch (err) {
        console.error('Failed to delete course:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Catalog</h1>
          <p className="page-subtitle">Interactive technical curriculums, video lectures, and certificate tracks</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchCourses} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Loading technical courses...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Course ID</th>
                  <th>Difficulty Level</th>
                  <th>Pricing</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.course_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={course.image}
                          alt={course.name}
                          style={{ width: '64px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{course.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {course.course_id}
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: 'capitalize',
                          background: 'rgba(0,0,0,0.05)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {course.type}
                      </span>
                    </td>
                    <td>
                      {course.paid === 1 ? (
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                          Paid • ₹{course.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Free Track</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{course.created_at}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${course.status}`}>{course.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(course.course_id)}
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleAddCourse}>
          <div className="form-group">
            <label className="form-label" htmlFor="course_name">
              Course Title <span className="star">*</span>
            </label>
            <input
              type="text"
              id="course_name"
              className="form-input"
              placeholder="e.g. Master Django Rest Framework & Next.js"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="course_type">
                Difficulty Level <span className="star">*</span>
              </label>
              <select
                id="course_type"
                className="form-select"
                value={type}
                onChange={e => setType(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course_paid">
                Access Pricing <span className="star">*</span>
              </label>
              <select
                id="course_paid"
                className="form-select"
                value={paid}
                onChange={e => setPaid(Number(e.target.value) as 0 | 1)}
                required
              >
                <option value={0}>Free Community Course</option>
                <option value={1}>Paid Certification</option>
              </select>
            </div>
          </div>

          {paid === 1 && (
            <div className="form-group">
              <label className="form-label" htmlFor="course_price">
                Enrollment Fee (₹) <span className="star">*</span>
              </label>
              <input
                type="number"
                id="course_price"
                className="form-input"
                placeholder="e.g. 1999"
                value={price || ''}
                onChange={e => setPrice(Number(e.target.value))}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="course_desc">
              Curriculum Overview & Scope <span className="star">*</span>
            </label>
            <textarea
              id="course_desc"
              className="form-textarea"
              placeholder="What students will build, learn, and master..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Banner Image <span className="star">*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '80px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                />
              )}
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  required={!imagePreview}
                />
              </label>
            </div>
          </div>

          {isUploading && (
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Uploading curriculum assets...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              Create Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
