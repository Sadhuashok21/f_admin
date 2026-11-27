import React from 'react';
import { AdminGlobalAttemptDTO } from '../../services/codingAssessmentsAdmin';

interface AttemptAnswersPanelProps {
  attempt: AdminGlobalAttemptDTO;
}

/**
 * Renders attempt summary KPIs and per-question candidate answers (MCQ choices and code solutions).
 */
export const AttemptAnswersPanel: React.FC<AttemptAnswersPanelProps> = ({ attempt }) => {
  const rows = attempt.problem_wise || [];
  const totalQuestions = attempt.total_questions ?? (rows.length || attempt.problems_attempted || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
        <div className="card" style={{ padding: '0.65rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Score</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {attempt.total_score}/{attempt.max_possible_score} ({attempt.percentage}%)
          </div>
        </div>
        <div className="card" style={{ padding: '0.65rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Questions Solved</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {attempt.problems_solved}/{totalQuestions}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {attempt.problems_attempted} attempted
          </div>
        </div>
        <div className="card" style={{ padding: '0.65rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Accuracy</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{attempt.accuracy}%</div>
        </div>
      </div>

      {attempt.problems_attempted === 0 && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
          }}
        >
          This candidate submitted or ended the attempt without answering any questions or submitting code.
        </div>
      )}

      <div>
        <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.92rem' }}>Question Breakdown &amp; Candidate Answers</h4>
        {rows.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No finalized question breakdown recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rows.map((row, idx) => {
              const isCoding = Boolean(row.problem_id) || ['coding', 'debugging', 'sql'].includes(row.question_type);
              return (
                <div
                  key={row.item_id || idx}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    background: 'var(--bg-body, rgba(15, 23, 42, 0.35))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {idx + 1}. {row.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {row.question_type} • {row.difficulty}
                        {row.language ? ` • ${row.language}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <span
                        className={`badge ${
                          row.status === 'Accepted' || row.status === 'Correct'
                            ? 'badge-approved'
                            : row.status === 'Not Attempted'
                            ? 'badge-pending'
                            : 'badge-rejected'
                        }`}
                      >
                        {row.status}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Cases: {row.passed_test_cases}/{row.total_test_cases}
                      </span>
                      <strong style={{ minWidth: '52px', textAlign: 'right' }}>
                        {row.score}/{row.max_score}
                      </strong>
                    </div>
                  </div>

                  {row.prompt && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                      {row.prompt.length > 280 ? `${row.prompt.slice(0, 280)}…` : row.prompt}
                    </div>
                  )}

                  {isCoding ? (
                    row.source_code ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Candidate Code ({row.language || 'text'}) • {row.execution_time_ms} ms
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            background: '#0f172a',
                            color: '#e2e8f0',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            maxHeight: '240px',
                            overflow: 'auto',
                          }}
                        >
                          {row.source_code}
                        </pre>
                        {row.error_message && (
                          <pre
                            style={{
                              margin: 0,
                              background: 'rgba(220,38,38,0.1)',
                              color: '#ef4444',
                              padding: '0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {row.error_message}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No code submitted or saved for this problem.
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <div
                        style={{
                          padding: '0.55rem 0.7rem',
                          borderRadius: '8px',
                          background: row.user_answer_display ? 'rgba(99, 102, 241, 0.12)' : 'rgba(148, 163, 184, 0.08)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px' }}>
                          CANDIDATE ANSWER
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {row.user_answer_display ??
                            (row.user_answer !== undefined && row.user_answer !== null && row.user_answer !== ''
                              ? String(row.user_answer)
                              : row.status === 'Not Attempted'
                              ? 'Not answered'
                              : 'Answer recorded (refresh / reload server to view text)')}
                        </div>
                      </div>
                      {row.correct_answer_display && (
                        <div
                          style={{
                            padding: '0.55rem 0.7rem',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', marginBottom: '2px' }}>
                            EXPECTED ANSWER
                          </div>
                          <div style={{ fontWeight: 600 }}>{row.correct_answer_display}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
