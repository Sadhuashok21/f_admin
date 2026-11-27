const API_BASE = import.meta.env.VITE_API_URL || '';

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('as_access_token') || localStorage.getItem('access_token')
      : null;
  const csrf = getCookie('csrftoken');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Admin-Portal': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrf ? { 'X-CSRFToken': csrf } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}/apps/skiltrix/api/assessments/coding${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 204) {
    return {} as T;
  }
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(payload?.detail || payload?.error || `HTTP ${res.status}`);
  }
  return payload as T;
}

export interface AdminTestCaseDTO {
  test_case_id?: string;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
  points: number;
  order: number;
}

export interface AdminCodingProblemDTO {
  problem_id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_type: string;
  category: string;
  topics: string[];
  points: number;
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  expected_complexity: string;
  sample_input: string;
  sample_output: string;
  sample_explanation: string;
  time_limit_seconds: number;
  memory_limit_mb: number;
  supported_languages: string[];
  starter_python: string;
  starter_java: string;
  starter_c: string;
  starter_cpp: string;
  starter_javascript: string;
  starter_codes: Record<string, string>;
  project_files?: Record<string, string>;
  hidden_test_files?: Record<string, string>;
  solution_code: string;
  explanation: string;
  is_active: boolean;
  public_test_count: number;
  hidden_test_count: number;
  test_cases: AdminTestCaseDTO[];
  created_at: string;
}

export interface AdminAssessmentDTO {
  assessment_id: string;
  title: string;
  slug: string;
  assessment_type: 'mcq' | 'technical' | 'coding' | 'company';
  category: string;
  company_tag?: string;
  description: string;
  instructions?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_minutes: number;
  pass_percentage: number;
  total_marks: number;
  negative_marking: boolean;
  negative_marking_percentage: number;
  supported_languages: string[];
  start_time: string | null;
  end_time: string | null;
  schedule_status: string;
  assignment_mode: 'public' | 'assigned';
  show_results_immediately: boolean;
  is_company_mock: boolean;
  proctoring_enabled: boolean;
  require_fullscreen: boolean;
  active: boolean;
  question_count: number;
  coding_problem_count: number;
  attempt_count?: number;
  questions?: Array<{
    item_id: string;
    title: string;
    marks: number;
    problem?: { problem_id: string; title: string; difficulty: string } | null;
  }>;
}

export interface StudentBatchDTO {
  batch_id: string;
  name: string;
  description: string;
  is_active: boolean;
  student_count: number;
  students_detail: Array<{
    user_id: string;
    username: string;
    full_name: string;
    email: string;
  }>;
}

