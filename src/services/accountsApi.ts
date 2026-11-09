/**
 * API client for Admin Accounts & Privileges Management
 */

import {
  AdminAccountsResponse,
  CandidateUsersResponse,
  CreateAdminPayload,
  UpdateAdminPayload,
  PromoteUserPayload,
  AdminAccount
} from '../types/accounts';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('as_access_token') || localStorage.getItem('access_token')
      : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const accountsApi = {
  /**
   * Fetch all admin accounts with stats and privileges
   */
  async getAdmins(params?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<AdminAccountsResponse> {
    const qs = new URLSearchParams();
    if (params?.search) qs.append('search', params.search);
    if (params?.role && params.role !== 'all') qs.append('role', params.role);
    if (params?.status && params.status !== 'all') qs.append('status', params.status);

    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/admin/accounts/${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to fetch admin accounts`);
    }

    return res.json();
  },

  /**
   * Create a new administrator account
   */
  async createAdmin(data: CreateAdminPayload): Promise<{ status: boolean; message: string; admin: AdminAccount }> {
    const res = await fetch(`${API_BASE}/api/admin/accounts/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) {
      throw new Error(json.error || `Failed to create administrator`);
    }

    return json;
  },

  /**
   * Update an existing admin's details, role, status, or privileges
   */
  async updateAdmin(
    userId: string,
    data: UpdateAdminPayload
  ): Promise<{ status: boolean; message: string; admin: AdminAccount }> {
    const res = await fetch(`${API_BASE}/api/admin/accounts/${userId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) {
      throw new Error(json.error || `Failed to update administrator`);
    }

    return json;
  },

  /**
   * Demote an admin to a standard user
   */
  async demoteAdmin(userId: string): Promise<{ status: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/admin/accounts/${userId}/?action=demote`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) {
      throw new Error(json.error || `Failed to demote administrator`);
    }

    return json;
  },

  /**
   * Permanently delete an administrator account
   */
  async deleteAdmin(userId: string): Promise<{ status: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/admin/accounts/${userId}/?action=delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) {
      throw new Error(json.error || `Failed to delete administrator`);
    }

    return json;
  },

  /**
   * Promote an existing platform user to administrator
   */
  async promoteUser(data: PromoteUserPayload): Promise<{ status: boolean; message: string; admin: AdminAccount }> {
    const res = await fetch(`${API_BASE}/api/admin/accounts/promote/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status === false) {
      throw new Error(json.error || `Failed to promote user to administrator`);
    }

    return json;
  },

  /**
   * Search non-admin registered users for promotion candidates
   */
  async searchCandidates(query: string): Promise<CandidateUsersResponse> {
    if (!query || query.trim().length === 0) {
      return { status: true, users: [] };
    }

    const res = await fetch(
      `${API_BASE}/api/admin/accounts/search-users/?q=${encodeURIComponent(query.trim())}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to search users`);
    }

    return res.json();
  }
};
