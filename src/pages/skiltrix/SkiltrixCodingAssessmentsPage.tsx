import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Code2,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileArchive,
  FileSpreadsheet,
  FolderUp,
  Lock,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  AdminAssessmentAnalyticsDTO,
  AdminAssessmentDTO,
  AdminCodingProblemDTO,
  AdminTestCaseDTO,
  AssessmentAssignmentDTO,
  StudentBatchDTO,
  codingAdminApi,
} from '../../services/codingAssessmentsAdmin';
import { AttemptAnswersPanel } from '../../components/skiltrix/AttemptAnswersPanel';

type AdminTab = 'assessments' | 'problems' | 'batches' | 'analytics';

const ALL_LANGUAGES = [
  { id: 'python', label: 'Python 3' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'javascript', label: 'JavaScript' },
];

const IGNORED_DJANGO_DIRS = new Set([
  '__pycache__',
  '.git',
  '.hg',
  '.svn',
  '.venv',
  'venv',
  'env',
  'node_modules',
  '.pytest_cache',
  '.mypy_cache',
  '.tox',
  '.idea',
  '.vscode',
  'staticfiles',
  'media',
  '__MACOSX',
]);

const IGNORED_DJANGO_EXTS = [
  '.pyc',
  '.pyo',
  '.pyd',
  '.sqlite3',
  '.db',
  '.sqlite',
  '.ds_store',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.exe',
  '.dll',
  '.so',
  '.bin',
  '.zip',
  '.tar',
  '.gz',
];

function isHiddenDjangoTestPath(relPath: string): boolean {
  const lower = relPath.toLowerCase();
  const filename = lower.split('/').pop() || '';
  return (
    filename.startsWith('tests_hidden') ||
    filename.startsWith('hidden_test') ||
    `/${lower}`.includes('/hidden_tests/')
  );
}

function getLockedDjangoPaths(projectFiles: Record<string, string>): Set<string> {
  const paths = Object.keys(projectFiles);
  const settingsDirs = new Set(
    paths.filter((p) => p.endsWith('/settings.py')).map((p) => p.slice(0, p.lastIndexOf('/')))
  );
  const locked = new Set<string>();
  for (const p of paths) {
    const filename = p.split('/').pop() || '';
    const lowerName = filename.toLowerCase();
    const isRootMeta = (lowerName === 'manage.py' || lowerName === 'readme.md') && !p.includes('/');
    const isTestFile =
      filename === 'tests.py' ||
      (filename.startsWith('test_') && filename.endsWith('.py')) ||
      p.includes('/tests/');
    const isSettings = filename === 'settings.py';
    const dir = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
    const isRootUrls = p.endsWith('/urls.py') && settingsDirs.has(dir);
    if (isRootMeta || isTestFile || isSettings || isRootUrls) {
      locked.add(p);
    }
  }
  return locked;
}

