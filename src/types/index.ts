// Core data types matching backend models

export interface User {
  id: number | string;
  name: string;
  email: string;
  profile: string;
  type?: string;
  status: 'approved' | 'pending' | 'disapproved' | 'active' | 'inactive';
  platform?: string;
  platform_name?: string;
  uploads?: number;
  downloads?: number;
  time?: string;
  created_at?: string;
}

export interface Blueprint {
  bp_id: string;
  name: string;
  user?: {
    name: string;
    email?: string;
  };
  image: string;
  image_url?: string;
  images?: string[];
  type: 'blueprint' | 'planet' | 'mod' | 'bp' | string;
  categories: string[];
  downloads: number;
  likes: number;
  views: number;
  share?: number;
  fdownloads?: number;
  flikes?: number;
  fviews?: number;
  fshare?: number;
  sfs_link?: string;
  status: 'approved' | 'disapproved' | 'pending';
  created_at?: string;
}

export interface BlueprintCategory {
  id: number | string;
  category_id?: string;
  bp_name: string;
  bp_img: string;
  bp_para: string;
  status: 'approved' | 'disapproved';
  blueprint_count?: number;
}

export interface Internship {
  internship_id: string;
  name: string;
  company_id: string;
  company: {
    name: string;
    image: string;
  };
  type: 'remote' | 'offline' | 'hybrid';
  paid: 0 | 1;
  price?: number;
  location: string;
  apply_link: string;
  description: string;
  deadline: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Company {
  company_id: string;
  name: string;
  image: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  internships_count?: number;
}

export interface Course {
  course_id: string;
  name: string;
  image: string;
  type: 'beginner' | 'intermediate' | 'advanced';
  paid: 0 | 1;
  price?: number;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Video {
  video_id: string;
  title: string;
  image: string;
  video_url?: string;
  course_id: string;
  course_name?: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  comments_count?: number;
}

export interface VideoComment {
  id: number;
  comment: string;
  video?: string;
  video_id: string;
  video_title?: string;
  user?: string;
  user_name?: string;
  created_at?: string;
}

export interface Language {
  language_id: string;
  name: string;
  created_by: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface LogEntry {
  id: number | string;
  time: string;
  user: string;
  user_id?: string;
  error_code?: number | string;
  error_msg?: string;
  change?: string;
  activity_id?: string;
  platform?: string;
  platform_name?: string;
  ip?: string;
  version?: string;
  status?: string;
}

export interface ActivityLog {
  id: number | string;
  activity_id: string;
  change: string;
  user: string;
  time: string;
}

export interface DatabaseInfo {
  name: string;
  tables_count: number;
  size?: string;
  created_at?: string;
}

export interface TableInfo {
  table_name: string;
  rows_count: number;
}

export interface Movie {
  movie_id: string;
  movie_name: string;
  movie_img: string;
  hero: string;
  heroine: string;
  release_year: number;
  status: 'approved' | 'disapproved';
}

export interface Song {
  song_id: string;
  song_name: string;
  movie_name: string;
  hero_name: string;
  singer: string;
  duration: string;
  language: string;
  category: string;
  music_file?: string;
  status: 'approved' | 'disapproved';
}

export interface BankAccount {
  your_name: string;
  bank_name: string;
  ifsc: string;
  account_number: string;
  is_primary?: boolean;
}

export interface Submission {
  id: string;
  student_name: string;
  task_title: string;
  program: string;
  github_link: string;
  submitted_at: string;
  score: number | null;
  status: 'pending' | 'approved' | 'rejected';
  language?: string;
  code?: string;
}

export interface AssessmentSectionItem {
  id?: number | string;
  section_id: string;
  title: string;
  section_type: string;
  order: number;
  duration_minutes: number;
  total_marks: number;
}

export interface CompanyMockItem {
  id?: number | string;
  assessment_id: string;
  title: string;
  slug: string;
  category: string;
  company_tag: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration_minutes: number;
  pass_percentage: number;
  total_marks: number;
  negative_marking_percentage?: number;
  is_company_mock: boolean;
  is_pro_only: boolean;
  proctoring_enabled: boolean;
  active: boolean;
  sections?: AssessmentSectionItem[];
  question_items?: any[];
  sections_count?: number;
  questions_count?: number;
  created_at?: string;
}

export interface CompanyBlueprintItem {
  id?: number | string;
  blueprint_id: string;
  company_name: string;
  slug: string;
  description: string;
  category: string;
  sections_config: Array<{
    title: string;
    type: string;
    marks: number;
    duration?: number;
    count?: number;
  }>;
  recommended_topics: string[];
  duration_minutes: number;
  tier: 'free' | 'pro';
  icon_name: string;
  is_active: boolean;
  created_at?: string;
  mock_linked?: boolean;
}

export interface QuestionItem {
  id?: number | string;
  item_id: string;
  section?: number | string;
  question_type: string;
  title: string;
  prompt: string;
  options?: Array<{ id: string; text: string }>;
  correct_answers?: string[];
  explanation?: string;
  order?: number;
  marks: number;
  negative_marks?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  starter_code?: string;
  reference_solution?: string;
  buggy_code?: string;
  error_message?: string;
  expected_behavior?: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  subject?: string;
  message?: string;
  features?: string;
  tech_stack?: string;
  deployment?: string;
  source_page: string;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'archived';
  notes?: string;
  ip_address?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactMetrics {
  total: number;
  pending: number;
  contacted: number;
  in_progress: number;
  completed: number;
}
