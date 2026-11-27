import React, { useState, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Loader2,
  Code2,
  Trash2,
  Award,
  Clock,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  AdminGlobalAttemptDTO,
  AdminAssessmentAnalyticsDTO,
  codingAdminApi,
} from '../../services/codingAssessmentsAdmin';
import { Submission } from '../../types';
import { Modal } from '../../components/common/Modal';
import { AttemptAnswersPanel } from '../../components/skiltrix/AttemptAnswersPanel';

type SubTab = 'assessments' | 'coding' | 'legacy';

export const SkiltrixSubmissionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('assessments');
  const [attempts, setAttempts] = useState<AdminGlobalAttemptDTO[]>([]);
  const [codingSubs, setCodingSubs] = useState<AdminAssessmentAnalyticsDTO['submissions']>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedAttempt, setSelectedAttempt] = useState<AdminGlobalAttemptDTO | null>(null);
  const [selectedCodeSub, setSelectedCodeSub] = useState<
    AdminAssessmentAnalyticsDTO['submissions'][number] | null
  >(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [globalRes, legacyRes] = await Promise.all([
        codingAdminApi.getAllSubmissions().catch(() => ({
          attempts: [],
          coding_submissions: [],
          total_attempts: 0,
          total_coding_submissions: 0,
        })),
        api.getSubmissions().catch(() => []),
      ]);
      setAttempts(globalRes.attempts || []);
      setCodingSubs(globalRes.coding_submissions || []);
      setSubmissions(legacyRes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
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

  const q = search.trim().toLowerCase();

  const filteredAttempts = attempts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (!q) return true;
    return (
      a.student_name.toLowerCase().includes(q) ||
      a.student_email.toLowerCase().includes(q) ||
      a.assessment_title.toLowerCase().includes(q) ||
      a.attempt_id.toLowerCase().includes(q)
    );
  });

  const filteredCodingSubs = codingSubs.filter(c => {
    if (!q) return true;
    return (
      c.student_name.toLowerCase().includes(q) ||
      c.problem_title.toLowerCase().includes(q) ||
      c.language.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  const filteredLegacy = submissions.filter(
    s =>
      s.student_name.toLowerCase().includes(q) ||
      s.task_title.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Submissions &amp; Assessment Attempts</h1>
          <p className="page-subtitle">
            Inspect completed MCQ, Technical, Coding, and Company assessment submissions, test verdicts, and code solutions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'assessments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('assessments')}
        >
          <Award size={14} />
          <span>Assessment Attempts ({attempts.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'coding' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('coding')}
        >
          <Code2 size={14} />
          <span>Code Submissions ({codingSubs.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'legacy' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('legacy')}
        >
          <FileSpreadsheet size={14} />
          <span>Practice Code Bank ({submissions.length})</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search student, email, assessment, problem, or attempt ID..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab === 'assessments' && (
              <select
                className="form-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="timed_out">Timed Out</option>
                <option value="in_progress">In Progress</option>
              </select>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeTab === 'assessments'
                ? `${filteredAttempts.length} attempts`
                : activeTab === 'coding'
                ? `${filteredCodingSubs.length} submissions`
                : `${filteredLegacy.length} records`}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Fetching student submissions...</span>
            </div>
          ) : activeTab === 'assessments' ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Attempt ID</th>
                  <th>Score</th>
                  <th>Solved / Attempted</th>
                  <th>Time Taken</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No assessment submissions found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map(att => (
                    <tr key={att.attempt_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{att.student_name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{att.student_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{att.assessment_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {att.assessment_type}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div>{att.attempt_id}</div>
                        <div>
                          {new Date(att.completed_at || att.started_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {att.total_score}/{att.max_possible_score} ({att.percentage}%)
                      </td>
                      <td>
                        <div>
                          {att.problems_solved} solved / {att.problems_attempted} attempted
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Cases: {att.test_cases_passed}/{att.test_cases_total} ({att.accuracy}%)
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                          <Clock size={13} />
                          {Math.floor(att.time_taken_seconds / 60)}m {att.time_taken_seconds % 60}s
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            att.status === 'completed'
                              ? att.passed
                                ? 'badge-approved'
                                : 'badge-rejected'
                              : 'badge-pending'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedAttempt(att)}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => codingAdminApi.downloadExport(att.assessment_id, 'csv')}
                            title="Export Assessment CSV"
                          >
                            CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : activeTab === 'coding' ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Problem</th>
                  <th>Language</th>
                  <th>Verdict</th>
                  <th>Cases Passed</th>
                  <th>Score</th>
                  <th>Runtime</th>
                  <th style={{ textAlign: 'right' }}>Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodingSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No coding problem submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredCodingSubs.map(sub => (
                    <tr key={sub.submission_id}>
                      <td style={{ fontWeight: 600 }}>{sub.student_name}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.problem_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(sub.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{sub.language}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === 'Accepted'
                              ? 'badge-approved'
                              : sub.status === 'Partial Accepted'
                              ? 'badge-pending'
                              : 'badge-rejected'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        {sub.passed_test_cases}/{sub.total_test_cases}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {sub.score}/{sub.max_score}
                      </td>
                      <td>{sub.execution_time_ms} ms</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedCodeSub(sub)}
                        >
                          <Code2 size={13} />
                          <span>View Code</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Task &amp; Assignment Title</th>
                  <th>Program Track</th>
                  <th>Code &amp; Repo</th>
                  <th style={{ textAlign: 'center' }}>Grade</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLegacy.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No submissions found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredLegacy.map(sub => (
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

      {/* Assessment Attempt Inspection Modal */}
      {selectedAttempt && (
        <Modal
          isOpen={Boolean(selectedAttempt)}
          onClose={() => setSelectedAttempt(null)}
          title={`Attempt ${selectedAttempt.attempt_id} — ${selectedAttempt.student_name}`}
        >
          <AttemptAnswersPanel attempt={selectedAttempt} />
        </Modal>
      )}

      {/* Evaluated Code Submission Inspection Modal */}
      {selectedCodeSub && (
        <Modal
          isOpen={Boolean(selectedCodeSub)}
          onClose={() => setSelectedCodeSub(null)}
          title={`${selectedCodeSub.problem_title} — ${selectedCodeSub.student_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Verdict: <strong>{selectedCodeSub.status}</strong> •{' '}
              {selectedCodeSub.passed_test_cases}/{selectedCodeSub.total_test_cases} test cases •{' '}
              {selectedCodeSub.language} • {selectedCodeSub.execution_time_ms} ms
            </div>
            <pre
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                maxHeight: '360px',
                overflow: 'auto',
              }}
            >
              {selectedCodeSub.source_code || '// Empty source code'}
            </pre>
            {selectedCodeSub.error_message && (
              <pre
                style={{
                  background: 'rgba(220,38,38,0.1)',
                  color: '#dc2626',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedCodeSub.error_message}
              </pre>
            )}
          </div>
        </Modal>
      )}

      {/* Legacy Code Inspection Modal */}
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
