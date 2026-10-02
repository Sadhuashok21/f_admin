import React, { useState, useEffect } from 'react';
import { Search, Check, X, ExternalLink, RefreshCw, Loader2, Code2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { initialSubmissions } from '../../data/mockData';
import { Submission } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setSubmissions(data && data.length > 0 ? data : initialSubmissions);
    } catch {
      setSubmissions(initialSubmissions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const targetScore = status === 'approved' ? 95 : 45;
    try {
      await api.updateSubmissionStatus(id, status, targetScore);
      setSubmissions(prev =>
        prev.map(s => (s.id === id ? { ...s, status, score: targetScore } : s))
      );
    } catch (err) {
      console.error('Failed to update submission status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission record?')) {
      try {
        await api.deleteSubmission(id);
        setSubmissions(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error('Failed to delete submission:', err);
      }
    }
  };

  const filtered = submissions.filter(
    s =>
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.task_title.toLowerCase().includes(search.toLowerCase()) ||
      s.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship & Course Submissions</h1>
          <p className="page-subtitle">Review student project repos, assign technical grades, and approve certificates</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchSubmissions} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by student, task, or program..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} student submissions
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Fetching student submissions...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task & Assignment Title</th>
                  <th>Program Track</th>
                  <th>Code & Repo</th>
                  <th style={{ textAlign: 'center' }}>Grade</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No submissions found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sub.student_name}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{sub.task_title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Submitted {sub.submitted_at}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{sub.program}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sub.code && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              onClick={() => setSelectedSub(sub)}
                              title="View Solution Code"
                            >
                              <Code2 size={13} style={{ marginRight: '4px' }} />
                              <span>View Code</span>
                            </button>
                          )}
                          <a
                            href={sub.github_link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
                          >
                            <span>Repo</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {sub.score !== null ? `${sub.score}%` : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="action-btn"
                            style={{ color: 'var(--success)' }}
                            onClick={() => handleUpdateStatus(sub.id, 'approved')}
                            title="Approve Submission"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="action-btn"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleUpdateStatus(sub.id, 'rejected')}
                            title="Reject Submission"
                          >
                            <X size={18} />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(sub.id)}
                            title="Delete Record"
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
          )}
        </div>
      </div>

      {/* Code Inspection Modal */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Code Submission: ${selectedSub.student_name} (${selectedSub.language || 'Code'})`}
        >
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{selectedSub.task_title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Language: {selectedSub.language || 'Standard'} • Score: {selectedSub.score ?? 'Ungraded'}
                </p>
              </div>
              <span className={`badge badge-${selectedSub.status}`}>{selectedSub.status}</span>
            </div>

            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '1.2rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                maxHeight: '350px',
                overflow: 'auto',
                lineHeight: '1.5'
              }}
            >
              {selectedSub.code || '// No source code payload provided'}
            </pre>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleUpdateStatus(selectedSub.id, 'approved');
                    setSelectedSub(null);
                  }}
                >
                  <Check size={14} style={{ marginRight: '4px' }} />
                  <span>Approve (95%)</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => {
                    handleUpdateStatus(selectedSub.id, 'rejected');
                    setSelectedSub(null);
                  }}
                >
                  <X size={14} style={{ marginRight: '4px' }} />
                  <span>Reject (45%)</span>
                </button>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSub(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
