import {
  User,
  Blueprint,
  BlueprintCategory,
  Language,
  LogEntry,
  TableInfo,
  Internship,
  Company,
  Course,
  Video,
  Submission
} from '../types';
import {
  initialUsers,
  initialBlueprints,
  initialCategories,
  initialLanguages,
  initialLogs,
  initialInternships,
  initialCompanies,
  initialCourses,
  initialVideos,
  initialSubmissions
} from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Generic fetch wrapper with timeout, JSON parsing, and error safety.
 */
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    if (res.status === 204) {
      return (fallbackData !== undefined ? fallbackData : (true as any)) as T;
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data as T;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${url}, using resilient data fallback:`, err);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  /**
   * Health / Connectivity check
   */
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats/`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Dashboard Live KPI Statistics
   */
  async getDashboardStats() {
    return fetchWithFallback(
      '/api/admin/stats/',
      { method: 'GET' },
      {
        status: true,
        stats: {
          total_blueprints: 111,
          approved_blueprints: 110,
          total_categories: 13,
          total_users: 17,
          total_views: 31,
          total_downloads: 6,
          total_likes: 2,
          total_shares: 0,
          total_activities: 1851,
          total_errors: 260
        },
        recent_activities: []
      }
    );
  },

  /**
   * User Management APIs
   */
  async getUsers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const result = await fetchWithFallback<{ status: boolean; total: number; users: User[] }>(
      `/api/admin/users/?${query.toString()}`,
      { method: 'GET' },
      { status: true, total: initialUsers.length, users: initialUsers }
    );

    return result.users || initialUsers;
  },

  async createUser(userData: { name: string; email: string; type?: string; platform?: string; status?: string }) {
    return fetchWithFallback(
      '/api/admin/users/',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      },
      { status: true, message: 'User created' }
    );
  },

  async updateUser(userId: number | string, data: Partial<User>) {
    return fetchWithFallback(
      `/api/admin/users/${userId}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      { status: true, message: 'User updated' }
    );
  },

  async deleteUser(userId: number | string) {
    return fetchWithFallback(
      `/api/admin/users/${userId}/`,
      { method: 'DELETE' },
      { status: true, message: 'User deleted' }
    );
  },

  /**
   * SFS Blueprints APIs
   */
  async getBlueprints(params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const result = await fetchWithFallback<{ status: boolean; total: number; blueprints: Blueprint[] }>(
      `/api/admin/blueprints/?${query.toString()}`,
      { method: 'GET' },
      { status: true, total: initialBlueprints.length, blueprints: initialBlueprints }
    );

    return result.blueprints || initialBlueprints;
  },

  async getBlueprint(bpId: string): Promise<Blueprint | null> {
    const result = await fetchWithFallback<{ status: boolean; blueprint?: Blueprint }>(
      `/api/admin/blueprints/${bpId}/`,
      { method: 'GET' },
      {
        status: true,
        blueprint: initialBlueprints.find(b => b.bp_id === bpId) || initialBlueprints[0]
      }
    );
    return result.blueprint || null;
  },

  async updateBlueprint(bpId: string, data: Partial<Blueprint>) {
    return fetchWithFallback(
      `/api/admin/blueprints/${bpId}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      { status: true, message: 'Blueprint updated' }
    );
  },

  async deleteBlueprint(bpId: string) {
    return fetchWithFallback(
      `/api/admin/blueprints/${bpId}/`,
      { method: 'DELETE' },
      { status: true, message: 'Blueprint deleted' }
    );
  },

  /**
   * SFS Categories APIs
   */
  async getCategories() {
    const result = await fetchWithFallback<{ status: boolean; categories: BlueprintCategory[] }>(
      '/api/admin/categories/',
      { method: 'GET' },
      { status: true, categories: initialCategories }
    );
    return result.categories || initialCategories;
  },

  async createCategory(data: { name: string; description: string; image?: string }) {
    return fetchWithFallback(
      '/api/admin/categories/',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      { status: true, message: 'Category created' }
    );
  },

  /**
   * Logs & Activity Audit APIs
   */
  async getLogs(params?: { type?: 'all' | 'errors' | 'total' | string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const result = await fetchWithFallback<{ status: boolean; total: number; logs: LogEntry[] }>(
      `/api/admin/logs/?${query.toString()}`,
      { method: 'GET' },
      { status: true, total: initialLogs.length, logs: initialLogs }
    );

    return result.logs || initialLogs;
  },

  /**
   * Database Inspector APIs
   */
  async getDatabaseTables() {
    return fetchWithFallback<{ status: boolean; database_name: string; tables_count: number; tables: TableInfo[] }>(
      '/api/admin/database/tables/',
      { method: 'GET' },
      {
        status: true,
        database_name: 'as_main',
        tables_count: 84,
        tables: [
          { table_name: 'sfs_bp', rows_count: 111 },
          { table_name: 'sfs_bp_cat', rows_count: 13 },
          { table_name: 'all_users', rows_count: 17 },
          { table_name: 'total_activity', rows_count: 1851 },
          { table_name: 'allerrors', rows_count: 260 },
          { table_name: 'trains', rows_count: 222 },
          { table_name: 'languages', rows_count: 23 }
        ]
      }
    );
  },

  /**
   * SkilTrix Programming Languages API
   */
  async getLanguages(): Promise<Language[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/languages/',
      { method: 'GET' },
      initialLanguages
    );

    return (result || []).map((l: any) => ({
      language_id: l.language_id || String(l.id || ''),
      name: l.name || '',
      created_by: 'SkilTrix Engine',
      status: (l.status || 'active') as 'active' | 'inactive',
      created_at: l.created_at ? l.created_at.split('T')[0] : '2026-01-01'
    }));
  },

  async createLanguage(data: { name: string; status?: 'active' | 'inactive'; language_id?: string }): Promise<Language> {
    return fetchWithFallback<Language>(
      '/apps/skiltrix/api/languages/',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      {
        language_id: data.language_id || `lang_${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: data.name,
        created_by: 'Admin',
        status: data.status || 'active',
        created_at: new Date().toISOString().split('T')[0]
      }
    );
  },

  async deleteLanguage(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/languages/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * Transport Hub Trains API
   */
  async getTransportHubRoutes() {
    return fetchWithFallback<{ status: boolean; trains: any[] }>(
      '/api/admin/transport_hub/',
      { method: 'GET' },
      { status: true, trains: [] }
    );
  },

  /**
   * SkilTrix Internships APIs
   */
  async getInternships(): Promise<Internship[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/internships/',
      { method: 'GET' },
      initialInternships
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(i => ({
        internship_id: i.internship_id || String(i.id),
        name: i.name || 'Software Engineering Internship',
        company_id: i.company?.company_id || i.company_id || 'COMP_01',
        company: {
          name: i.company?.name || 'Ascentracore Solutions',
          image: i.company?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'
        },
        type: (i.type || 'remote') as 'remote' | 'offline' | 'hybrid',
        paid: i.is_paid ? 1 : 0,
        price: i.price || 0,
        location: i.location || 'Remote',
        apply_link: i.apply_link || '#',
        description: i.description || 'Full-stack engineering role',
        deadline: i.deadline || '2026-12-31',
        status: (i.status || 'active') as 'active' | 'inactive',
        created_at: i.created_at ? i.created_at.split('T')[0] : '2026-10-01'
      }));
    }
    return initialInternships;
  },

  async createInternship(data: any): Promise<Internship> {
    const payload = {
      name: data.name,
      company_id: data.company_id,
      type: data.type || 'remote',
      is_paid: Boolean(data.paid),
      price: data.paid ? Number(data.price || 0) : 0,
      location: data.location || 'Remote',
      apply_link: data.apply_link || '#',
      description: data.description || '',
      deadline: data.deadline || '2026-12-31',
      status: data.status || 'active'
    };

    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/internships/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      null
    );

    if (res && res.internship_id) {
      return {
        internship_id: res.internship_id,
        name: res.name,
        company_id: res.company?.company_id || data.company_id,
        company: {
          name: res.company?.name || data.company?.name || 'Partner Company',
          image: res.company?.image || data.company?.image || '/as_logo.webp'
        },
        type: res.type,
        paid: res.is_paid ? 1 : 0,
        price: res.price,
        location: res.location,
        apply_link: res.apply_link,
        description: res.description,
        deadline: res.deadline,
        status: res.status,
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }

    return {
      internship_id: `intern_${Date.now()}`,
      name: data.name,
      company_id: data.company_id,
      company: data.company || { name: 'Partner Company', image: '/as_logo.webp' },
      type: data.type,
      paid: data.paid,
      price: data.price,
      location: data.location,
      apply_link: data.apply_link,
      description: data.description,
      deadline: data.deadline,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
  },

  async updateInternship(id: string, data: Partial<Internship>): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/internships/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      true
    );
  },

  async deleteInternship(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/internships/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * SkilTrix Companies APIs
   */
  async getCompanies(): Promise<Company[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/companies/',
      { method: 'GET' },
      initialCompanies
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(c => ({
        company_id: c.company_id || String(c.id),
        name: c.name,
        image: c.image && c.image.startsWith('http')
          ? c.image
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
        description: c.description || '',
        status: (c.status || 'active') as 'active' | 'inactive',
        created_at: c.created_at ? c.created_at.split('T')[0] : '2026-10-01',
        internships_count: c.roadmaps ? c.roadmaps.length : 1
      }));
    }
    return initialCompanies;
  },

  async createCompany(data: { name: string; description?: string; image?: string; status?: 'active' | 'inactive' }): Promise<Company> {
    const payload = {
      name: data.name,
      description: data.description || '',
      image: (data.image || 'partner_logo.webp').slice(0, 50),
      status: data.status || 'active'
    };

    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/companies/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      null
    );

    if (res && res.company_id) {
      return {
        company_id: res.company_id,
        name: res.name,
        image: data.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
        description: res.description,
        status: res.status,
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        internships_count: 1
      };
    }

    return {
      company_id: `comp_${Date.now()}`,
      name: data.name,
      image: data.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      description: data.description || '',
      status: data.status || 'active',
      created_at: new Date().toISOString().split('T')[0],
      internships_count: 1
    };
  },

  async deleteCompany(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/companies/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * SkilTrix Courses APIs
   */
  async getCourses(): Promise<Course[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/courses/',
      { method: 'GET' },
      initialCourses
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(c => ({
        course_id: c.course_id || String(c.id),
        name: c.name || 'Full Stack Engineering',
        image: c.image && c.image.startsWith('http')
          ? c.image
          : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        type: (c.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        paid: c.is_paid ? 1 : 0,
        price: c.price,
        description: c.description || 'Comprehensive curriculum with industry hands-on projects',
        status: (c.status || 'active') as 'active' | 'inactive',
        created_at: c.created_at ? c.created_at.split('T')[0] : '2026-10-01'
      }));
    }
    return initialCourses;
  },

  async createCourse(data: { name: string; type?: string; price?: number; paid?: 0 | 1; description?: string; image?: string }): Promise<Course> {
    const payload = {
      name: data.name,
      type: data.type || 'beginner',
      is_paid: Boolean(data.paid),
      price: data.paid ? Number(data.price || 0) : 0,
      description: data.description || '',
      image: (data.image || 'course_thumb.webp').slice(0, 50),
      status: 'active'
    };

    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/courses/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      null
    );

    if (res && res.course_id) {
      return {
        course_id: res.course_id,
        name: res.name,
        image: data.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        type: (res.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        paid: res.is_paid ? 1 : 0,
        price: res.price,
        description: data.description || '',
        status: res.status || 'active',
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }

    return {
      course_id: `crs_${Date.now()}`,
      name: data.name,
      image: data.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
      type: (data.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      paid: data.paid || 0,
      price: data.price,
      description: data.description || '',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
  },

  async deleteCourse(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/courses/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * SkilTrix Lecture Videos APIs
   */
  async getVideos(): Promise<Video[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/videos/',
      { method: 'GET' },
      initialVideos
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(v => ({
        video_id: v.video_id || String(v.id),
        title: v.title,
        image: v.image && v.image.startsWith('http')
          ? v.image
          : 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        video_url: v.video || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        course_id: v.course || 'crs_django',
        course_name: v.course_name || 'Technical Curriculum',
        description: v.description || '',
        status: (v.status || 'active') as 'active' | 'inactive',
        created_at: v.created_at ? v.created_at.split('T')[0] : '2026-10-01'
      }));
    }
    return initialVideos;
  },

  async createVideo(data: { title: string; description?: string; image?: string; course_id?: string }): Promise<Video> {
    const payload = {
      title: data.title,
      description: data.description || '',
      image: (data.image || 'video_thumb.webp').slice(0, 50),
      course_id: data.course_id
    };

    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/videos/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      null
    );

    if (res && res.video_id) {
      return {
        video_id: res.video_id,
        title: res.title,
        image: data.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        video_url: res.video || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        course_id: res.course || data.course_id || 'crs_django',
        course_name: res.course_name || 'Technical Curriculum',
        description: res.description,
        status: res.status || 'active',
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }

    return {
      video_id: `vid_${Date.now()}`,
      title: data.title,
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      course_id: data.course_id || 'crs_django',
      course_name: 'Technical Curriculum',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
  },

  async deleteVideo(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/videos/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * SkilTrix Code Submissions APIs
   */
  async getSubmissions(): Promise<Submission[]> {
    const result = await fetchWithFallback<any[]>(
      '/apps/skiltrix/api/submissions/',
      { method: 'GET' },
      initialSubmissions
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(s => {
        const rawStatus = (s.status || '').toLowerCase();
        let status: 'pending' | 'approved' | 'rejected' = 'pending';
        if (rawStatus === 'accepted') status = 'approved';
        else if (rawStatus === 'wrong answer' || rawStatus === 'rejected') status = 'rejected';

        return {
          id: s.submission_id || String(s.id),
          student_name: s.user_name || 'Ascentracore Student',
          task_title: s.problem_title || 'Engineering Task Assignment',
          program: s.language ? `${s.language} Track` : 'Full Stack Track',
          github_link: 'https://github.com/ascentracore/solutions',
          submitted_at: s.created_at ? s.created_at.replace('T', ' ').slice(0, 16) : '2026-10-01 12:00',
          score: s.score !== undefined ? s.score : null,
          status,
          language: s.language,
          code: s.code
        };
      });
    }
    return initialSubmissions;
  },

  async updateSubmissionStatus(id: string, status: 'approved' | 'rejected' | 'pending', score?: number): Promise<boolean> {
    const backendStatus = status === 'approved' ? 'Accepted' : status === 'rejected' ? 'Wrong Answer' : 'Pending';
    const payload: any = { status: backendStatus };
    if (score !== undefined) {
      payload.score = score;
    }

    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/submissions/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      },
      true
    );
  },

  async deleteSubmission(id: string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/submissions/${id}/`,
      { method: 'DELETE' },
      true
    );
  },

  /**
   * SkilTrix Global Counts and Health
   */
  async getSkiltrixStats() {
    try {
      const [internships, courses, companies, langs, videos, submissions] = await Promise.all([
        this.getInternships(),
        this.getCourses(),
        this.getCompanies(),
        this.getLanguages(),
        this.getVideos(),
        this.getSubmissions()
      ]);

      return {
        internships: internships.length,
        courses: courses.length,
        companies: companies.length,
        languages: langs.length,
        videos: videos.length,
        submissions: submissions.length
      };
    } catch {
      return {
        internships: initialInternships.length,
        courses: initialCourses.length,
        companies: initialCompanies.length,
        languages: initialLanguages.length,
        videos: initialVideos.length,
        submissions: initialSubmissions.length
      };
    }
  }
};
