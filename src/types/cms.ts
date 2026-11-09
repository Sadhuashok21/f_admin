export interface CmsCourse {
  id: number;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  status: 'draft' | 'published' | 'archived';
  order: number;
  pages_count?: number;
  published_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CmsPage {
  id: number;
  page_id: string;
  course_id: string;
  course_title?: string;
  course_slug?: string;
  parent_id?: string | null;
  parent_title?: string | null;
  title: string;
  slug: string;
  url_path: string;
  file_path: string;
  css_path?: string;
  js_path?: string;
  status: 'draft' | 'published';
  page_order: number;
  seo_title?: string;
  seo_description?: string;
  video_title?: string;
  video_url?: string;
  video_thumbnail?: string;
  video_target?: '_blank' | '_self';
  prev_page_id?: string | null;
  next_page_id?: string | null;
  created_at: string;
  updated_at: string;
  content_html?: string;
  content_css?: string;
  content_js?: string;
}

export interface CmsMedia {
  media_id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size_kb: number;
  alt_text?: string;
  created_at: string;
}

export interface CmsNavNode {
  page_id: string;
  title: string;
  slug: string;
  url_path: string;
  status: 'draft' | 'published';
  order: number;
  parent_id?: string | null;
  children?: CmsNavNode[];
}
