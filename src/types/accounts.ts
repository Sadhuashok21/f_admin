/**
 * Type definitions for Admin Accounts & Privileges Management
 */

export interface AdminPrivileges {
  can_manage_cms: boolean;
  can_manage_courses: boolean;
  can_manage_sfs: boolean;
  can_manage_sonicora: boolean;
  can_manage_skiltrix: boolean;
  can_manage_users: boolean;
  can_manage_admins: boolean;
  can_manage_database: boolean;
  can_view_logs: boolean;
  can_manage_payments: boolean;
  can_manage_inquiries: boolean;
  [key: string]: boolean | undefined;
}

export interface PrivilegeMeta {
  key: string;
  label: string;
  description: string;
  category: string;
}

export interface AdminAccount {
  id: number;
  user_id: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  profile: string;
  user_type: string;
  status: 'approved' | 'suspended';
  role: string;
  privileges: AdminPrivileges;
  assigned_by?: string;
  assigned_at?: string;
  last_login: string | null;
  created_at: string | null;
}

export interface AdminStats {
  total_admins: number;
  active_admins: number;
  suspended_admins: number;
  super_admins: number;
  cms_managers: number;
  sfs_moderators: number;
  other_roles: number;
}

export interface AdminAccountsResponse {
  status: boolean;
  total_count: number;
  stats: AdminStats;
  roles: string[];
  available_privileges: PrivilegeMeta[];
  admins: AdminAccount[];
  error?: string;
}

export interface CandidateUser {
  id: number;
  user_id: string;
  name: string;
  email: string;
  username: string;
  profile: string;
  status: string;
  user_type: string;
}

export interface CandidateUsersResponse {
  status: boolean;
  users: CandidateUser[];
  error?: string;
}

export interface CreateAdminPayload {
  name: string;
  lastname?: string;
  email: string;
  password: string;
  role: string;
  status?: 'approved' | 'suspended';
  privileges?: Partial<AdminPrivileges>;
}

export interface UpdateAdminPayload {
  name?: string;
  lastname?: string;
  role?: string;
  status?: 'approved' | 'suspended';
  password?: string;
  privileges?: Partial<AdminPrivileges>;
}

export interface PromoteUserPayload {
  user_id?: string;
  email?: string;
  role: string;
  privileges?: Partial<AdminPrivileges>;
}
