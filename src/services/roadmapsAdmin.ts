const API_BASE = import.meta.env.VITE_API_URL || '';

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

async function adminRoadmapRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  const res = await fetch(`${API_BASE}/apps/skiltrix/api/admin/roadmaps${path}`, {
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
    throw new Error(payload?.detail || payload?.message || payload?.error || `HTTP ${res.status}`);
  }
  return payload as T;
}

export interface AdminRoadmapStageDTO {
  stage_number: number;
  badge_text: string;
  title: string;
  description: string;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: string;
  tutorial_link: string;
  practice_link: string;
  topics: string[];
}

export interface AdminRoadmapDTO {
  key: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  icon: string;
  accent_color: string;
  estimated_weeks: string;
  order: number;
  is_active: boolean;
  stages: AdminRoadmapStageDTO[];
  total_stages?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export const roadmapsAdminApi = {
  async listRoadmaps(): Promise<{ roadmaps: AdminRoadmapDTO[] }> {
    return adminRoadmapRequest('/');
  },

  async createRoadmap(payload: Partial<AdminRoadmapDTO>): Promise<AdminRoadmapDTO> {
    return adminRoadmapRequest('/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRoadmap(key: string, payload: Partial<AdminRoadmapDTO>): Promise<AdminRoadmapDTO> {
    return adminRoadmapRequest(`/${encodeURIComponent(key)}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteRoadmap(key: string): Promise<{ deleted?: boolean }> {
    return adminRoadmapRequest(`/${encodeURIComponent(key)}/`, {
      method: 'DELETE',
    });
  },
};