export interface AssessmentAssignmentDTO {
  assignment_id: string;
  assessment_id: string;
  student_id: string | null;
  student_name: string | null;
  batch_id: string | null;
  batch_name: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface AdminAssessmentAnalyticsDTO {
  assessment: AdminAssessmentDTO;
  overview: {
    total_attempts: number;
    completed_attempts: number;
    average_percentage: number;
    pass_rate: number;
    total_submissions: number;
  };
  student_scores: AdminGlobalAttemptDTO[];
  problem_stats: Array<{
    problem_id: string;
    title: string;
    difficulty: string;
    marks: number;
    total_submissions: number;
    students_attempted: number;
    students_solved: number;
    partial_submissions: number;
    success_rate: number;
    average_score: number;
    average_execution_ms: number;
  }>;
  submissions: Array<{
    submission_id: string;
    student_id: string;
    student_name: string;
    problem_id: string;
    problem_title: string;
    language: string;
    source_code: string;
    status: string;
    passed_test_cases: number;
    total_test_cases: number;
    score: number;
    max_score: number;
    execution_time_ms: number;
    memory_kb: number;
    error_message: string;
    created_at: string;
  }>;
}

export interface AdminAttemptQuestionAnswerDTO {
  item_id: string;
  problem_id?: string | null;
  title: string;
  question_type: string;
  difficulty: string;
  prompt?: string;
  language: string | null;
  status: string;
  passed_test_cases: number;
  total_test_cases: number;
  score: number;
  max_score: number;
  execution_time_ms: number;
  memory_kb?: number;
  submission_id?: string | null;
  user_answer?: unknown;
  user_answer_display?: string | null;
  correct_answer_display?: string | null;
  source_code?: string | null;
  error_message?: string;
}

export interface AdminGlobalAttemptDTO {
  attempt_id: string;
  assessment_id: string;
  assessment_title: string;
  assessment_type: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  passed: boolean;
  total_questions?: number;
  problems_attempted: number;
  problems_solved: number;
  test_cases_passed: number;
  test_cases_total: number;
  accuracy: number;
  time_taken_seconds: number;
  results_released: boolean;
  problem_wise: AdminAttemptQuestionAnswerDTO[];
  started_at: string;
  completed_at: string | null;
}

export interface AdminGlobalSubmissionsDTO {
  attempts: AdminGlobalAttemptDTO[];
  coding_submissions: AdminAssessmentAnalyticsDTO['submissions'];
  total_attempts: number;
  total_coding_submissions: number;
}

export interface ParsedDjangoArchiveDTO {
  project_files: Record<string, string>;
  hidden_test_files: Record<string, string>;
  locked_files: string[];
  readme: string;
  skipped_files: string[];
  stats: {
    file_count: number;
    hidden_file_count: number;
    has_manage_py: boolean;
    public_test_count: number;
    hidden_test_count: number;
  };
}

export const codingAdminApi = {
  async parseDjangoArchive(file: File): Promise<ParsedDjangoArchiveDTO> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('as_access_token') || localStorage.getItem('access_token')
        : null;
    const csrf = getCookie('csrftoken');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/apps/skiltrix/api/assessments/coding/admin/problems/parse-django-archive/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Admin-Portal': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: formData,
    });
    const text = await res.text();
    const payload = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(payload?.detail || payload?.error || `HTTP ${res.status}`);
    }
    return payload as ParsedDjangoArchiveDTO;
  },

  async listProblems(): Promise<{
    problems: AdminCodingProblemDTO[];
    default_starter_codes: Record<string, string>;
    default_django_project?: {
      project_files: Record<string, string>;
      hidden_test_files: Record<string, string>;
    };
  }> {
    return adminRequest('/admin/problems/');
  },

  async createProblem(payload: Partial<AdminCodingProblemDTO>): Promise<AdminCodingProblemDTO> {
    return adminRequest('/admin/problems/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProblem(
    problemId: string,
    payload: Partial<AdminCodingProblemDTO>
  ): Promise<AdminCodingProblemDTO> {
    return adminRequest(`/admin/problems/${problemId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteProblem(problemId: string): Promise<void> {
    await adminRequest(`/admin/problems/${problemId}/`, { method: 'DELETE' });
  },

  async listAssessments(): Promise<{ assessments: AdminAssessmentDTO[] }> {
    return adminRequest('/admin/assessments/');
  },

  async getAssessment(assessmentId: string): Promise<AdminAssessmentDTO> {
    return adminRequest(`/admin/assessments/${assessmentId}/`);
  },

  async createAssessment(payload: Record<string, unknown>): Promise<AdminAssessmentDTO> {
    return adminRequest('/admin/assessments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAssessment(
    assessmentId: string,
    payload: Record<string, unknown>
  ): Promise<AdminAssessmentDTO> {
    return adminRequest(`/admin/assessments/${assessmentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteAssessment(assessmentId: string): Promise<void> {
    await adminRequest(`/admin/assessments/${assessmentId}/`, { method: 'DELETE' });
  },

  async listBatches(): Promise<{ batches: StudentBatchDTO[] }> {
    return adminRequest('/admin/batches/');
  },

  async createBatch(payload: {
    name: string;
    description?: string;
    student_ids?: string[];
  }): Promise<StudentBatchDTO> {
    return adminRequest('/admin/batches/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBatch(
    batchId: string,
    payload: {
      name?: string;
      description?: string;
      student_ids?: string[];
      is_active?: boolean;
    }
  ): Promise<StudentBatchDTO> {
    return adminRequest(`/admin/batches/${batchId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteBatch(batchId: string): Promise<void> {
    await adminRequest(`/admin/batches/${batchId}/`, { method: 'DELETE' });
  },

  async searchStudents(search = ''): Promise<{
    students: Array<{ user_id: string; username: string; full_name: string; email: string }>;
  }> {
    return adminRequest(`/admin/students/?search=${encodeURIComponent(search)}`);
  },

  async listAssignments(
    assessmentId: string
  ): Promise<{ assignment_mode: string; assignments: AssessmentAssignmentDTO[] }> {
    return adminRequest(`/admin/assessments/${assessmentId}/assignments/`);
  },

  async createAssignments(
    assessmentId: string,
    payload: {
      student_ids?: string[];
      batch_ids?: string[];
      start_time?: string | null;
      end_time?: string | null;
    }
  ): Promise<{ assignments: AssessmentAssignmentDTO[] }> {
    return adminRequest(`/admin/assessments/${assessmentId}/assignments/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteAssignment(assessmentId: string, assignmentId: string): Promise<void> {
    await adminRequest(`/admin/assessments/${assessmentId}/assignments/${assignmentId}/`, {
      method: 'DELETE',
    });
  },

  async getAnalytics(assessmentId: string): Promise<AdminAssessmentAnalyticsDTO> {
    return adminRequest(`/admin/assessments/${assessmentId}/analytics/`);
  },

  async getAllSubmissions(): Promise<AdminGlobalSubmissionsDTO> {
    return adminRequest('/admin/submissions/');
  },

  async releaseResults(assessmentId: string): Promise<{ released_attempts: number }> {
    return adminRequest(`/admin/assessments/${assessmentId}/release-results/`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async downloadExport(assessmentId: string, format: 'csv' | 'json' = 'csv'): Promise<void> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('as_access_token') || localStorage.getItem('access_token')
        : null;
    const res = await fetch(
      `${API_BASE}/apps/skiltrix/api/assessments/coding/admin/assessments/${assessmentId}/export/?export_format=${format}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Export failed (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${assessmentId}-results.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
