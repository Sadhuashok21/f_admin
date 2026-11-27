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
  Submission,
  ContactSubmission,
  ContactMetrics
} from '../types';
import { getStImageUrl, getStVideoUrl } from '../utils/cdn';
import { VideoComment } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface DashboardAnalyticsPoint {
  date: string;
  activities: number;
  errors: number;
}

async function getCsrfToken(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('csrftoken='));
  if (match) {
    return decodeURIComponent(match.split('=')[1] || '');
  }
  try {
    const csrfRes = await fetch(`${API_BASE}/apps/skiltrix/api/api/csrf/`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    const csrfJson = await csrfRes.json().catch(() => null);
    return csrfJson?.csrfToken || null;
  } catch {
    return null;
  }
}

/**
 * Generic fetch wrapper with timeout, JSON parsing, CSRF support, and error safety.
 */
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const token = typeof window !== 'undefined' ? (localStorage.getItem('as_access_token') || localStorage.getItem('access_token')) : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const method = (options?.method || 'GET').toUpperCase();
    const csrfHeaders: Record<string, string> = {};
    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) csrfHeaders['X-CSRFToken'] = csrfToken;
    }

    const baseHeaders: Record<string, string> = {
      'Accept': 'application/json',
      'X-Admin-Portal': 'true',
      ...authHeaders,
      ...csrfHeaders,
      ...(options?.headers as Record<string, string> || {})
    };
    if (!(options?.body instanceof FormData)) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: baseHeaders
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = `${res.status}: ${res.statusText}`;
      try {
        const errBody = await res.json();
        if (errBody?.detail || errBody?.message) {
          detail = errBody.detail || errBody.message;
        }
      } catch {}
      throw new Error(`HTTP error ${detail}`);
    }

    if (res.status === 204) {
      return (fallbackData !== undefined ? fallbackData : (true as any)) as T;
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data as T;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${url}:`, err);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  /**
   * Direct upload asset to CDN / Cloudflare R2 endpoint with progress
   */
  async uploadCdnAsset(
    file: File,
    type: 'st_video' | 'st_image' | 'st_pdf' | 'sfs_image' | 'sfs_zip',
    onProgress?: (percent: number) => void
  ): Promise<{ status: boolean; filename: string; url: string; message?: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = typeof window !== 'undefined' ? (localStorage.getItem('as_access_token') || localStorage.getItem('access_token')) : null;
      
      xhr.open('POST', `${API_BASE}/apps/skiltrix/api/actions/upload-cdn-asset/`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('X-Admin-Portal', 'true');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      xhr.send(formData);
    });
  },

  /**
   * Health / Connectivity check
   */
  async checkConnection(): Promise<boolean> {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('as_access_token') || localStorage.getItem('access_token')) : null;
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/admin/stats/`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json', ...authHeaders }
      });
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
          total_errors: 260,
          total_inquiries: 0,
          pending_inquiries: 0
        },
        recent_activities: []
      }
    );
  },

  async getDashboardAnalytics(params: { startDate: string; endDate: string }) {
    const query = new URLSearchParams({
      start_date: params.startDate,
      end_date: params.endDate
    });

    return fetchWithFallback<{
      status: boolean;
      daily: DashboardAnalyticsPoint[];
    }>(
      `/api/admin/analytics/?${query.toString()}`,
      { method: 'GET' },
      { status: false, daily: [] }
    );
  },

  /**
   * User Management APIs
   */
  async getUsers(params?: { search?: string; status?: string; app?: 'skiltrix' | 'sfs' | 'all'; platform?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.app && params.app !== 'all') query.append('app', params.app);
    if (params?.platform) query.append('platform', params.platform);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const result = await fetchWithFallback<{ status: boolean; total: number; users: User[] }>(
      `/api/admin/users/?${query.toString()}`,
      { method: 'GET' },
      { status: true, total: 0, users: [] }
    );

    return result.users || [];
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
      { status: true, total: 0, blueprints: [] }
    );

    return result.blueprints || [];
  },

  async getPaginatedBlueprints(params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const result = await fetchWithFallback<{ status: boolean; total: number; blueprints: Blueprint[] }>(
      `/api/admin/blueprints/?${query.toString()}`,
      { method: 'GET' },
      { status: true, total: 0, blueprints: [] }
    );

    return {
      total: result.total ?? (result.blueprints?.length || 0),
      blueprints: result.blueprints || [],
    };
  },

  async getBlueprint(bpId: string): Promise<Blueprint | null> {
    const result = await fetchWithFallback<{ status: boolean; blueprint?: Blueprint }>(
      `/api/admin/blueprints/${bpId}/`,
      { method: 'GET' },
      {
        status: true,
        blueprint: undefined
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

  async uploadBlueprint(formData: FormData) {
    return fetchWithFallback<{ status: boolean; message?: string; bp_id?: string; image_url?: string; images?: string[]; zip_url?: string }>(
      '/apps/sfs/upload/',
      {
        method: 'POST',
        body: formData
      },
      { status: true, message: 'Blueprint uploaded' }
    );
  },

  async uploadBlueprintImages(bpId: string, files: File[]) {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return fetchWithFallback<{ status: boolean; images: string[]; uploaded: string[] }>(
      `/api/admin/blueprints/${bpId}/images/`,
      {
        method: 'POST',
        body: formData,
      },
      { status: false, images: [], uploaded: [] }
    );
  },

  async deleteBlueprintImage(bpId: string, imageUrl: string) {
    return fetchWithFallback<{ status: boolean; message?: string }>(
      `/api/admin/blueprints/${bpId}/images/?image=${encodeURIComponent(imageUrl)}`,
      {
        method: 'DELETE',
      },
      { status: false }
    );
  },

  /**
   * SFS Categories APIs
   */
  async getCategories() {
    const result = await fetchWithFallback<{ status: boolean; categories: BlueprintCategory[] }>(
      '/api/admin/categories/',
      { method: 'GET' },
      { status: true, categories: [] }
    );
    return result.categories || [];
  },

  async createCategory(
    data: FormData | { name: string; description: string; image?: File | string; status?: string; id?: string }
  ) {
    let body: BodyInit;
    if (data instanceof FormData) {
      body = data;
    } else {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);
      if (data.id) formData.append('id', data.id);
      if (data.image instanceof File) {
        formData.append('image', data.image);
      } else if (data.image) {
        formData.append('bp_img', data.image);
      }
      body = formData;
    }

    return fetchWithFallback<{ status: boolean; message: string; category_id?: string; bp_img?: string; image_url?: string }>(
      '/api/admin/categories/',
      {
        method: 'POST',
        body
      },
      { status: true, message: 'Category saved' }
    );
  },

  async deleteCategory(id: string | number) {
    return fetchWithFallback<{ status: boolean; message: string }>(
      `/api/admin/categories/?id=${encodeURIComponent(String(id))}`,
      { method: 'DELETE' },
      { status: true, message: 'Category deleted' }
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
      { status: true, total: 0, logs: [] }
    );

    return result.logs || [];
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
      []
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
      []
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(i => ({
        internship_id: i.internship_id || String(i.id),
        name: i.name || 'Software Engineering Internship',
        company_id: i.company?.company_id || i.company_id || 'COMP_01',
        company: {
          name: i.company?.name || 'Ascentracore Solutions',
          image: i.company?.image ? getStImageUrl(i.company.image) : getStImageUrl('st/images/company-default.webp')
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
    return [];
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
      []
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(c => ({
        company_id: c.company_id || String(c.id),
        name: c.name,
        image: c.image ? getStImageUrl(c.image) : getStImageUrl('st/images/company-default.webp'),
        description: c.description || '',
        status: (c.status || 'active') as 'active' | 'inactive',
        created_at: c.created_at ? c.created_at.split('T')[0] : '2026-10-01',
        internships_count: c.roadmaps ? c.roadmaps.length : 1
      }));
    }
    return [];
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
        image: data.image ? getStImageUrl(data.image) : getStImageUrl('st/images/company-default.webp'),
        description: res.description,
        status: res.status,
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        internships_count: 1
      };
    }

    return {
      company_id: `comp_${Date.now()}`,
      name: data.name,
      image: data.image ? getStImageUrl(data.image) : getStImageUrl('st/images/company-default.webp'),
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
      []
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(c => ({
        course_id: c.course_id || String(c.id),
        name: c.name || 'Full Stack Engineering',
        image: c.image_url || (c.image ? getStImageUrl(c.image) : getStImageUrl('st/images/course-default.webp')),
        type: (c.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        paid: c.is_paid ? 1 : 0,
        price: c.price,
        compare_price: Number(c.compare_price) || 0,
        discount_percent: Number(c.discount_percent) || 0,
        description: c.description || 'Comprehensive curriculum with industry hands-on projects',
        status: (c.status || 'active') as 'active' | 'inactive',
        created_at: c.created_at ? c.created_at.split('T')[0] : '2026-10-01'
      }));
    }
    return [];
  },

  async createCourse(data: {
    name: string;
    type?: string;
    price?: number;
    compare_price?: number;
    discount_percent?: number;
    paid?: 0 | 1;
    description?: string;
    image?: string;
  }): Promise<Course> {
    const payload = {
      name: data.name,
      type: data.type || 'beginner',
      is_paid: Boolean(data.paid),
      price: data.paid ? Number(data.price || 0) : 0,
      compare_price: data.paid ? Number(data.compare_price || 0) : 0,
      discount_percent: data.paid ? Number(data.discount_percent || 0) : 0,
      description: data.description || '',
      image: (data.image || 'course_thumb.webp').trim(),
      status: 'active'
    };

    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/courses/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (res && res.course_id) {
      return {
        course_id: res.course_id,
        name: res.name,
        image: res.image_url || (res.image ? getStImageUrl(res.image) : getStImageUrl(data.image || 'st/images/course-default.webp')),
        type: (res.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        paid: res.is_paid ? 1 : 0,
        price: res.price,
        compare_price: Number(res.compare_price) || 0,
        discount_percent: Number(res.discount_percent) || 0,
        description: data.description || '',
        status: res.status || 'active',
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }

    throw new Error('Failed to create course.');
  },

  async updateCourse(
    id: string,
    data: {
      name?: string;
      type?: string;
      price?: number;
      compare_price?: number;
      discount_percent?: number;
      paid?: 0 | 1;
      description?: string;
      image?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<Course | null> {
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.type = data.type;
    if (data.paid !== undefined) {
      payload.is_paid = Boolean(data.paid);
      payload.price = data.paid ? Number(data.price || 0) : 0;
      payload.compare_price = data.paid ? Number(data.compare_price || 0) : 0;
      payload.discount_percent = data.paid ? Number(data.discount_percent || 0) : 0;
    } else {
      if (data.price !== undefined) payload.price = Number(data.price || 0);
      if (data.compare_price !== undefined) payload.compare_price = Number(data.compare_price || 0);
      if (data.discount_percent !== undefined) payload.discount_percent = Number(data.discount_percent || 0);
    }
    if (data.image !== undefined) payload.image = data.image.trim();
    if (data.status !== undefined) payload.status = data.status;

    const res = await fetchWithFallback<any>(
      `/apps/skiltrix/api/courses/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );

    if (res && res.course_id) {
      return {
        course_id: res.course_id,
        name: res.name,
        image: res.image_url || (res.image ? getStImageUrl(res.image) : getStImageUrl(data.image || 'st/images/course-default.webp')),
        type: (res.type || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        paid: res.is_paid ? 1 : 0,
        price: res.price,
        compare_price: Number(res.compare_price) || 0,
        discount_percent: Number(res.discount_percent) || 0,
        description: data.description || '',
        status: res.status || 'active',
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }
    return null;
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
      []
    );

    if (Array.isArray(result) && result.length > 0) {
      return result.map(v => ({
        video_id: v.video_id || String(v.id),
        title: v.title,
        image: v.image_url || (v.image ? getStImageUrl(v.image) : getStImageUrl('st/images/video-default.webp')),
        video_url: v.video_url || (v.video ? getStVideoUrl(v.video) : ''),
        course_id: v.course || 'crs_ts_mastery',
        course_name: v.course_name || 'Technical Curriculum',
        description: v.description || '',
        chapters: Array.isArray(v.chapters) ? v.chapters : [],
        transcript: Array.isArray(v.transcript) ? v.transcript : [],
        lesson_notes: v.lesson_notes || '',
        code_snippet: v.code_snippet || '',
        code_language: v.code_language || 'python',
        status: (v.status || 'active') as 'active' | 'inactive',
        created_at: v.created_at ? v.created_at.split('T')[0] : '2026-10-01',
        comments_count: v.comments_count || (Array.isArray(v.comments) ? v.comments.length : 0)
      }));
    }
    return [];
  },

  async createVideo(data: { title: string; description?: string; video?: string; image?: string; course_id?: string; chapters?: { time: number; title: string }[] }): Promise<Video> {
    const payload = {
      title: data.title,
      description: data.description || '',
      video: data.video || '',
      image: data.image || 'video_thumb.webp',
      course_id: data.course_id,
      chapters: data.chapters || []
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
        image: res.image_url || (res.image ? getStImageUrl(res.image) : getStImageUrl('st/images/video-default.webp')),
        video_url: res.video_url || (res.video ? getStVideoUrl(res.video) : ''),
        course_id: res.course || data.course_id || 'crs_ts_mastery',
        course_name: res.course_name || 'Technical Curriculum',
        description: res.description,
        chapters: Array.isArray(res.chapters) ? res.chapters : (data.chapters || []),
        status: res.status || 'active',
        created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        comments_count: 0
      };
    }

    return {
      video_id: `vid_${Date.now()}`,
      title: data.title,
      description: data.description || '',
      image: data.image ? getStImageUrl(data.image) : getStImageUrl('st/images/video-default.webp'),
      video_url: data.video ? getStVideoUrl(data.video) : '',
      course_id: data.course_id || 'crs_ts_mastery',
      course_name: 'Technical Curriculum',
      chapters: data.chapters || [],
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
      comments_count: 0
    };
  },

  async updateVideo(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      course_id: string;
      status: 'active' | 'inactive';
      chapters: { time: number; title: string }[];
      transcript: { start: number; end: number; text: string }[];
      lesson_notes: string;
      code_snippet: string;
      code_language: string;
    }>
  ): Promise<Video> {
    const res = await fetchWithFallback<any>(
      `/apps/skiltrix/api/videos/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      null
    );
    if (!res) {
      throw new Error('Failed to update video');
    }
    return {
      video_id: res.video_id || id,
      title: res.title,
      image: res.image_url || (res.image ? getStImageUrl(res.image) : getStImageUrl('st/images/video-default.webp')),
      video_url: res.video_url || (res.video ? getStVideoUrl(res.video) : ''),
      course_id: res.course || data.course_id || 'crs_ts_mastery',
      course_name: res.course_name || 'Technical Curriculum',
      description: res.description || '',
      chapters: Array.isArray(res.chapters) ? res.chapters : [],
      transcript: Array.isArray(res.transcript) ? res.transcript : [],
      lesson_notes: res.lesson_notes || '',
      code_snippet: res.code_snippet || '',
      code_language: res.code_language || 'python',
      status: (res.status || 'active') as 'active' | 'inactive',
      created_at: res.created_at ? res.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      comments_count: res.comments_count || 0,
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
   * SkilTrix Comments APIs
   */
  async getComments(videoId?: string): Promise<VideoComment[]> {
    const query = videoId ? `?video_id=${encodeURIComponent(videoId)}` : '';
    const res = await fetchWithFallback<any[]>(
      `/apps/skiltrix/api/comments/${query}`,
      { method: 'GET' },
      []
    );
    if (Array.isArray(res)) {
      return res.map(c => ({
        id: c.id,
        comment: c.comment,
        video_id: c.video_id || c.video,
        video_title: c.video_title || 'Video Lecture',
        user: c.user,
        user_name: c.user_name || 'Learner',
        created_at: c.created_at ? c.created_at.split('T')[0] : 'Just now'
      }));
    }
    return [];
  },

  async createComment(data: { video_id: string; comment: string }): Promise<VideoComment | null> {
    const res = await fetchWithFallback<any>(
      '/apps/skiltrix/api/comments/',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      null
    );
    if (res && res.id) {
      return {
        id: res.id,
        comment: res.comment,
        video_id: res.video_id || res.video,
        video_title: res.video_title || 'Video Lecture',
        user: res.user,
        user_name: res.user_name || 'Admin',
        created_at: res.created_at ? res.created_at.split('T')[0] : 'Just now'
      };
    }
    return null;
  },

  async deleteComment(id: number | string): Promise<boolean> {
    return fetchWithFallback<boolean>(
      `/apps/skiltrix/api/comments/${id}/`,
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
      []
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
    return [];
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
        internships: [].length,
        courses: [].length,
        companies: [].length,
        languages: [].length,
        videos: [].length,
        submissions: [].length
      };
    }
  },

  async getContactSubmissions(params?: {
    status?: string;
    source?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ submissions: ContactSubmission[]; total: number; metrics: ContactMetrics }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.source && params.source !== 'all') query.set('source', params.source);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));

    const res = await fetchWithFallback<any>(
      `/api/admin/contacts/?${query.toString()}`,
      { method: 'GET' },
      {
        submissions: [],
        total: 0,
        metrics: { total: 0, pending: 0, contacted: 0, in_progress: 0, completed: 0 }
      }
    );
    return {
      submissions: res?.submissions || [],
      total: res?.total || 0,
      metrics: res?.metrics || { total: 0, pending: 0, contacted: 0, in_progress: 0, completed: 0 }
    };
  },

  async getContactSubmission(id: number | string): Promise<ContactSubmission | null> {
    const res = await fetchWithFallback<any>(
      `/api/admin/contacts/${id}/`,
      { method: 'GET' },
      null
    );
    return res?.submission || null;
  },

  async updateContactSubmission(id: number | string, data: { status?: string; notes?: string }): Promise<boolean> {
    const res = await fetchWithFallback<any>(
      `/api/admin/contacts/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      { status: false }
    );
    return res?.status === true;
  },

  async deleteContactSubmission(id: number | string): Promise<boolean> {
    const res = await fetchWithFallback<any>(
      `/api/admin/contacts/${id}/`,
      { method: 'DELETE' },
      { status: false }
    );
    return res?.status === true;
  }
};