function countDjangoTests(fileMap: Record<string, string>): number {
  return Object.entries(fileMap).reduce((sum, [path, src]) => {
    if (!path.endsWith('.py')) return sum;
    const matches = (src || '').match(/^\s*def\s+test_/gm);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function formatTitleFromFolder(rawName: string): string {
  return rawName
    .replace(/\.zip$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: 'var(--shadow-sm)',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0.55rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  color: 'var(--text-main)',
  fontWeight: 600,
  fontSize: '0.82rem',
};

const badge = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '999px',
  fontSize: '0.72rem',
  fontWeight: 700,
  background: bg,
  color,
});

export function SkiltrixCodingAssessmentsPage() {
  const [tab, setTab] = useState<AdminTab>('assessments');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [problems, setProblems] = useState<AdminCodingProblemDTO[]>([]);
  const [defaultStarters, setDefaultStarters] = useState<Record<string, string>>({});
  const [defaultDjangoProject, setDefaultDjangoProject] = useState<{
    project_files: Record<string, string>;
    hidden_test_files: Record<string, string>;
  } | null>(null);
  const [assessments, setAssessments] = useState<AdminAssessmentDTO[]>([]);
  const [batches, setBatches] = useState<StudentBatchDTO[]>([]);

  // Problem editor state
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [starterTab, setStarterTab] = useState<string>('python');
  const [djangoSection, setDjangoSection] = useState<'project_files' | 'hidden_test_files'>('project_files');
  const [activeDjangoFile, setActiveDjangoFile] = useState<string>('posts/views.py');
  const [djangoUploading, setDjangoUploading] = useState(false);
  const [djangoUploadNotice, setDjangoUploadNotice] = useState<string | null>(null);
  const folderInputRef = React.useRef<HTMLInputElement | null>(null);
  const zipInputRef = React.useRef<HTMLInputElement | null>(null);
  const hiddenTestInputRef = React.useRef<HTMLInputElement | null>(null);
  const [probForm, setProbForm] = useState({
    title: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    question_type: 'algorithmic' as 'algorithmic' | 'debugging' | 'django_debug',
    category: 'DSA',
    points: 100,
    time_limit_seconds: 2,
    memory_limit_mb: 256,
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    sample_explanation: '',
    explanation: '',
    supported_languages: ['python', 'java', 'c', 'cpp', 'javascript'],
    starter_python: '',
    starter_java: '',
    starter_c: '',
    starter_cpp: '',
    starter_javascript: '',
    project_files: {} as Record<string, string>,
    hidden_test_files: {} as Record<string, string>,
    test_cases: [] as AdminTestCaseDTO[],
  });

  // Assessment editor state
  const [showAsmtForm, setShowAsmtForm] = useState(false);
  const [editingAsmtId, setEditingAsmtId] = useState<string | null>(null);
  const [asmtForm, setAsmtForm] = useState({
    title: '',
    assessment_type: 'coding' as 'mcq' | 'technical' | 'coding' | 'company',
    company_tag: '',
    description: '',
    instructions: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    duration_minutes: 90,
    pass_percentage: 60,
    total_marks: 100,
    negative_marking: false,
    negative_marking_percentage: 25,
    assignment_mode: 'public' as 'public' | 'assigned',
    show_results_immediately: true,
    proctoring_enabled: true,
    require_fullscreen: true,
    start_time: '',
    end_time: '',
    supported_languages: ['python', 'java', 'c', 'cpp', 'javascript'],
    selectedProblems: [] as Array<{ problem_id: string; marks: number }>,
  });

  // Batch & Assignment modal state
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchName, setBatchName] = useState('');
  const [batchDesc, setBatchDesc] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentHits, setStudentHits] = useState<
    Array<{ user_id: string; username: string; full_name: string; email: string }>
  >([]);
  const [selectedBatchStudents, setSelectedBatchStudents] = useState<string[]>([]);

  const [assignModalAsmt, setAssignModalAsmt] = useState<AdminAssessmentDTO | null>(null);
  const [assignments, setAssignments] = useState<AssessmentAssignmentDTO[]>([]);
  const [assignBatchIds, setAssignBatchIds] = useState<string[]>([]);
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);
  const [assignStartTime, setAssignStartTime] = useState('');
  const [assignEndTime, setAssignEndTime] = useState('');

  // Analytics state
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AdminAssessmentAnalyticsDTO | null>(null);
  const [inspectSub, setInspectSub] = useState<
    AdminAssessmentAnalyticsDTO['submissions'][number] | null
  >(null);
  const [inspectAttempt, setInspectAttempt] = useState<
    AdminAssessmentAnalyticsDTO['student_scores'][number] | null
  >(null);
  const [probModalError, setProbModalError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [probRes, asmtRes, batchRes] = await Promise.all([
        codingAdminApi.listProblems(),
        codingAdminApi.listAssessments(),
        codingAdminApi.listBatches(),
      ]);
      setProblems(probRes.problems || []);
      setDefaultStarters(probRes.default_starter_codes || {});
      setDefaultDjangoProject(probRes.default_django_project || null);
      setAssessments(asmtRes.assessments || []);
      setBatches(batchRes.batches || []);
      if (!selectedAnalyticsId && asmtRes.assessments?.length > 0) {
        const withAttempts = asmtRes.assessments.find((a) => (a.attempt_count || 0) > 0);
        setSelectedAnalyticsId((withAttempts || asmtRes.assessments[0]).assessment_id);
      }
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message || 'Failed to load coding assessment data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (tab === 'analytics' && selectedAnalyticsId) {
      codingAdminApi
        .getAnalytics(selectedAnalyticsId)
        .then(setAnalytics)
        .catch((err) => setBanner({ type: 'err', text: err.message }));
    }
  }, [tab, selectedAnalyticsId]);

  const openNewProblem = () => {
    setEditingProblemId(null);
    setProbModalError(null);
    setDjangoSection('project_files');
    setActiveDjangoFile('posts/views.py');
    setDjangoUploadNotice(null);
    setProbForm({
      title: '',
      difficulty: 'Medium',
      question_type: 'algorithmic',
      category: 'DSA',
      points: 100,
      time_limit_seconds: 2,
      memory_limit_mb: 256,
      description: '',
      input_format: '',
      output_format: '',
      constraints: '',
      sample_input: '',
      sample_output: '',
      sample_explanation: '',
      explanation: '',
      supported_languages: ['python', 'java', 'c', 'cpp', 'javascript'],
      starter_python: defaultStarters.python || '',
      starter_java: defaultStarters.java || '',
      starter_c: defaultStarters.c || '',
      starter_cpp: defaultStarters.cpp || '',
      starter_javascript: defaultStarters.javascript || '',
      project_files: {},
      hidden_test_files: {},
      test_cases: [
        { input_data: '', expected_output: '', is_hidden: false, points: 20, order: 1 },
        { input_data: '', expected_output: '', is_hidden: true, points: 40, order: 2 },
      ],
    });
    setShowProblemForm(true);
  };

  const openEditProblem = (p: AdminCodingProblemDTO) => {
    setEditingProblemId(p.problem_id);
    const qType = (p.question_type === 'django_debug' || p.question_type === 'debugging'
      ? p.question_type
      : 'algorithmic') as 'algorithmic' | 'debugging' | 'django_debug';
    const projFiles = { ...(p.project_files || {}) };
    const hidFiles = { ...(p.hidden_test_files || {}) };
    const projKeys = Object.keys(projFiles);
    setDjangoSection('project_files');
    setProbModalError(null);
    setActiveDjangoFile(
      projFiles['posts/views.py'] !== undefined
        ? 'posts/views.py'
        : projKeys[0] || ''
    );
    setDjangoUploadNotice(null);
    setProbForm({
      title: p.title,
      difficulty: p.difficulty,
      question_type: qType,
      category: p.category || 'DSA',
      points: p.points || 100,
      time_limit_seconds: p.time_limit_seconds || 2,
      memory_limit_mb: p.memory_limit_mb || 256,
      description: p.description || '',
      input_format: p.input_format || '',
      output_format: p.output_format || '',
      constraints: p.constraints || '',
      sample_input: p.sample_input || '',
      sample_output: p.sample_output || '',
      sample_explanation: p.sample_explanation || '',
      explanation: p.explanation || '',
      supported_languages: p.supported_languages || ['python', 'java', 'c', 'cpp', 'javascript'],
      starter_python: p.starter_python || defaultStarters.python || '',
      starter_java: p.starter_java || defaultStarters.java || '',
      starter_c: p.starter_c || defaultStarters.c || '',
      starter_cpp: p.starter_cpp || defaultStarters.cpp || '',
      starter_javascript: p.starter_javascript || defaultStarters.javascript || '',
      project_files: projFiles,
      hidden_test_files: hidFiles,
      test_cases: (p.test_cases || []).map((tc, i) => ({
        input_data: tc.input_data,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden,
        explanation: tc.explanation || '',
        points: tc.points || 10,
        order: tc.order || i + 1,
      })),
    });
    setShowProblemForm(true);
  };

  const saveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setProbModalError(null);
    if (probForm.question_type === 'django_debug') {
      if (Object.keys(probForm.project_files).length === 0) {
        const msg = 'Please upload a local Django project folder or .zip archive before saving.';
        setProbModalError(msg);
        setBanner({ type: 'err', text: msg });
        return;
      }
      if (!probForm.project_files['manage.py']) {
        const msg = 'Uploaded Django project must include manage.py at the project root.';
        setProbModalError(msg);
        setBanner({ type: 'err', text: msg });
        return;
      }
    }
    try {
      if (editingProblemId) {
        await codingAdminApi.updateProblem(editingProblemId, probForm);
        setBanner({ type: 'ok', text: 'Coding problem updated successfully.' });
      } else {
        await codingAdminApi.createProblem(probForm);
        setBanner({ type: 'ok', text: 'Coding problem created successfully.' });
      }
      setProbModalError(null);
      setShowProblemForm(false);
      loadAll();
    } catch (err: any) {
      const msg = err.message || 'Failed to save coding problem.';
      setProbModalError(msg);
      setBanner({ type: 'err', text: msg });
    }
  };

  const deleteProblem = async (pid: string) => {
    if (!window.confirm('Delete this coding problem and its test cases?')) return;
    try {
      await codingAdminApi.deleteProblem(pid);
      setBanner({ type: 'ok', text: 'Problem deleted.' });
      loadAll();
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message });
    }
  };

  const openNewAssessment = () => {
    setEditingAsmtId(null);
    setAsmtForm({
      title: '',
      assessment_type: 'coding',
      company_tag: '',
      description: '',
      instructions: '',
      difficulty: 'Medium',
      duration_minutes: 90,
      pass_percentage: 60,
      total_marks: 100,
      negative_marking: false,
      negative_marking_percentage: 25,
      assignment_mode: 'public',
      show_results_immediately: true,
      proctoring_enabled: true,
      require_fullscreen: true,
      start_time: '',
      end_time: '',
      supported_languages: ['python', 'java', 'c', 'cpp', 'javascript'],
      selectedProblems: [],
    });
    setShowAsmtForm(true);
  };

  const openEditAssessment = async (a: AdminAssessmentDTO) => {
    try {
      const detail = await codingAdminApi.getAssessment(a.assessment_id);
      setEditingAsmtId(a.assessment_id);
      setAsmtForm({
        title: detail.title,
        assessment_type: detail.assessment_type,
        company_tag: detail.company_tag || '',
        description: detail.description || '',
        instructions: detail.instructions || '',
        difficulty: detail.difficulty,
        duration_minutes: detail.duration_minutes,
        pass_percentage: detail.pass_percentage,
        total_marks: detail.total_marks,
        negative_marking: detail.negative_marking,
        negative_marking_percentage: detail.negative_marking_percentage || 25,
        assignment_mode: detail.assignment_mode || 'public',
        show_results_immediately: detail.show_results_immediately,
        proctoring_enabled: detail.proctoring_enabled,
        require_fullscreen: detail.require_fullscreen,
        start_time: detail.start_time ? detail.start_time.slice(0, 16) : '',
        end_time: detail.end_time ? detail.end_time.slice(0, 16) : '',
        supported_languages: detail.supported_languages || ['python', 'java', 'c', 'cpp', 'javascript'],
        selectedProblems: (detail.questions || [])
          .filter((q) => q.problem?.problem_id)
          .map((q) => ({ problem_id: q.problem!.problem_id, marks: q.marks || 100 })),
      });
      setShowAsmtForm(true);
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message });
    }
  };

  const saveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      title: asmtForm.title,
      assessment_type: asmtForm.assessment_type,
      company_tag: asmtForm.company_tag,
      description: asmtForm.description,
      instructions: asmtForm.instructions,
      difficulty: asmtForm.difficulty,
      duration_minutes: Number(asmtForm.duration_minutes),
      pass_percentage: Number(asmtForm.pass_percentage),
      total_marks: Number(asmtForm.total_marks),
      negative_marking: asmtForm.negative_marking,
      negative_marking_percentage: Number(asmtForm.negative_marking_percentage),
      assignment_mode: asmtForm.assignment_mode,
      show_results_immediately: asmtForm.show_results_immediately,
      proctoring_enabled: asmtForm.proctoring_enabled,
      require_fullscreen: asmtForm.require_fullscreen,
      supported_languages: asmtForm.supported_languages,
      start_time: asmtForm.start_time || null,
      end_time: asmtForm.end_time || null,
      problem_items: asmtForm.selectedProblems.map((sp, i) => ({
        problem_id: sp.problem_id,
        marks: sp.marks,
        order: i + 1,
      })),
    };
    try {
      if (editingAsmtId) {
        await codingAdminApi.updateAssessment(editingAsmtId, payload);
        setBanner({ type: 'ok', text: 'Assessment updated successfully.' });
      } else {
        await codingAdminApi.createAssessment(payload);
        setBanner({ type: 'ok', text: 'Coding assessment created successfully.' });
      }
      setShowAsmtForm(false);
      loadAll();
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message });
    }
  };

  const toggleProblemInAsmt = (pid: string, defaultPoints: number) => {
    setAsmtForm((prev) => {
      const exists = prev.selectedProblems.find((p) => p.problem_id === pid);
      if (exists) {
        return {
          ...prev,
          selectedProblems: prev.selectedProblems.filter((p) => p.problem_id !== pid),
        };
      }
      return {
        ...prev,
        selectedProblems: [...prev.selectedProblems, { problem_id: pid, marks: defaultPoints }],
      };
    });
  };

  const searchStudentsHandler = async (q: string) => {
    setStudentQuery(q);
    try {
      const res = await codingAdminApi.searchStudents(q);
      setStudentHits(res.students || []);
    } catch {
      setStudentHits([]);
    }
  };

  const saveBatchHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBatchId) {
        await codingAdminApi.updateBatch(editingBatchId, {
          name: batchName,
          description: batchDesc,
          student_ids: selectedBatchStudents,
        });
        setBanner({ type: 'ok', text: 'Student batch updated.' });
      } else {
        await codingAdminApi.createBatch({
          name: batchName,
          description: batchDesc,
          student_ids: selectedBatchStudents,
        });
        setBanner({ type: 'ok', text: 'Student batch created.' });
      }
      setEditingBatchId(null);
      setBatchName('');
      setBatchDesc('');
      setSelectedBatchStudents([]);
      loadAll();
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message });
    }
  };

  const openEditBatch = (b: StudentBatchDTO) => {
    setEditingBatchId(b.batch_id);
    setBatchName(b.name);
    setBatchDesc(b.description || '');
    setSelectedBatchStudents((b.students_detail || []).map((s) => s.user_id));
    searchStudentsHandler('');
  };

  const openAssignModal = async (asmt: AdminAssessmentDTO) => {
    setAssignModalAsmt(asmt);
    setAssignBatchIds([]);
    setAssignStudentIds([]);
    setAssignStartTime('');
    setAssignEndTime('');
    searchStudentsHandler('');
    try {
      const res = await codingAdminApi.listAssignments(asmt.assessment_id);
      setAssignments(res.assignments || []);
    } catch {
      setAssignments([]);
    }
  };

  const saveAssignments = async () => {
    if (!assignModalAsmt) return;
    try {
      await codingAdminApi.createAssignments(assignModalAsmt.assessment_id, {
        batch_ids: assignBatchIds,
        student_ids: assignStudentIds,
        start_time: assignStartTime || null,
        end_time: assignEndTime || null,
      });
      const res = await codingAdminApi.listAssignments(assignModalAsmt.assessment_id);
      setAssignments(res.assignments || []);
      setAssignBatchIds([]);
      setAssignStudentIds([]);
      setAssignStartTime('');
      setAssignEndTime('');
      setBanner({ type: 'ok', text: 'Assessment assigned successfully.' });
      loadAll();
    } catch (err: any) {
      setBanner({ type: 'err', text: err.message });
    }
  };

  const applyUploadedDjangoProject = (
    projectFiles: Record<string, string>,
    hiddenTestFiles: Record<string, string>,
    sourceLabel: string,
    readmeText?: string,
    skippedCount = 0
  ) => {
    const cleanProject: Record<string, string> = { ...projectFiles };
    const cleanHidden: Record<string, string> = { ...hiddenTestFiles };
    const keys = Object.keys(cleanProject);
    const preferredFile =
      keys.find((k) => k.endsWith('/views.py')) ||
      keys.find((k) => k.endsWith('/tests.py')) ||
      keys[0] ||
      '';
    setProbModalError(null);
    setProbForm((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : formatTitleFromFolder(sourceLabel),
      description: prev.description.trim()
        ? prev.description
        : (readmeText || cleanProject['README.md'] || cleanProject['readme.md'] || '').trim(),
      project_files: cleanProject,
      hidden_test_files: cleanHidden,
    }));
    setDjangoSection('project_files');
    setActiveDjangoFile(preferredFile);
    const pubTests = countDjangoTests(cleanProject);
    const hidTests = countDjangoTests(cleanHidden);
    const hasManage = Boolean(cleanProject['manage.py']);
    setDjangoUploadNotice(
      `Loaded ${keys.length} project file(s) & ${Object.keys(cleanHidden).length} hidden test file(s) (${pubTests} public / ${hidTests} hidden test methods)` +
        (skippedCount > 0 ? ` • skipped ${skippedCount} ignored/binary file(s)` : '') +
        (hasManage ? '' : ' • WARNING: manage.py not found at project root!')
    );
  };

  const handleLocalDjangoFolderUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setDjangoUploading(true);
    setProbModalError(null);
    try {
      const rawMap: Record<string, string> = {};
      let skipped = 0;
      let wrapperName = files[0]?.webkitRelativePath?.split('/')[0] || 'Django Project';

      for (const f of files) {
        const relRaw = (f.webkitRelativePath || f.name).replace(/\\/g, '/').replace(/^\/+/, '');
        const parts = relRaw.split('/').filter(Boolean);
        const lower = relRaw.toLowerCase();
        if (
          parts.some((seg) => IGNORED_DJANGO_DIRS.has(seg)) ||
          IGNORED_DJANGO_EXTS.some((ext) => lower.endsWith(ext)) ||
          f.size > 512 * 1024 ||
          Object.keys(rawMap).length >= 200
        ) {
          skipped += 1;
          continue;
        }
        const text = await f.text();
        if (text.includes('\u0000')) {
          skipped += 1;
          continue;
        }
        rawMap[relRaw] = text;
      }

      const rawKeys = Object.keys(rawMap);
      let prefix = '';
      const manageMatch = rawKeys
        .filter((p) => p === 'manage.py' || p.endsWith('/manage.py'))
        .sort((a, b) => a.split('/').length - b.split('/').length)[0];
      if (manageMatch && manageMatch.includes('/')) {
        prefix = manageMatch.slice(0, manageMatch.lastIndexOf('/') + 1);
        wrapperName = manageMatch.split('/')[manageMatch.split('/').length - 2] || wrapperName;
      } else if (!rawMap['manage.py']) {
        const firstDirs = new Set(rawKeys.filter((p) => p.includes('/')).map((p) => p.split('/')[0]));
        const hasRootFile = rawKeys.some((p) => !p.includes('/'));
        if (firstDirs.size === 1 && !hasRootFile) {
          const single = Array.from(firstDirs)[0];
          prefix = `${single}/`;
          wrapperName = single;
        }
      }

      const projectFiles: Record<string, string> = {};
      const hiddenFiles: Record<string, string> = {};
      for (const [origPath, content] of Object.entries(rawMap).sort(([a], [b]) => a.localeCompare(b))) {
        const rel = prefix && origPath.startsWith(prefix) ? origPath.slice(prefix.length) : origPath;
        if (!rel) continue;
        if (isHiddenDjangoTestPath(rel)) {
          hiddenFiles[rel] = content;
        } else {
          projectFiles[rel] = content;
        }
      }

      if (!projectFiles['README.md'] && !projectFiles['readme.md']) {
        const fallbackReadme = rawKeys.find((k) => k.toLowerCase().endsWith('/readme.md'));
        if (fallbackReadme) {
          projectFiles['README.md'] = rawMap[fallbackReadme];
        }
      }

      if (Object.keys(projectFiles).length === 0) {
        const msg = 'No readable Django source files found in selected folder.';
        setProbModalError(msg);
        setBanner({ type: 'err', text: msg });
        return;
      }
      applyUploadedDjangoProject(projectFiles, hiddenFiles, wrapperName, undefined, skipped);
    } catch (err: any) {
      const msg = err.message || 'Failed to read selected folder.';
      setProbModalError(msg);
      setBanner({ type: 'err', text: msg });
    } finally {
      setDjangoUploading(false);
    }
  };

  const handleDjangoZipUpload = async (file: File | null) => {
    if (!file) return;
    setDjangoUploading(true);
    setProbModalError(null);
    try {
      const res = await codingAdminApi.parseDjangoArchive(file);
      applyUploadedDjangoProject(
        res.project_files || {},
        res.hidden_test_files || {},
        file.name,
        res.readme,
        (res.skipped_files || []).length
      );
    } catch (err: any) {
      const msg = err.message || 'Failed to extract Django .zip archive.';
      setProbModalError(msg);
      setBanner({ type: 'err', text: msg });
    } finally {
      setDjangoUploading(false);
    }
  };

  const handleHiddenTestFilesUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setDjangoUploading(true);
    setProbModalError(null);
    try {
      const existingAppDir =
        Object.keys(probForm.project_files)
          .find((p) => p.endsWith('/models.py') || p.endsWith('/views.py'))
          ?.split('/')[0] || '';
      const uploadedHidden: Record<string, string> = {};
      let firstAdded = '';

      for (const f of files) {
        if (!f.name.endsWith('.py')) continue;
        const text = await f.text();
        const rawRel = (f.webkitRelativePath || f.name).replace(/\\/g, '/').replace(/^\/+/, '');
        const relPath =
          rawRel.includes('/')
            ? rawRel
            : existingAppDir
              ? `${existingAppDir}/${rawRel}`
              : rawRel;
        uploadedHidden[relPath] = text;
        if (!firstAdded) firstAdded = relPath;
      }
      let combinedCount = 0;
      setProbForm((prev) => {
        const merged = { ...prev.hidden_test_files, ...uploadedHidden };
        combinedCount = countDjangoTests(merged);
        return { ...prev, hidden_test_files: merged };
      });
      if (firstAdded) {
        setDjangoSection('hidden_test_files');
        setActiveDjangoFile(firstAdded);
      }
      setDjangoUploadNotice(
        `Added hidden grading test file(s). Total hidden test methods: ${combinedCount}.`
      );
    } catch (err: any) {
      const msg = err.message || 'Failed to read hidden test file(s).';
      setProbModalError(msg);
      setBanner({ type: 'err', text: msg });
    } finally {
      setDjangoUploading(false);
    }
  };

  const toggleDjangoFileVisibility = (filePath: string, fromHidden: boolean) => {
    setProbForm((prev) => {
      const nextProj = { ...prev.project_files };
      const nextHid = { ...prev.hidden_test_files };
      if (fromHidden) {
        const content = nextHid[filePath] ?? '';
        delete nextHid[filePath];
        nextProj[filePath] = content;
      } else {
        const content = nextProj[filePath] ?? '';
        delete nextProj[filePath];
        nextHid[filePath] = content;
      }
      return { ...prev, project_files: nextProj, hidden_test_files: nextHid };
    });
    setDjangoSection(fromHidden ? 'project_files' : 'hidden_test_files');
    setActiveDjangoFile(filePath);
  };

  const starterFieldForTab = `starter_${starterTab}` as
    | 'starter_python'
    | 'starter_java'
    | 'starter_c'
    | 'starter_cpp'
    | 'starter_javascript';

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={24} color="var(--primary)" />
            Coding Assessments Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Create algorithmic problems, public/hidden test cases, scheduled assessments, batch assignments, and analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={btnSecondary} onClick={loadAll}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button style={btnSecondary} onClick={openNewProblem}>
            <Plus size={15} /> New Coding Problem
          </button>
          <button style={btnPrimary} onClick={openNewAssessment}>
            <Plus size={15} /> New Assessment
          </button>
        </div>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: banner.type === 'ok' ? 'rgba(22,163,74,0.14)' : 'rgba(220,38,38,0.14)',
            color: banner.type === 'ok' ? '#16a34a' : '#dc2626',
            border: `1px solid ${banner.type === 'ok' ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'assessments' as AdminTab, label: `Assessments (${assessments.length})`, icon: Calendar },
          { id: 'problems' as AdminTab, label: `Problem Bank (${problems.length})`, icon: Code2 },
          { id: 'batches' as AdminTab, label: `Student Batches (${batches.length})`, icon: Users },
          { id: 'analytics' as AdminTab, label: 'Analytics & Submissions', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                ...(active ? btnPrimary : btnSecondary),
                padding: '0.55rem 1rem',
              }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          Loading SkilTrix coding assessment workspace...
        </div>
      ) : tab === 'assessments' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {assessments.map((a) => (
            <div key={a.assessment_id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={badge('rgba(37,99,235,0.14)', '#2563eb')}>{a.assessment_type.toUpperCase()}</span>
                  <span style={badge('rgba(22,163,74,0.14)', '#16a34a')}>{a.schedule_status}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.5rem' }}>{a.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {a.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
                  <span>{a.duration_minutes} mins</span>
                  <span>• {a.total_marks} marks</span>
                  <span>• {a.question_count} questions</span>
                  <span>• {a.assignment_mode}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <button style={btnSecondary} onClick={() => openEditAssessment(a)}>
                  <Edit3 size={13} /> Edit
                </button>
                <button style={btnSecondary} onClick={() => openAssignModal(a)}>
                  <Users size={13} /> Assign
                </button>
                <button
                  style={btnSecondary}
                  onClick={() => {
                    setSelectedAnalyticsId(a.assessment_id);
                    setTab('analytics');
                  }}
                >
                  <BarChart3 size={13} /> Analytics
                </button>
                <button
                  style={{ ...btnSecondary, color: '#dc2626' }}
                  onClick={async () => {
                    if (!window.confirm('Delete this assessment?')) return;
                    await codingAdminApi.deleteAssessment(a.assessment_id);
                    loadAll();
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'problems' ? (
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem' }}>Title</th>
                <th style={{ padding: '0.65rem' }}>Difficulty</th>
                <th style={{ padding: '0.65rem' }}>Marks</th>
                <th style={{ padding: '0.65rem' }}>Limits</th>
                <th style={{ padding: '0.65rem' }}>Test Cases</th>
                <th style={{ padding: '0.65rem' }}>Languages</th>
                <th style={{ padding: '0.65rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.problem_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem', fontWeight: 700 }}>
                    <div>{p.title}</div>
                    {p.question_type === 'django_debug' && (
                      <span style={badge('rgba(16,185,129,0.14)', '#10b981')}>
                        Django Project (manage.py test)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem' }}>{p.difficulty}</td>
                  <td style={{ padding: '0.65rem' }}>{p.points}</td>
                  <td style={{ padding: '0.65rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.time_limit_seconds}s / {p.memory_limit_mb} MB
                  </td>
                  <td style={{ padding: '0.65rem' }}>
                    {p.question_type === 'django_debug' ? (
                      <>
                        <span style={{ marginRight: '0.4rem' }}>
                          {Object.keys(p.project_files || {}).length} files
                        </span>
                        <span style={badge('rgba(245,158,11,0.14)', '#d97706')}>
                          {Object.keys(p.hidden_test_files || {}).length} hidden test suites
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '0.4rem' }}>{p.public_test_count} public</span>
                        <span style={badge('rgba(245,158,11,0.14)', '#d97706')}>{p.hidden_test_count} hidden</span>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem', fontSize: '0.78rem' }}>
                    {p.question_type === 'django_debug' ? 'django (tests.py)' : (p.supported_languages || []).join(', ')}
                  </td>
                  <td style={{ padding: '0.65rem', display: 'flex', gap: '0.4rem' }}>
                    <button style={btnSecondary} onClick={() => openEditProblem(p)}>
                      <Edit3 size={13} /> Edit
                    </button>
                    <button style={{ ...btnSecondary, color: '#dc2626' }} onClick={() => deleteProblem(p.problem_id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'batches' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
          <form onSubmit={saveBatchHandler} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700 }}>{editingBatchId ? 'Edit Student Batch' : 'Create Student Batch'}</h3>
              {editingBatchId && (
                <button
                  type="button"
                  style={btnSecondary}
                  onClick={() => {
                    setEditingBatchId(null);
                    setBatchName('');
                    setBatchDesc('');
                    setSelectedBatchStudents([]);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            <input required placeholder="Batch Name (e.g., CS-2026 Placement Batch)" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
            <textarea rows={2} placeholder="Batch description" value={batchDesc} onChange={(e) => setBatchDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                style={{ flex: 1 }}
                placeholder="Search students by name/email..."
                value={studentQuery}
                onChange={(e) => searchStudentsHandler(e.target.value)}
              />
              <button type="button" style={btnSecondary} onClick={() => searchStudentsHandler(studentQuery)}>
                Search
              </button>
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem' }}>
              {studentHits.map((stu) => (
                <label key={stu.user_id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', padding: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedBatchStudents.includes(stu.user_id)}
                    onChange={(e) =>
                      setSelectedBatchStudents((prev) =>
                        e.target.checked ? [...prev, stu.user_id] : prev.filter((id) => id !== stu.user_id)
                      )
                    }
                  />
                  <span>{stu.full_name} ({stu.email})</span>
                </label>
              ))}
            </div>
            <button type="submit" style={btnPrimary}>
              {editingBatchId ? `Update Batch (${selectedBatchStudents.length} students)` : `Save Batch (${selectedBatchStudents.length} students)`}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {batches.map((b) => (
              <div key={b.batch_id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {b.student_count} students enrolled • {b.description}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button style={btnSecondary} onClick={() => openEditBatch(b)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    style={{ ...btnSecondary, color: '#dc2626' }}
                    onClick={async () => {
                      await codingAdminApi.deleteBatch(b.batch_id);
                      loadAll();
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Assessment:</span>
              <select value={selectedAnalyticsId} onChange={(e) => setSelectedAnalyticsId(e.target.value)}>
                {assessments.map((a) => (
                  <option key={a.assessment_id} value={a.assessment_id}>
                    {a.title} ({a.assessment_type} • {a.attempt_count || 0} attempts)
                  </option>
                ))}
              </select>
            </div>
            {selectedAnalyticsId && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={btnSecondary}
                  onClick={async () => {
                    await codingAdminApi.releaseResults(selectedAnalyticsId);
                    setBanner({ type: 'ok', text: 'Results released to students.' });
                    codingAdminApi.getAnalytics(selectedAnalyticsId).then(setAnalytics);
                  }}
                >
                  <Send size={14} /> Release Results
                </button>
                <button
                  style={btnSecondary}
                  onClick={() =>
                    codingAdminApi
                      .downloadExport(selectedAnalyticsId, 'csv')
                      .catch((err) => setBanner({ type: 'err', text: err.message }))
                  }
                >
                  <FileSpreadsheet size={14} /> Export CSV
                </button>
                <button
                  style={btnSecondary}
                  onClick={() =>
                    codingAdminApi
                      .downloadExport(selectedAnalyticsId, 'json')
                      .catch((err) => setBanner({ type: 'err', text: err.message }))
                  }
                >
                  <Download size={14} /> Export JSON
                </button>
              </div>
            )}
          </div>

          {analytics && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Total Attempts', value: analytics.overview.total_attempts },
                  { label: 'Completed', value: analytics.overview.completed_attempts },
                  { label: 'Average Score %', value: `${analytics.overview.average_percentage}%` },
                  { label: 'Pass Rate', value: `${analytics.overview.pass_rate}%` },
                  { label: 'Code Submissions', value: analytics.overview.total_submissions },
                ].map((kpi) => (
                  <div key={kpi.label} style={cardStyle}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.2rem' }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Problem-wise Success Rates */}
              <div style={{ ...cardStyle, overflowX: 'auto' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={16} color="var(--primary)" /> Problem-Wise Success Rates
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Problem</th>
                      <th style={{ padding: '0.5rem' }}>Attempted</th>
                      <th style={{ padding: '0.5rem' }}>Solved</th>
                      <th style={{ padding: '0.5rem' }}>Success Rate</th>
                      <th style={{ padding: '0.5rem' }}>Avg Score</th>
                      <th style={{ padding: '0.5rem' }}>Avg Runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.problem_stats.map((ps) => (
                      <tr key={ps.problem_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.55rem', fontWeight: 700 }}>{ps.title}</td>
                        <td style={{ padding: '0.55rem' }}>{ps.students_attempted}</td>
                        <td style={{ padding: '0.55rem' }}>{ps.students_solved}</td>
                        <td style={{ padding: '0.55rem', fontWeight: 700, color: '#16a34a' }}>{ps.success_rate}%</td>
                        <td style={{ padding: '0.55rem' }}>{ps.average_score} / {ps.marks}</td>
                        <td style={{ padding: '0.55rem' }}>{ps.average_execution_ms} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Student Scoreboard */}
              <div style={{ ...cardStyle, overflowX: 'auto' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> Student-Wise Scores
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Student</th>
                      <th style={{ padding: '0.5rem' }}>Status</th>
                      <th style={{ padding: '0.5rem' }}>Score</th>
                      <th style={{ padding: '0.5rem' }}>%</th>
                      <th style={{ padding: '0.5rem' }}>Solved</th>
                      <th style={{ padding: '0.5rem' }}>Accuracy</th>
                      <th style={{ padding: '0.5rem' }}>Time</th>
                      <th style={{ padding: '0.5rem' }}>Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.student_scores.map((s) => (
                      <tr key={s.attempt_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.55rem' }}>
                          <div style={{ fontWeight: 700 }}>{s.student_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.student_email}</div>
                        </td>
                        <td style={{ padding: '0.55rem' }}>{s.status}</td>
                        <td style={{ padding: '0.55rem', fontWeight: 700 }}>{s.total_score}/{s.max_possible_score}</td>
                        <td style={{ padding: '0.55rem' }}>{s.percentage}%</td>
                        <td style={{ padding: '0.55rem' }}>{s.problems_solved}/{s.total_questions ?? s.problems_attempted}</td>
                        <td style={{ padding: '0.55rem' }}>{s.accuracy}%</td>
                        <td style={{ padding: '0.55rem' }}>{Math.round(s.time_taken_seconds / 60)}m</td>
                        <td style={{ padding: '0.55rem' }}>
                          <button style={btnSecondary} onClick={() => setInspectAttempt(s)}>
                            <Eye size={13} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Student Submissions */}
              <div style={{ ...cardStyle, overflowX: 'auto' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Student Code Submissions</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Student</th>
                      <th style={{ padding: '0.5rem' }}>Problem</th>
                      <th style={{ padding: '0.5rem' }}>Lang</th>
                      <th style={{ padding: '0.5rem' }}>Verdict</th>
                      <th style={{ padding: '0.5rem' }}>Cases</th>
                      <th style={{ padding: '0.5rem' }}>Score</th>
                      <th style={{ padding: '0.5rem' }}>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.submissions.map((sub) => (
                      <tr key={sub.submission_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{sub.student_name}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{sub.problem_title}</td>
                        <td style={{ padding: '0.5rem' }}>{sub.language}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 700 }}>{sub.status}</td>
                        <td style={{ padding: '0.5rem' }}>{sub.passed_test_cases}/{sub.total_test_cases}</td>
                        <td style={{ padding: '0.5rem' }}>{sub.score}/{sub.max_score}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <button style={btnSecondary} onClick={() => setInspectSub(sub)}>
                            <Eye size={13} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Problem Editor Modal */}
      {showProblemForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <form onSubmit={saveProblem} style={{ ...cardStyle, width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingProblemId ? 'Edit Coding Problem' : 'Create Coding Problem'}
              </h2>
              <button type="button" style={btnSecondary} onClick={() => setShowProblemForm(false)}>
                <X size={16} />
              </button>
            </div>

            {probModalError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(220,38,38,0.14)',
                  color: '#ef4444',
                  border: '1px solid rgba(220,38,38,0.35)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                {probModalError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr)', gap: '0.6rem' }}>
              <input
                required
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                placeholder="Problem Title"
                value={probForm.title}
                onChange={(e) => setProbForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <select
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                value={probForm.question_type}
                onChange={(e) => {
                  const nextType = e.target.value as 'algorithmic' | 'debugging' | 'django_debug';
                  setProbModalError(null);
                  if (nextType === 'django_debug') {
                    setDjangoSection('project_files');
                    setDjangoUploadNotice(null);
                    setActiveDjangoFile(Object.keys(probForm.project_files)[0] || '');
                    setProbForm((prev) => ({
                      ...prev,
                      question_type: nextType,
                      category: prev.category === 'DSA' ? 'Django Backend' : prev.category,
                      supported_languages: ['django'],
                      time_limit_seconds: Math.max(prev.time_limit_seconds || 2, 25),
                      memory_limit_mb: Math.max(prev.memory_limit_mb || 256, 512),
                    }));
                  } else {
                    setProbForm((prev) => ({
                      ...prev,
                      question_type: nextType,
                      supported_languages:
                        prev.supported_languages.length === 1 && prev.supported_languages[0] === 'django'
                          ? ['python', 'java', 'c', 'cpp', 'javascript']
                          : prev.supported_languages,
                    }));
                  }
                }}
              >
                <option value="algorithmic">Algorithmic (Stdin/Stdout)</option>
                <option value="debugging">Single-File Debugging</option>
                <option value="django_debug">Django Project (tests.py)</option>
              </select>
              <select
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                value={probForm.difficulty}
                onChange={(e) => setProbForm((prev) => ({ ...prev, difficulty: e.target.value as any }))}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.6rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Marks
                <input
                  type="number"
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                  placeholder="Marks"
                  value={probForm.points}
                  onChange={(e) => setProbForm((prev) => ({ ...prev, points: Number(e.target.value) }))}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Time Limit (s)
                <input
                  type="number"
                  step="0.5"
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                  placeholder="Time(s)"
                  value={probForm.time_limit_seconds}
                  onChange={(e) => setProbForm((prev) => ({ ...prev, time_limit_seconds: Number(e.target.value) }))}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Memory Limit (MB)
                <input
                  type="number"
                  style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                  placeholder="Mem(MB)"
                  value={probForm.memory_limit_mb}
                  onChange={(e) => setProbForm((prev) => ({ ...prev, memory_limit_mb: Number(e.target.value) }))}
                />
              </label>
            </div>

            <textarea
              required
              rows={probForm.question_type === 'django_debug' ? 5 : 4}
              placeholder={
                probForm.question_type === 'django_debug'
                  ? 'Issue Description & Expected Fix (auto-filled from README.md if left blank during upload)...'
                  : 'Full Problem Statement...'
              }
              value={probForm.description}
              onChange={(e) => setProbForm((prev) => ({ ...prev, description: e.target.value }))}
            />

            {probForm.question_type !== 'django_debug' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                  <textarea rows={2} placeholder="Input Format" value={probForm.input_format} onChange={(e) => setProbForm((prev) => ({ ...prev, input_format: e.target.value }))} />
                  <textarea rows={2} placeholder="Output Format" value={probForm.output_format} onChange={(e) => setProbForm((prev) => ({ ...prev, output_format: e.target.value }))} />
                  <textarea rows={2} placeholder="Constraints" value={probForm.constraints} onChange={(e) => setProbForm((prev) => ({ ...prev, constraints: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                  <textarea rows={2} placeholder="Sample Input (Preview)" value={probForm.sample_input} onChange={(e) => setProbForm((prev) => ({ ...prev, sample_input: e.target.value }))} />
                  <textarea rows={2} placeholder="Sample Output (Preview)" value={probForm.sample_output} onChange={(e) => setProbForm((prev) => ({ ...prev, sample_output: e.target.value }))} />
                  <textarea rows={2} placeholder="Sample Explanation" value={probForm.sample_explanation} onChange={(e) => setProbForm((prev) => ({ ...prev, sample_explanation: e.target.value }))} />
                </div>
              </>
            )}

            {probForm.question_type === 'django_debug' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.9rem' }}>
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
                  onChange={(e) => {
                    const picked = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = '';
                    void handleLocalDjangoFolderUpload(picked);
                  }}
                />
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const picked = e.target.files?.[0] || null;
                    e.target.value = '';
                    void handleDjangoZipUpload(picked);
                  }}
                />
                <input
                  ref={hiddenTestInputRef}
                  type="file"
                  accept=".py"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const picked = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = '';
                    void handleHiddenTestFilesUpload(picked);
                  }}
                />

                {/* Upload Dropzone Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px dashed var(--primary)',
                    background: 'rgba(37,99,235,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FolderUp size={16} color="var(--primary)" /> Upload Local Django Project
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>
                      Upload a local Django project folder or <code>.zip</code> (includes buggy app code + <code>tests.py</code>; files matching <code>tests_hidden*.py</code> auto-move to Hidden Grading Tests).
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    <button
                      type="button"
                      disabled={djangoUploading}
                      style={btnPrimary}
                      onClick={() => folderInputRef.current?.click()}
                    >
                      <FolderUp size={14} /> {djangoUploading ? 'Reading...' : 'Upload Folder'}
                    </button>
                    <button
                      type="button"
                      disabled={djangoUploading}
                      style={btnSecondary}
                      onClick={() => zipInputRef.current?.click()}
                    >
                      <FileArchive size={14} /> Upload .zip
                    </button>
                    <button
                      type="button"
                      disabled={djangoUploading}
                      style={btnSecondary}
                      onClick={() => hiddenTestInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Hidden .py
                    </button>
                    {defaultDjangoProject && (
                      <button
                        type="button"
                        style={btnSecondary}
                        onClick={() =>
                          applyUploadedDjangoProject(
                            { ...defaultDjangoProject.project_files },
                            { ...defaultDjangoProject.hidden_test_files },
                            'Amazon Django Post Upload',
                            defaultDjangoProject.project_files['README.md']
                          )
                        }
                      >
                        Load Amazon Template
                      </button>
                    )}
                    {(Object.keys(probForm.project_files).length > 0 ||
                      Object.keys(probForm.hidden_test_files).length > 0) && (
                      <button
                        type="button"
                        style={{ ...btnSecondary, color: '#dc2626' }}
                        onClick={() => {
                          setProbForm((prev) => ({ ...prev, project_files: {}, hidden_test_files: {} }));
                          setActiveDjangoFile('');
                          setDjangoUploadNotice(null);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {djangoUploadNotice && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.7rem',
                      borderRadius: '6px',
                      background: probForm.project_files['manage.py'] ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.12)',
                      color: probForm.project_files['manage.py'] ? '#10b981' : '#d97706',
                      fontWeight: 600,
                    }}
                  >
                    {djangoUploadNotice}
                  </div>
                )}

                {/* Status Summary + Section Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      style={djangoSection === 'project_files' ? btnPrimary : btnSecondary}
                      onClick={() => {
                        setDjangoSection('project_files');
                        const keys = Object.keys(probForm.project_files);
                        setActiveDjangoFile(
                          probForm.project_files['posts/views.py'] !== undefined ? 'posts/views.py' : keys[0] || ''
                        );
                      }}
                    >
                      Project &amp; Public Tests ({Object.keys(probForm.project_files).length})
                    </button>
                    <button
                      type="button"
                      style={djangoSection === 'hidden_test_files' ? btnPrimary : btnSecondary}
                      onClick={() => {
                        setDjangoSection('hidden_test_files');
                        const keys = Object.keys(probForm.hidden_test_files);
                        setActiveDjangoFile(keys[0] || '');
                      }}
                    >
                      <EyeOff size={14} /> Hidden Grading Tests ({Object.keys(probForm.hidden_test_files).length})
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center', fontSize: '0.76rem' }}>
                    <span
                      style={badge(
                        probForm.project_files['manage.py'] ? 'rgba(16,185,129,0.14)' : 'rgba(220,38,38,0.14)',
                        probForm.project_files['manage.py'] ? '#10b981' : '#dc2626'
                      )}
                    >
                      {probForm.project_files['manage.py'] ? 'manage.py detected' : 'Missing manage.py'}
                    </span>
                    <span style={badge('rgba(37,99,235,0.12)', '#3b82f6')}>
                      {countDjangoTests(probForm.project_files)} public tests
                    </span>
                    <span style={badge('rgba(245,158,11,0.14)', '#d97706')}>
                      {countDjangoTests(probForm.hidden_test_files)} hidden tests
                    </span>
                  </div>
                </div>

                {/* Uploaded File Inspector */}
                {(() => {
                  const currentFiles = probForm[djangoSection] || {};
                  const currentKeys = Object.keys(currentFiles).sort();
                  const lockedPaths = getLockedDjangoPaths(probForm.project_files);
                  if (currentKeys.length === 0) {
                    return (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        {djangoSection === 'project_files'
                          ? 'No Django project uploaded yet. Click "Upload Folder" or "Upload .zip" above to upload your local Django problem project.'
                          : 'No hidden grading test files uploaded. Name hidden test files tests_hidden.py or click "Upload Hidden .py".'}
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '0.75rem', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
                        {currentKeys.map((filePath) => {
                          const isLocked = djangoSection === 'project_files' && lockedPaths.has(filePath);
                          const isSelected = activeDjangoFile === filePath;
                          return (
                            <div key={filePath} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={() => setActiveDjangoFile(filePath)}
                                title={isLocked ? 'Automatically locked read-only in student CodeLab' : filePath}
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.35rem',
                                  textAlign: 'left',
                                  fontSize: '0.76rem',
                                  fontFamily: 'monospace',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  background: isSelected ? 'var(--primary)' : 'transparent',
                                  color: isSelected ? '#fff' : 'inherit',
                                }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filePath}</span>
                                {isLocked && <Lock size={11} style={{ flexShrink: 0, opacity: 0.85 }} />}
                              </button>
                              {filePath.endsWith('.py') && (
                                <button
                                  type="button"
                                  title={
                                    djangoSection === 'hidden_test_files'
                                      ? 'Move to Public Project Files'
                                      : 'Move to Hidden Grading Tests'
                                  }
                                  style={{ ...btnSecondary, padding: '0.3rem' }}
                                  onClick={() => toggleDjangoFileVisibility(filePath, djangoSection === 'hidden_test_files')}
                                >
                                  {djangoSection === 'hidden_test_files' ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                              )}
                              <button
                                type="button"
                                title="Remove file"
                                style={{ ...btnSecondary, padding: '0.3rem', color: '#dc2626' }}
                                onClick={() => {
                                  setProbForm((prev) => {
                                    const copy = { ...(prev[djangoSection] || {}) };
                                    delete copy[filePath];
                                    return { ...prev, [djangoSection]: copy };
                                  });
                                  if (activeDjangoFile === filePath) {
                                    const remaining = currentKeys.filter((k) => k !== filePath);
                                    setActiveDjangoFile(remaining[0] || '');
                                  }
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          <span>
                            {activeDjangoFile
                              ? `${djangoSection === 'hidden_test_files' ? '[HIDDEN] ' : ''}${activeDjangoFile}`
                              : 'Select a file to preview'}
                          </span>
                          {activeDjangoFile && djangoSection === 'project_files' && lockedPaths.has(activeDjangoFile) && (
                            <span style={badge('rgba(245,158,11,0.14)', '#d97706')}>
                              <Lock size={11} /> Locked in CodeLab
                            </span>
                          )}
                        </div>
                        <textarea
                          rows={12}
                          disabled={!activeDjangoFile}
                          style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.82rem' }}
                          value={activeDjangoFile ? (currentFiles[activeDjangoFile] ?? '') : ''}
                          onChange={(e) => {
                            if (!activeDjangoFile) return;
                            const val = e.target.value;
                            setProbForm((prev) => ({
                              ...prev,
                              [djangoSection]: {
                                ...(prev[djangoSection] || {}),
                                [activeDjangoFile]: val,
                              },
                            }));
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Supported Languages:</span>
                  {ALL_LANGUAGES.map((l) => (
                    <label key={l.id} style={{ display: 'flex', gap: '0.35rem', fontSize: '0.82rem' }}>
                      <input
                        type="checkbox"
                        checked={probForm.supported_languages.includes(l.id)}
                        onChange={(e) =>
                          setProbForm((prev) => ({
                            ...prev,
                            supported_languages: e.target.checked
                              ? [...prev.supported_languages, l.id]
                              : prev.supported_languages.filter((x) => x !== l.id),
                          }))
                        }
                      />
                      {l.label}
                    </label>
                  ))}
                </div>

                {/* 5-Language Starter Code Tabs */}
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    {ALL_LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        style={starterTab === l.id ? btnPrimary : btnSecondary}
                        onClick={() => setStarterTab(l.id)}
                      >
                        {l.label} Starter
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={5}
                    style={{ width: '100%', fontFamily: 'monospace' }}
                    value={probForm[starterFieldForTab]}
                    onChange={(e) => setProbForm((prev) => ({ ...prev, [starterFieldForTab]: e.target.value }))}
                  />
                </div>

                {/* Public & Hidden Test Cases Builder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                      Test Cases (Public &amp; Hidden)
                    </span>
                    <button
                      type="button"
                      style={btnSecondary}
                      onClick={() =>
                        setProbForm((prev) => ({
                          ...prev,
                          test_cases: [
                            ...prev.test_cases,
                            { input_data: '', expected_output: '', is_hidden: true, points: 25, order: prev.test_cases.length + 1 },
                          ],
                        }))
                      }
                    >
                      <Plus size={14} /> Add Test Case
                    </button>
                  </div>
                  {probForm.test_cases.map((tc, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: '0.45rem', alignItems: 'start' }}>
                      <textarea
                        rows={2}
                        placeholder="Stdin"
                        value={tc.input_data}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProbForm((prev) => ({
                            ...prev,
                            test_cases: prev.test_cases.map((item, i) => (i === idx ? { ...item, input_data: val } : item)),
                          }));
                        }}
                      />
                      <textarea
                        rows={2}
                        placeholder="Expected Stdout"
                        value={tc.expected_output}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProbForm((prev) => ({
                            ...prev,
                            test_cases: prev.test_cases.map((item, i) => (i === idx ? { ...item, expected_output: val } : item)),
                          }));
                        }}
                      />
                      <button
                        type="button"
                        style={btnSecondary}
                        onClick={() =>
                          setProbForm((prev) => ({
                            ...prev,
                            test_cases: prev.test_cases.map((item, i) => (i === idx ? { ...item, is_hidden: !item.is_hidden } : item)),
                          }))
                        }
                      >
                        {tc.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        {tc.is_hidden ? 'Hidden' : 'Public'}
                      </button>
                      <input
                        type="number"
                        style={{ width: '70px' }}
                        value={tc.points}
                        onChange={(e) => {
                          const pts = Number(e.target.value);
                          setProbForm((prev) => ({
                            ...prev,
                            test_cases: prev.test_cases.map((item, i) => (i === idx ? { ...item, points: pts } : item)),
                          }));
                        }}
                      />
                      <button
                        type="button"
                        style={{ ...btnSecondary, color: '#dc2626' }}
                        onClick={() =>
                          setProbForm((prev) => ({
                            ...prev,
                            test_cases: prev.test_cases.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" style={btnSecondary} onClick={() => setShowProblemForm(false)}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save Coding Problem</button>
            </div>
          </form>
        </div>
      )}

      {/* Assessment Editor Modal */}
      {showAsmtForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <form onSubmit={saveAssessment} style={{ ...cardStyle, width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingAsmtId ? 'Edit Assessment' : 'Create Coding Assessment'}
              </h2>
              <button type="button" style={btnSecondary} onClick={() => setShowAsmtForm(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.6rem' }}>
              <input required placeholder="Assessment Title" value={asmtForm.title} onChange={(e) => setAsmtForm({ ...asmtForm, title: e.target.value })} />
              <select value={asmtForm.assessment_type} onChange={(e) => setAsmtForm({ ...asmtForm, assessment_type: e.target.value as any })}>
                <option value="coding">Coding Assessment</option>
                <option value="technical">Technical Assessment</option>
                <option value="mcq">MCQ Assessment</option>
                <option value="company">Company-Specific</option>
              </select>
              <select value={asmtForm.difficulty} onChange={(e) => setAsmtForm({ ...asmtForm, difficulty: e.target.value as any })}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem' }}>
              <input type="number" placeholder="Duration (mins)" value={asmtForm.duration_minutes} onChange={(e) => setAsmtForm({ ...asmtForm, duration_minutes: Number(e.target.value) })} />
              <input type="number" placeholder="Total Marks" value={asmtForm.total_marks} onChange={(e) => setAsmtForm({ ...asmtForm, total_marks: Number(e.target.value) })} />
              <input type="number" placeholder="Pass %" value={asmtForm.pass_percentage} onChange={(e) => setAsmtForm({ ...asmtForm, pass_percentage: Number(e.target.value) })} />
              <select value={asmtForm.assignment_mode} onChange={(e) => setAsmtForm({ ...asmtForm, assignment_mode: e.target.value as any })}>
                <option value="public">Open to All Students</option>
                <option value="assigned">Assigned Batches/Students</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule Start</label>
                <input type="datetime-local" style={{ width: '100%' }} value={asmtForm.start_time} onChange={(e) => setAsmtForm({ ...asmtForm, start_time: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schedule End</label>
                <input type="datetime-local" style={{ width: '100%' }} value={asmtForm.end_time} onChange={(e) => setAsmtForm({ ...asmtForm, end_time: e.target.value })} />
              </div>
            </div>

            <textarea rows={2} placeholder="Assessment description & overview..." value={asmtForm.description} onChange={(e) => setAsmtForm({ ...asmtForm, description: e.target.value })} />
            <textarea rows={2} placeholder="Pre-test candidate instructions shown before starting timer..." value={asmtForm.instructions} onChange={(e) => setAsmtForm({ ...asmtForm, instructions: e.target.value })} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Allowed Languages:</span>
              {ALL_LANGUAGES.map((l) => (
                <label key={l.id} style={{ display: 'flex', gap: '0.35rem', fontSize: '0.82rem' }}>
                  <input
                    type="checkbox"
                    checked={asmtForm.supported_languages.includes(l.id)}
                    onChange={(e) =>
                      setAsmtForm((prev) => ({
                        ...prev,
                        supported_languages: e.target.checked
                          ? [...prev.supported_languages, l.id]
                          : prev.supported_languages.filter((x) => x !== l.id),
                      }))
                    }
                  />
                  {l.label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input type="checkbox" checked={asmtForm.proctoring_enabled} onChange={(e) => setAsmtForm({ ...asmtForm, proctoring_enabled: e.target.checked })} />
                <Shield size={14} /> Proctoring Enabled
              </label>
              <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input type="checkbox" checked={asmtForm.require_fullscreen} onChange={(e) => setAsmtForm({ ...asmtForm, require_fullscreen: e.target.checked })} />
                Require Fullscreen
              </label>
              <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input type="checkbox" checked={asmtForm.show_results_immediately} onChange={(e) => setAsmtForm({ ...asmtForm, show_results_immediately: e.target.checked })} />
                Show Results Immediately
              </label>
              <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <input type="checkbox" checked={asmtForm.negative_marking} onChange={(e) => setAsmtForm({ ...asmtForm, negative_marking: e.target.checked })} />
                Negative Marking ({asmtForm.negative_marking_percentage}%)
              </label>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Attach Coding Problems ({asmtForm.selectedProblems.length} selected)
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {problems.map((p) => {
                  const sel = asmtForm.selectedProblems.find((x) => x.problem_id === p.problem_id);
                  return (
                    <div key={p.problem_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.83rem' }}>
                      <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={Boolean(sel)} onChange={() => toggleProblemInAsmt(p.problem_id, p.points || 100)} />
                        <span>
                          {p.title} ({p.difficulty})
                          {p.question_type === 'django_debug' ? ' • [Django]' : ''}
                        </span>
                      </label>
                      {sel && (
                        <input
                          type="number"
                          style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                          value={sel.marks}
                          onChange={(e) =>
                            setAsmtForm((prev) => ({
                              ...prev,
                              selectedProblems: prev.selectedProblems.map((sp) =>
                                sp.problem_id === p.problem_id ? { ...sp, marks: Number(e.target.value) } : sp
                              ),
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" style={btnSecondary} onClick={() => setShowAsmtForm(false)}>Cancel</button>
              <button type="submit" style={btnPrimary}>Save Assessment</button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Assessment Modal */}
      {assignModalAsmt && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800 }}>Assign: {assignModalAsmt.title}</h3>
              <button style={btnSecondary} onClick={() => setAssignModalAsmt(null)}><X size={16} /></button>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Assign Batches</div>
              {batches.map((b) => (
                <label key={b.batch_id} style={{ display: 'flex', gap: '0.45rem', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={assignBatchIds.includes(b.batch_id)}
                    onChange={(e) =>
                      setAssignBatchIds((prev) =>
                        e.target.checked ? [...prev, b.batch_id] : prev.filter((id) => id !== b.batch_id)
                      )
                    }
                  />
                  <span>{b.name} ({b.student_count} students)</span>
                </label>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Assign Individual Students</div>
              <input placeholder="Filter students..." value={studentQuery} onChange={(e) => searchStudentsHandler(e.target.value)} style={{ width: '100%', marginBottom: '0.4rem' }} />
              <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem' }}>
                {studentHits.map((s) => (
                  <label key={s.user_id} style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', padding: '0.2rem' }}>
                    <input
                      type="checkbox"
                      checked={assignStudentIds.includes(s.user_id)}
                      onChange={(e) =>
                        setAssignStudentIds((prev) =>
                          e.target.checked ? [...prev, s.user_id] : prev.filter((id) => id !== s.user_id)
                        )
                      }
                    />
                    <span>{s.full_name} ({s.email})</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional Start Override</label>
                <input type="datetime-local" style={{ width: '100%' }} value={assignStartTime} onChange={(e) => setAssignStartTime(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional End Override</label>
                <input type="datetime-local" style={{ width: '100%' }} value={assignEndTime} onChange={(e) => setAssignEndTime(e.target.value)} />
              </div>
            </div>
            <button style={btnPrimary} onClick={saveAssignments}>Grant Access</button>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Current Assignments ({assignments.length})</div>
              {assignments.map((asg) => (
                <div key={asg.assignment_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.25rem 0' }}>
                  <span>{asg.batch_name ? `Batch: ${asg.batch_name}` : `Student: ${asg.student_name}`}</span>
                  <button
                    style={{ background: 'none', border: 'none', color: '#dc2626' }}
                    onClick={async () => {
                      await codingAdminApi.deleteAssignment(assignModalAsmt.assessment_id, asg.assignment_id);
                      const res = await codingAdminApi.listAssignments(assignModalAsmt.assessment_id);
                      setAssignments(res.assignments || []);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Inspector Modal */}
      {inspectSub && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '760px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 800 }}>{inspectSub.problem_title} — {inspectSub.student_name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {inspectSub.status} • {inspectSub.passed_test_cases}/{inspectSub.total_test_cases} cases • {inspectSub.language}
                </div>
              </div>
              <button style={btnSecondary} onClick={() => setInspectSub(null)}><X size={16} /></button>
            </div>
            <pre style={{ padding: '0.85rem', borderRadius: '8px', background: '#0f172a', color: '#e2e8f0', overflowX: 'auto', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              {inspectSub.source_code}
            </pre>
            {inspectSub.error_message && (
              <pre style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {inspectSub.error_message}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Candidate Attempt Answers Inspector Modal */}
      {inspectAttempt && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '820px', maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 800 }}>Attempt {inspectAttempt.attempt_id} — {inspectAttempt.student_name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inspectAttempt.student_email}</div>
              </div>
              <button style={btnSecondary} onClick={() => setInspectAttempt(null)}><X size={16} /></button>
            </div>
            <AttemptAnswersPanel attempt={inspectAttempt} />
          </div>
        </div>
      )}
    </div>
  );
}
