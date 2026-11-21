import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ShieldCheck,
  Clock,
  Layers,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  ExternalLink,
  Lock,
  Pencil,
  FileQuestion,
  Code,
  Bug,
  Database,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CompanyMockItem, QuestionItem, AssessmentSectionItem } from '../../types';
import { Modal } from '../../components/common/Modal';

export const SkiltrixMocksPage: React.FC = () => {
  const [mocks, setMocks] = useState<CompanyMockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Add / Edit Mock Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<CompanyMockItem | null>(null);

  // Mock Form states
  const [title, setTitle] = useState('');
  const [companyTag, setCompanyTag] = useState('Amazon-style');
  const [category, setCategory] = useState('Company Mocks');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passPercentage, setPassPercentage] = useState(70);
  const [description, setDescription] = useState('');
  const [isProOnly, setIsProOnly] = useState(false);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Questions Management Modal state
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [activeMockForQuestions, setActiveMockForQuestions] = useState<CompanyMockItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [sections, setSections] = useState<AssessmentSectionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);

  // Question Form state
  const [qTitle, setQTitle] = useState('');
  const [qType, setQType] = useState('mcq_single');
  const [qSectionId, setQSectionId] = useState('');
  const [qMarks, setQMarks] = useState(10);
  const [qNegativeMarks, setQNegativeMarks] = useState(0);
  const [qPrompt, setQPrompt] = useState('');
  const [qDiff, setQDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [starterCode, setStarterCode] = useState('');
  const [referenceSolution, setReferenceSolution] = useState('');
  const [buggyCode, setBuggyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMocks = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanyMocks();
      setMocks(data || []);
    } catch {
      setMocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMocks();
  }, []);

  const openCreateModal = () => {
    setEditingMock(null);
    setTitle('');
    setCompanyTag('Amazon-style');
    setCategory('Company Mocks');
    setDifficulty('Medium');
    setDurationMinutes(90);
    setTotalMarks(100);
    setPassPercentage(70);
    setDescription('');
    setIsProOnly(false);
    setProctoringEnabled(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (mock: CompanyMockItem) => {
    setEditingMock(mock);
    setTitle(mock.title);
    setCompanyTag(mock.company_tag);
    setCategory(mock.category);
    setDifficulty(mock.difficulty);
    setDurationMinutes(mock.duration_minutes);
    setTotalMarks(mock.total_marks);
    setPassPercentage(mock.pass_percentage);
    setDescription(mock.description);
    setIsProOnly(mock.is_pro_only);
    setProctoringEnabled(mock.proctoring_enabled);
    setIsActive(mock.active);
    setIsModalOpen(true);
  };

  const handleSaveMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMock) {
      // Update existing mock
      try {
        const idToUpdate = editingMock.assessment_id || (editingMock.id as any);
        await api.updateCompanyMock(idToUpdate, {
          title,
          company_tag: companyTag,
          category,
          difficulty,
          duration_minutes: durationMinutes,
          total_marks: totalMarks,
          pass_percentage: passPercentage,
          description,
          is_pro_only: isProOnly,
          proctoring_enabled: proctoringEnabled,
          active: isActive,
        });

        setMocks(prev =>
          prev.map(m =>
            (m.assessment_id === editingMock.assessment_id || m.id === editingMock.id)
              ? {
                  ...m,
                  title,
                  company_tag: companyTag,
                  category,
                  difficulty,
                  duration_minutes: durationMinutes,
                  total_marks: totalMarks,
                  pass_percentage: passPercentage,
                  description,
                  is_pro_only: isProOnly,
                  proctoring_enabled: proctoringEnabled,
                  active: isActive,
                }
              : m
          )
        );
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to update mock:', err);
      }
    } else {
      // Create new mock
      try {
        const newMock = await api.createCompanyMock({
          title,
          company_tag: companyTag,
          category,
          difficulty,
          duration_minutes: durationMinutes,
          total_marks: totalMarks,
          pass_percentage: passPercentage,
          description,
          is_pro_only: isProOnly,
          proctoring_enabled: proctoringEnabled,
          active: isActive,
        });
        setMocks(prev => [newMock, ...prev]);
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to create mock:', err);
      }
    }
  };

  const handleDeleteMock = async (id: string | number) => {
    if (window.confirm('Delete this company mock assessment?')) {
      try {
        await api.deleteCompanyMock(id);
        setMocks(prev => prev.filter(m => m.assessment_id !== id && m.id !== id));
      } catch (err) {
        console.error('Failed to delete mock:', err);
      }
    }
  };

  // Open Questions Management Drawer/Modal
  const openQuestionsModal = async (mock: CompanyMockItem) => {
    setActiveMockForQuestions(mock);
    setIsQuestionsModalOpen(true);
    setLoadingQuestions(true);
    setShowAddQuestionForm(false);
    resetQuestionForm();

    try {
      const [qs, secs] = await Promise.all([
        api.getMockQuestions(mock.assessment_id || (mock.id as any)),
        api.getMockSections(mock.assessment_id || (mock.id as any))
      ]);
      setQuestions(qs);
      setSections(secs);
      if (secs.length > 0) {
        setQSectionId(secs[0].section_id || String(secs[0].id));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetQuestionForm = () => {
    setQTitle('');
    setQType('mcq_single');
    setQMarks(10);
    setQNegativeMarks(0);
    setQPrompt('');
    setQDiff('Medium');
    setOptA('Option A');
    setOptB('Option B');
    setOptC('Option C');
    setOptD('Option D');
    setCorrectOption('A');
    setStarterCode('def solution():\n    pass');
    setReferenceSolution('def solution():\n    return True');
    setBuggyCode('');
    setErrorMessage('');
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMockForQuestions) return;

    const payload: Partial<QuestionItem> = {
      title: qTitle,
      question_type: qType,
      section: qSectionId,
      marks: Number(qMarks),
      negative_marks: Number(qNegativeMarks),
      difficulty: qDiff,
      prompt: qPrompt,
    };

    if (qType === 'mcq_single' || qType === 'mcq_multi') {
      payload.options = [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC },
        { id: 'D', text: optD },
      ];
      payload.correct_answers = [correctOption];
    } else if (qType === 'coding') {
      payload.starter_code = starterCode;
      payload.reference_solution = referenceSolution;
    } else if (qType === 'debugging' || qType === 'django_debugging') {
      payload.buggy_code = buggyCode;
      payload.error_message = errorMessage;
      payload.starter_code = buggyCode;
      payload.reference_solution = referenceSolution;
    }

    try {
      const created = await api.addMockQuestion(
        activeMockForQuestions.assessment_id || (activeMockForQuestions.id as any),
        payload
      );
      setQuestions(prev => [created, ...prev]);
      setShowAddQuestionForm(false);
      resetQuestionForm();

      // Update question count in table
      setMocks(prev =>
        prev.map(m =>
          (m.assessment_id === activeMockForQuestions.assessment_id || m.id === activeMockForQuestions.id)
            ? { ...m, questions_count: (m.questions_count || 0) + 1 }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  const handleDeleteQuestion = async (itemId: string | number) => {
    if (window.confirm('Remove this question from the mock assessment?')) {
      try {
        await api.deleteQuestion(itemId);
        setQuestions(prev => prev.filter(q => q.item_id !== itemId && q.id !== itemId));
        // Update question count in table
        if (activeMockForQuestions) {
          setMocks(prev =>
            prev.map(m =>
              (m.assessment_id === activeMockForQuestions.assessment_id || m.id === activeMockForQuestions.id)
                ? { ...m, questions_count: Math.max(0, (m.questions_count || 1) - 1) }
                : m
            )
          );
        }
      } catch (err) {
        console.error('Failed to delete question:', err);
      }
    }
  };

  const filteredMocks = mocks.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.company_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || m.company_tag === selectedTag;
    const matchesDiff = selectedDifficulty === 'All' || m.difficulty === selectedDifficulty;
    return matchesSearch && matchesTag && matchesDiff;
  });

  const uniqueTags = Array.from(new Set(mocks.map(m => m.company_tag))).filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Mock Assessments</h1>
          <p className="page-subtitle">
            Configure realistic company-style placement assessments, add questions, and edit test settings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/skiltrix/companyblueprint" className="btn btn-secondary btn-sm">
            <BookOpen size={14} />
            <span>Company Blueprints</span>
          </Link>
          <button className="btn btn-secondary btn-sm" onClick={fetchMocks} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Mock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Mocks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{mocks.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Tests</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
            {mocks.filter(m => m.active).length}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Free Practice Mocks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
            {mocks.filter(m => !m.is_pro_only).length}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Pro Tier Mocks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
            {mocks.filter(m => m.is_pro_only).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search mock assessments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
        >
          <option value="All">All Company Styles</option>
          {uniqueTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: '150px' }}
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #334155)', textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem' }}>
              <th style={{ padding: '14px 16px' }}>Assessment Title</th>
              <th style={{ padding: '14px 16px' }}>Style & Category</th>
              <th style={{ padding: '14px 16px' }}>Difficulty</th>
              <th style={{ padding: '14px 16px' }}>Duration</th>
              <th style={{ padding: '14px 16px' }}>Questions & Rounds</th>
              <th style={{ padding: '14px 16px' }}>Proctoring</th>
              <th style={{ padding: '14px 16px' }}>Tier</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMocks.map(m => (
              <tr key={m.assessment_id || m.slug} style={{ borderBottom: '1px solid var(--border-color, #334155)', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.slug}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#3b82f620', color: '#60a5fa', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {m.company_tag}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{m.category}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: m.difficulty === 'Hard' ? '#ef444420' : m.difficulty === 'Medium' ? '#f59e0b20' : '#10b98120',
                    color: m.difficulty === 'Hard' ? '#f87171' : m.difficulty === 'Medium' ? '#fbbf24' : '#34d399'
                  }}>
                    {m.difficulty}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#94a3b8" />
                    <span>{m.duration_minutes}m</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.total_marks} pts ({m.pass_percentage}%)</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => openQuestionsModal(m)}
                    title="Manage questions for this mock"
                  >
                    <FileQuestion size={14} color="#38bdf8" />
                    <span>{m.questions_count ?? m.question_items?.length ?? 0} Qs ({m.sections_count || 0} rounds)</span>
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {m.proctoring_enabled ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                      <ShieldCheck size={16} /> Strict
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Standard</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {m.is_pro_only ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Lock size={14} /> Pro
                    </span>
                  ) : (
                    <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>Free</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {m.active ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem' }}>
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem' }}>
                      <XCircle size={14} /> Draft
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '6px 8px', cursor: 'pointer' }}
                      onClick={() => openEditModal(m)}
                      title="Edit / Modify Assessment Details"
                    >
                      <Pencil size={14} color="#93c5fd" />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '6px 8px' }}
                      onClick={() => handleDeleteMock(m.assessment_id || (m.id as any))}
                      title="Delete assessment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMocks.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No company mock assessments found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating or Modifying Mock Assessment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMock ? `Modify Mock: ${editingMock.title}` : "Add Company Mock Assessment"}
      >
        <form onSubmit={handleSaveMock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Assessment Title *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Amazon-style SDE Mock"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Company Hiring Style *</label>
              <select
                className="form-control"
                value={companyTag}
                onChange={e => setCompanyTag(e.target.value)}
              >
                <option value="Amazon-style">Amazon-style</option>
                <option value="Google-style">Google-style</option>
                <option value="Microsoft-style">Microsoft-style</option>
                <option value="Deloitte-style">Deloitte-style</option>
                <option value="TCS-style">TCS-style</option>
                <option value="Accenture-style">Accenture-style</option>
                <option value="Infosys-style">Infosys-style</option>
                <option value="Cognizant-style">Cognizant-style</option>
                <option value="Wipro-style">Wipro-style</option>
                <option value="Capgemini-style">Capgemini-style</option>
                <option value="General SDE">General SDE</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Company Mocks">Company Mocks</option>
                <option value="Coding Assessments">Coding Assessments</option>
                <option value="Mixed Placement Assessments">Mixed Placement Assessments</option>
                <option value="DSA Assessments">DSA Assessments</option>
                <option value="Technical Assessments">Technical Assessments</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Difficulty</label>
              <select
                className="form-control"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="form-label">Duration (Mins)</label>
              <input
                type="number"
                className="form-control"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="form-label">Pass Score (%)</label>
              <input
                type="number"
                className="form-control"
                value={passPercentage}
                onChange={e => setPassPercentage(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Total Marks</label>
            <input
              type="number"
              className="form-control"
              value={totalMarks}
              onChange={e => setTotalMarks(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Brief assessment overview and round details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={proctoringEnabled}
                onChange={e => setProctoringEnabled(e.target.checked)}
              />
              <span>Strict Proctoring (Fullscreen + Anti-Tab)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isProOnly}
                onChange={e => setIsProOnly(e.target.checked)}
              />
              <span>Pro Subscription Required</span>
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            <span>Active & Published for Students</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMock ? "Save Changes" : "Create Mock Assessment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Managing Questions for this Mock */}
      <Modal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        title={`Questions: ${activeMockForQuestions?.title || 'Mock Assessment'}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Company Hiring Pattern: </span>
              <strong style={{ color: '#38bdf8' }}>{activeMockForQuestions?.company_tag}</strong>
              <span style={{ margin: '0 8px', color: '#475569' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Marks: </span>
              <strong style={{ color: '#10b981' }}>{activeMockForQuestions?.total_marks} pts</strong>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddQuestionForm(prev => !prev)}
            >
              <Plus size={14} />
              <span>{showAddQuestionForm ? 'Close Form' : 'Add Question'}</span>
            </button>
          </div>

          {/* Form to Add Question */}
          {showAddQuestionForm && (
            <form onSubmit={handleAddQuestion} style={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#60a5fa', fontWeight: 600 }}>Add Question to Assessment</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Question Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Find First Non-Repeating Character"
                    value={qTitle}
                    onChange={e => setQTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Question Type</label>
                  <select className="form-control" value={qType} onChange={e => setQType(e.target.value)}>
                    <option value="mcq_single">Multiple Choice (MCQ)</option>
                    <option value="coding">Hands-on Coding</option>
                    <option value="django_debugging">Django Debugging</option>
                    <option value="debugging">System Debugging</option>
                    <option value="sql">SQL Query</option>
                    <option value="aptitude">Quantitative Aptitude</option>
                    <option value="reasoning">Logical Reasoning</option>
                    <option value="cs_fundamentals">CS Fundamentals</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Assessment Section</label>
                  <select className="form-control" value={qSectionId} onChange={e => setQSectionId(e.target.value)}>
                    {sections.map(s => (
                      <option key={s.section_id || s.id} value={s.section_id || s.id}>
                        {s.title} ({s.section_type})
                      </option>
                    ))}
                    {sections.length === 0 && <option value="">Main Round</option>}
                  </select>
                </div>
                <div>
                  <label className="form-label">Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={qMarks}
                    onChange={e => setQMarks(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select className="form-control" value={qDiff} onChange={e => setQDiff(e.target.value as any)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Problem Statement / Question Prompt *</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  placeholder="Problem description, input/output constraints..."
                  value={qPrompt}
                  onChange={e => setQPrompt(e.target.value)}
                />
              </div>

              {/* Conditional inputs for MCQ */}
              {(qType === 'mcq_single' || qType === 'mcq_multi' || qType === 'aptitude' || qType === 'reasoning' || qType === 'cs_fundamentals') && (
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Multiple Choice Options</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input className="form-control" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} />
                    <input className="form-control" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} />
                    <input className="form-control" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} />
                    <input className="form-control" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Correct Option:</span>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="radio"
                          name="correct_opt"
                          checked={correctOption === opt}
                          onChange={() => setCorrectOption(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditional inputs for Coding */}
              {qType === 'coding' && (
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Starter Code Template</div>
                  <textarea
                    rows={3}
                    className="form-control"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={starterCode}
                    onChange={e => setStarterCode(e.target.value)}
                  />
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Reference Solution</div>
                  <textarea
                    rows={3}
                    className="form-control"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={referenceSolution}
                    onChange={e => setReferenceSolution(e.target.value)}
                  />
                </div>
              )}

              {/* Conditional inputs for Debugging */}
              {(qType === 'debugging' || qType === 'django_debugging') && (
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Buggy Code Snippet</div>
                  <textarea
                    rows={3}
                    className="form-control"
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={buggyCode}
                    onChange={e => setBuggyCode(e.target.value)}
                  />
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Error Message / Stack Trace</div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 500 Internal Server Error: IndexError"
                    value={errorMessage}
                    onChange={e => setErrorMessage(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddQuestionForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Question
                </button>
              </div>
            </form>
          )}

          {/* List of Questions */}
          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              Loading questions...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions.map((q, idx) => (
                <div
                  key={q.item_id || q.id || idx}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>#{idx + 1}</span>
                      <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{q.title}</strong>
                      <span style={{
                        background: '#38bdf820',
                        color: '#38bdf8',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {q.question_type}
                      </span>
                      <span style={{
                        background: '#10b98120',
                        color: '#10b981',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {q.marks} pts
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {q.prompt?.slice(0, 160)}{q.prompt?.length > 160 ? '...' : ''}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        {q.options.map(opt => (
                          <span
                            key={opt.id}
                            style={{
                              background: q.correct_answers?.includes(opt.id) ? '#10b98120' : '#0f172a',
                              color: q.correct_answers?.includes(opt.id) ? '#34d399' : '#94a3b8',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: q.correct_answers?.includes(opt.id) ? '1px solid #10b981' : '1px solid #334155'
                            }}
                          >
                            {opt.id}: {opt.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.item_id || (q.id as any))}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', background: '#0f172a', borderRadius: '8px' }}>
                  No questions currently attached to this mock. Click <strong>"Add Question"</strong> above to attach MCQs, coding challenges, or debugging tasks.
                </div>
              )}
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
};
