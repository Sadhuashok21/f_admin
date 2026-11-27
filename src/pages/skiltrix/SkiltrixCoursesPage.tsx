import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, RefreshCw, Loader2, Edit, X } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { getStImageUrl } from '../../utils/cdn';
import { Modal } from '../../components/common/Modal';

export const SkiltrixCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [paid, setPaid] = useState<0 | 1>(0);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [comparePrice, setComparePrice] = useState<number | undefined>(undefined);
  const [discountPercent, setDiscountPercent] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setName('');
    setType('beginner');
    setPaid(0);
    setPrice(undefined);
    setComparePrice(undefined);
    setDiscountPercent(undefined);
    setDescription('');
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setUploadProgress(0);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setType(course.type);
    setPaid(course.paid);
    setPrice(course.price);
    setComparePrice(course.compare_price || undefined);
    setDiscountPercent(course.discount_percent || undefined);
    setDescription(course.description || '');
    setImageFile(null);
    setImageUrl(course.image || '');
    setImagePreview(course.image ? getStImageUrl(course.image) : '');
    setUploadProgress(0);
    setFormError('');
    setIsModalOpen(true);
  };

  const handlePriceChange = (raw: string) => {
    const next = raw === '' ? undefined : Math.max(0, Number(raw));
    setPrice(next);
    if (next !== undefined && comparePrice && comparePrice > next && next > 0) {
      setDiscountPercent(Math.round(((comparePrice - next) / comparePrice) * 100));
    } else if (comparePrice !== undefined && next !== undefined && comparePrice <= next) {
      setDiscountPercent(undefined);
    }
  };

  const handleComparePriceChange = (raw: string) => {
    const nextCompare = raw === '' ? undefined : Math.max(0, Number(raw));
    setComparePrice(nextCompare);
    if (nextCompare !== undefined && nextCompare > 0) {
      if (price !== undefined && price > 0 && nextCompare > price) {
        setDiscountPercent(Math.round(((nextCompare - price) / nextCompare) * 100));
      } else if (discountPercent !== undefined && discountPercent > 0 && discountPercent < 100) {
        setPrice(Math.round(nextCompare * (1 - discountPercent / 100)));
      }
    } else {
      setDiscountPercent(undefined);
    }
  };

  const handleDiscountPercentChange = (raw: string) => {
    const nextDisc = raw === '' ? undefined : Math.max(0, Math.min(99, Number(raw)));
    setDiscountPercent(nextDisc);
    if (nextDisc !== undefined && nextDisc > 0) {
      if (comparePrice && comparePrice > 0) {
        setPrice(Math.round(comparePrice * (1 - nextDisc / 100)));
      } else if (price && price > 0) {
        setComparePrice(Math.round(price / (1 - nextDisc / 100)));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingCourse && !imageFile && !imageUrl.trim()) {
      setFormError('Please upload a course banner image or provide an image URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      let resolvedImage = imageUrl.trim();
      if (imageFile) {
        const uploadRes = await api.uploadCdnAsset(imageFile, 'st_image', pct => {
          setUploadProgress(Math.max(15, Math.min(80, Math.round(pct * 0.8))));
        });
        resolvedImage = uploadRes.url || uploadRes.filename;
      }

      setUploadProgress(90);

      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.course_id, {
          name,
          type,
          paid,
          price: paid === 1 ? Number(price) : 0,
          compare_price: paid === 1 ? Number(comparePrice || 0) : 0,
          discount_percent: paid === 1 ? Number(discountPercent || 0) : 0,
          description,
          image: resolvedImage,
        });
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          if (updated) {
            setCourses(prev => prev.map(c => (c.course_id === updated.course_id ? updated : c)));
          } else {
            fetchCourses();
          }
          setIsModalOpen(false);
          setEditingCourse(null);
          setImageFile(null);
          setUploadProgress(0);
        }, 250);
      } else {
        const created = await api.createCourse({
          name,
          type,
          paid,
          price: paid === 1 ? Number(price) : undefined,
          compare_price: paid === 1 ? Number(comparePrice || 0) : 0,
          discount_percent: paid === 1 ? Number(discountPercent || 0) : 0,
          description,
          image: resolvedImage
        });

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setCourses(prevList => [created, ...prevList]);
          setIsModalOpen(false);
          setName('');
          setDescription('');
          setImageFile(null);
          setImageUrl('');
          setImagePreview('');
          setPrice(undefined);
          setComparePrice(undefined);
          setDiscountPercent(undefined);
          setUploadProgress(0);
        }, 250);
      }
    } catch (err: any) {
      console.error('Failed to save course:', err);
      setFormError(err?.message || 'Failed to save course or upload banner image.');
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
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
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
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No courses found in database.
                    </td>
                  </tr>
                ) : (
                  courses.map(course => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                            Paid • ₹{course.price?.toLocaleString('en-IN')}
                          </span>
                          {(course.compare_price || 0) > (course.price || 0) && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textDecoration: 'line-through' }}>
                              ₹{course.compare_price?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {(course.discount_percent || 0) > 0 && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(16, 185, 129, 0.14)',
                              color: '#34d399'
                            }}>
                              {Math.round(course.discount_percent || 0)}% OFF
                            </span>
                          )}
                        </div>
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
                          className="action-btn"
                          onClick={() => openEditModal(course)}
                          title="Edit Course & Banner Image"
                        >
                          <Edit size={16} />
                        </button>
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
                )))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCourse(null); }}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleSaveCourse}>
          {formError && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.14)',
              color: '#f87171',
              fontSize: '0.84rem'
            }}>
              {formError}
            </div>
          )}
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
            <div style={{
              marginBottom: '1rem',
              padding: '0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course_price">
                    Enrollment Fee (₹) <span className="star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="course_price"
                    className="form-input"
                    placeholder="e.g. 499"
                    value={price ?? ''}
                    onChange={e => handlePriceChange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course_compare_price">
                    Comparison Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="course_compare_price"
                    className="form-input"
                    placeholder="e.g. 1999"
                    value={comparePrice ?? ''}
                    onChange={e => handleComparePriceChange(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course_discount_percent">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    id="course_discount_percent"
                    className="form-input"
                    placeholder="e.g. 75"
                    value={discountPercent ?? ''}
                    onChange={e => handleDiscountPercentChange(e.target.value)}
                  />
                </div>
              </div>

              {(price || 0) > 0 && ((comparePrice || 0) > (price || 0) || (discountPercent || 0) > 0) && (
                <div style={{
                  marginTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Preview:</span>
                  <strong style={{ color: 'var(--text-main)' }}>₹{Number(price).toLocaleString('en-IN')}</strong>
                  {(comparePrice || 0) > (price || 0) && (
                    <span style={{ textDecoration: 'line-through' }}>
                      ₹{Number(comparePrice).toLocaleString('en-IN')}
                    </span>
                  )}
                  {(discountPercent || 0) > 0 && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.16)',
                      color: '#34d399'
                    }}>
                      {Math.round(discountPercent || 0)}% OFF
                    </span>
                  )}
                </div>
              )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {(imagePreview || imageUrl.trim()) && (
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <img
                    src={imagePreview || getStImageUrl(imageUrl.trim())}
                    alt="Preview"
                    style={{ width: '88px', height: '54px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImageUrl(''); setImagePreview(''); }}
                    title="Clear image"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Or paste CDN URL / image filename..."
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                if (!imageFile) {
                  setImagePreview(e.target.value.trim() ? getStImageUrl(e.target.value.trim()) : '');
                }
              }}
            />
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
            <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingCourse(null); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
