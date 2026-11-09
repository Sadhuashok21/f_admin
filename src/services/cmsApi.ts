import { CmsCourse, CmsPage, CmsMedia, CmsNavNode } from '../types/cms';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('as_access_token') || localStorage.getItem('access_token')
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const cmsApi = {
  // Courses
  async getCourses(): Promise<CmsCourse[]> {
    const res = await fetch(`${API_BASE}/api/admin/cms/courses/`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch CMS courses');
    const data = await res.json();
    return data.courses || [];
  },

  async createCourse(payload: Partial<CmsCourse>): Promise<{ course_id: string; title: string; slug: string }> {
    const res = await fetch(`${API_BASE}/api/admin/cms/courses/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Failed to create course');
    return data.course;
  },

  async updateCourse(courseId: string, payload: Partial<CmsCourse>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/courses/${courseId}/`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return Boolean(data.status);
  },

  async deleteCourse(courseId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/courses/${courseId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return Boolean(data.status);
  },

  // Pages
  async getPages(params?: { course_id?: string; status?: string; search?: string }): Promise<CmsPage[]> {
    const query = new URLSearchParams();
    if (params?.course_id) query.set('course_id', params.course_id);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/api/admin/cms/pages/?${query.toString()}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch CMS pages');
    const data = await res.json();
    return data.pages || [];
  },

  async getPageDetail(pageId: string): Promise<CmsPage> {
    const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageId}/`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (!data.status || !data.page) throw new Error(data.message || 'Page not found');
    return data.page;
  },

  async createPage(payload: { course_id: string; title: string; slug?: string; parent_id?: string | null; page_order?: number }): Promise<CmsPage> {
    const res = await fetch(`${API_BASE}/api/admin/cms/pages/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Failed to create page');
    return data.page;
  },

  async updatePageMetadata(pageId: string, payload: Partial<CmsPage>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageId}/`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return Boolean(data.status);
  },

  async publishPage(pageId: string, payload: {
    html_content: string;
    custom_css?: string;
    custom_js?: string;
    title?: string;
    seo_title?: string;
    seo_description?: string;
    video_url?: string;
    video_title?: string;
    video_thumbnail?: string;
    video_target?: '_blank' | '_self';
    prev_page_id?: string | null;
    next_page_id?: string | null;
  }): Promise<{ url_path: string; file_path: string }> {
    const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageId}/publish/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Publishing failed');
    return { url_path: data.url_path, file_path: data.file_path };
  },

  async deletePage(pageId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return Boolean(data.status);
  },

  // Navigation & Tree
  async getNavigationTree(courseId: string): Promise<{ tree: CmsNavNode[]; course: { title: string; slug: string } }> {
    const res = await fetch(`${API_BASE}/api/admin/cms/navigation/${courseId}/`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' }
    });
    const data = await res.json();
    return { tree: data.tree || [], course: data.course };
  },

  async reorderNavigation(courseId: string, pages: Array<{ page_id: string; order: number; parent_id?: string | null }>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/navigation/${courseId}/`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages })
    });
    const data = await res.json();
    return Boolean(data.status);
  },

  // Media Library
  async getMedia(search?: string): Promise<CmsMedia[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/api/admin/cms/media/${query}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' }
    });
    const data = await res.json();
    return data.media || [];
  },

  async uploadMedia(file: File, title?: string, altText?: string): Promise<CmsMedia> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (altText) formData.append('alt_text', altText);

    const res = await fetch(`${API_BASE}/api/admin/cms/media/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'Upload failed');
    return data.media;
  },

  async deleteMedia(mediaId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/admin/cms/media/${mediaId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return Boolean(data.status);
  }
};
