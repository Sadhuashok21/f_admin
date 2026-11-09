import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  SlidersHorizontal,
  Crown,
  BookOpen,
  Rocket,
  Music,
  Users,
  Database,
  ScrollText,
  CreditCard,
  MessageSquare,
  Check,
  X,
  UserCheck,
  UserMinus,
  LayoutGrid,
  Table,
  Eye,
  EyeOff,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  AdminAccount,
  AdminPrivileges,
  AdminStats,
  PrivilegeMeta,
  CandidateUser
} from '../../types/accounts';
import { accountsApi } from '../../services/accountsApi';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

const DEFAULT_PRIVS: AdminPrivileges = {
  can_manage_cms: true,
  can_manage_courses: true,
  can_manage_sfs: true,
  can_manage_sonicora: true,
  can_manage_skiltrix: true,
  can_manage_users: true,
  can_manage_admins: true,
  can_manage_database: true,
  can_view_logs: true,
  can_manage_payments: true,
  can_manage_inquiries: true
};

const ROLE_PRESET_MAP: Record<string, Partial<AdminPrivileges>> = {
  'Super Admin': {
    can_manage_cms: true,
    can_manage_courses: true,
    can_manage_sfs: true,
    can_manage_sonicora: true,
    can_manage_skiltrix: true,
    can_manage_users: true,
    can_manage_admins: true,
    can_manage_database: true,
    can_view_logs: true,
    can_manage_payments: true,
    can_manage_inquiries: true
  },
  'CMS Manager': {
    can_manage_cms: true,
    can_manage_courses: true,
    can_manage_sfs: false,
    can_manage_sonicora: false,
    can_manage_skiltrix: false,
    can_manage_users: false,
    can_manage_admins: false,
    can_manage_database: false,
    can_view_logs: false,
    can_manage_payments: false,
    can_manage_inquiries: false
  },
  'SFS Moderator': {
    can_manage_cms: false,
    can_manage_courses: false,
    can_manage_sfs: true,
    can_manage_sonicora: false,
    can_manage_skiltrix: false,
    can_manage_users: false,
    can_manage_admins: false,
    can_manage_database: false,
    can_view_logs: false,
    can_manage_payments: false,
    can_manage_inquiries: false
  },
  'Platform Manager': {
    can_manage_cms: true,
    can_manage_courses: true,
    can_manage_sfs: true,
    can_manage_sonicora: true,
    can_manage_skiltrix: true,
    can_manage_users: true,
    can_manage_admins: false,
    can_manage_database: false,
    can_view_logs: true,
    can_manage_payments: true,
    can_manage_inquiries: true
  },
  'Support & Inquiries': {
    can_manage_cms: false,
    can_manage_courses: false,
    can_manage_sfs: false,
    can_manage_sonicora: false,
    can_manage_skiltrix: false,
    can_manage_users: true,
    can_manage_admins: false,
    can_manage_database: false,
    can_view_logs: true,
    can_manage_payments: false,
    can_manage_inquiries: true
  },
  'Custom Admin': {}
};

const PRIVILEGE_CATEGORIES = [
  {
    category: 'Content & Education',
    keys: ['can_manage_cms', 'can_manage_courses', 'can_manage_skiltrix']
  },
  {
    category: 'Gaming & Media',
    keys: ['can_manage_sfs', 'can_manage_sonicora']
  },
  {
    category: 'Identity & Access',
    keys: ['can_manage_users', 'can_manage_admins']
  },
  {
    category: 'System & Infrastructure',
    keys: ['can_manage_database', 'can_view_logs']
  },
  {
    category: 'Finance & Inquiries',
    keys: ['can_manage_payments', 'can_manage_inquiries']
  }
];

export const AccountsManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_admins: 0,
    active_admins: 0,
    suspended_admins: 0,
    super_admins: 0,
    cms_managers: 0,
    sfs_moderators: 0,
    other_roles: 0
  });
  const [roles, setRoles] = useState<string[]>([
    'Super Admin',
    'CMS Manager',
    'SFS Moderator',
    'Platform Manager',
    'Support & Inquiries',
    'Custom Admin'
  ]);
  const [availablePrivileges, setAvailablePrivileges] = useState<PrivilegeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [passwordResetAdmin, setPasswordResetAdmin] = useState<AdminAccount | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [demotingAdmin, setDemotingAdmin] = useState<AdminAccount | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminAccount | null>(null);

  // Form states: Add Admin
  const [addForm, setAddForm] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: 'Super Admin',
    status: 'approved' as 'approved' | 'suspended',
    privileges: { ...DEFAULT_PRIVS }
  });
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Form states: Edit Admin
  const [editForm, setEditForm] = useState({
    name: '',
    lastname: '',
    role: '',
    status: 'approved' as 'approved' | 'suspended',
    privileges: { ...DEFAULT_PRIVS }
  });

  // Form states: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Form states: Promote User
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateUser | null>(null);
  const [promoteRole, setPromoteRole] = useState('CMS Manager');
  const [promotePrivileges, setPromotePrivileges] = useState<AdminPrivileges>(() => {
    const preset = ROLE_PRESET_MAP['CMS Manager'] || {};
    const res: AdminPrivileges = { ...DEFAULT_PRIVS };
    Object.keys(res).forEach(k => {
      if (k in preset && typeof preset[k] === 'boolean') {
        res[k] = preset[k] as boolean;
      }
    });
    return res;
  });
  const [searchingCandidates, setSearchingCandidates] = useState(false);

  // Fetch admin accounts
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await accountsApi.getAdmins({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });
      if (res.status) {
        setAdmins(res.admins || []);
        if (res.stats) setStats(res.stats);
        if (res.roles) setRoles(res.roles);
        if (res.available_privileges) setAvailablePrivileges(res.available_privileges);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch admin accounts');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Flash message timeout
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Filtered view in memory
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch =
        searchTerm === '' ||
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // Lookup privilege label / desc
  const privMetaMap = useMemo(() => {
    const map = new Map<string, PrivilegeMeta>();
    availablePrivileges.forEach(p => map.set(p.key, p));
    return map;
  }, [availablePrivileges]);

  // Open Edit Modal
  const openEditModal = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.first_name || admin.name.split(' ')[0] || '',
      lastname: admin.last_name || admin.name.split(' ').slice(1).join(' ') || '',
      role: admin.role,
      status: admin.status,
      privileges: { ...DEFAULT_PRIVS, ...(admin.privileges || {}) }
    });
  };

  // Open Reset Password Modal
  const openPasswordReset = (admin: AdminAccount) => {
    setPasswordResetAdmin(admin);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPassword(false);
  };

  // Handle Preset Selection for Add Form
  const handleAddRolePresetChange = (selectedRole: string) => {
    const preset = ROLE_PRESET_MAP[selectedRole];
    if (preset && selectedRole !== 'Custom Admin') {
      const newPrivs: AdminPrivileges = { ...DEFAULT_PRIVS };
      Object.keys(newPrivs).forEach(key => {
        newPrivs[key] = Boolean(preset[key]);
      });
      setAddForm(prev => ({
        ...prev,
        role: selectedRole,
        privileges: newPrivs
      }));
    } else {
      setAddForm(prev => ({ ...prev, role: selectedRole }));
    }
  };

  // Handle Preset Selection for Edit Form
  const handleEditRolePresetChange = (selectedRole: string) => {
    const preset = ROLE_PRESET_MAP[selectedRole];
    if (preset && selectedRole !== 'Custom Admin') {
      const newPrivs: AdminPrivileges = { ...DEFAULT_PRIVS };
      Object.keys(newPrivs).forEach(key => {
        newPrivs[key] = Boolean(preset[key]);
      });
      setEditForm(prev => ({
        ...prev,
        role: selectedRole,
        privileges: newPrivs
      }));
    } else {
      setEditForm(prev => ({ ...prev, role: selectedRole }));
    }
  };

  // Handle Add Admin Submit
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      alert('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const res = await accountsApi.createAdmin({
        name: addForm.name.trim(),
        lastname: addForm.lastname.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        role: addForm.role,
        status: addForm.status,
        privileges: addForm.privileges
      });
      setSuccessMsg(res.message);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        lastname: '',
        email: '',
        password: '',
        role: 'Super Admin',
        status: 'approved',
        privileges: { ...DEFAULT_PRIVS }
      });
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to create administrator');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Admin Submit
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setActionLoading(true);
    try {
      const res = await accountsApi.updateAdmin(editingAdmin.user_id, {
        name: editForm.name.trim(),
        lastname: editForm.lastname.trim(),
        role: editForm.role,
        status: editForm.status,
        privileges: editForm.privileges
      });
      setSuccessMsg(res.message);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to update administrator');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetAdmin) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await accountsApi.updateAdmin(passwordResetAdmin.user_id, {
        password: newPassword
      });
      setSuccessMsg(`Password for ${passwordResetAdmin.email} has been updated.`);
      setPasswordResetAdmin(null);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Admin Status
  const handleToggleStatus = async (admin: AdminAccount) => {
    const nextStatus = admin.status === 'approved' ? 'suspended' : 'approved';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} administrator ${admin.name}?`)) {
      return;
    }
    try {
      await accountsApi.updateAdmin(admin.user_id, { status: nextStatus });
      setSuccessMsg(`Administrator ${admin.name} is now ${nextStatus}.`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Handle Demote Admin
  const handleConfirmDemote = async () => {
    if (!demotingAdmin) return;
    setActionLoading(true);
    try {
      const res = await accountsApi.demoteAdmin(demotingAdmin.user_id);
      setSuccessMsg(res.message);
      setDemotingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to demote administrator');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Admin
  const handleConfirmDelete = async () => {
    if (!deletingAdmin) return;
    setActionLoading(true);
    try {
      const res = await accountsApi.deleteAdmin(deletingAdmin.user_id);
      setSuccessMsg(res.message);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to delete administrator');
    } finally {
      setActionLoading(false);
    }
  };

  // Search candidate users for promotion
  const handleSearchCandidates = async (query: string) => {
    setCandidateSearch(query);
    if (!query.trim()) {
      setCandidates([]);
      return;
    }
    setSearchingCandidates(true);
    try {
      const res = await accountsApi.searchCandidates(query);
      if (res.status) {
        setCandidates(res.users || []);
      }
    } catch {
      setCandidates([]);
    } finally {
      setSearchingCandidates(false);
    }
  };

  // Promote Role Preset Change
  const handlePromoteRoleChange = (role: string) => {
    setPromoteRole(role);
    const preset = ROLE_PRESET_MAP[role];
    if (preset && role !== 'Custom Admin') {
      const newPrivs: AdminPrivileges = { ...DEFAULT_PRIVS };
      Object.keys(newPrivs).forEach(k => {
        newPrivs[k] = Boolean(preset[k]);
      });
      setPromotePrivileges(newPrivs);
    }
  };

  // Handle Promote Submit
  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) {
      alert('Please select a platform user to promote.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await accountsApi.promoteUser({
        user_id: selectedCandidate.user_id,
        role: promoteRole,
        privileges: promotePrivileges
      });
      setSuccessMsg(res.message);
      setIsPromoteModalOpen(false);
      setSelectedCandidate(null);
      setCandidateSearch('');
      setCandidates([]);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to promote user');
    } finally {
      setActionLoading(false);
    }
  };

  // Count active privileges
  const getPrivilegeCount = (privs: AdminPrivileges) => {
    if (!privs) return 0;
    return Object.values(privs).filter(Boolean).length;
  };

  // Role badge color helper
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return { background: 'rgba(139, 92, 246, 0.16)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)' };
      case 'CMS Manager':
        return { background: 'rgba(6, 182, 212, 0.16)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.35)' };
      case 'SFS Moderator':
        return { background: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' };
      case 'Platform Manager':
        return { background: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)' };
      case 'Support & Inquiries':
        return { background: 'rgba(20, 184, 166, 0.16)', color: '#2dd4bf', border: '1px solid rgba(20, 184, 166, 0.35)' };
      default:
        return { background: 'rgba(100, 116, 139, 0.16)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.35)' };
    }
  };

  return (
    <div className="accounts-management-page" style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Notification Toast */}
      {successMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: '#064e3b',
            border: '1px solid #059669',
            borderRadius: '10px',
            color: '#a7f3d0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle2 size={18} color="#34d399" />
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            color: '#fca5a5'
          }}
        >
          <AlertTriangle size={18} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Admin Accounts & Privileges
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Create administrator accounts, assign role presets, and configure fine-grained permissions for Course CMS, SFS, SonicOra, and system databases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchAdmins()}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
            title="Refresh accounts"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setIsPromoteModalOpen(true);
              setCandidates([]);
              setCandidateSearch('');
              setSelectedCandidate(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
          >
            <UserCheck size={16} />
            <span>Promote User</span>
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setAddForm({
                name: '',
                lastname: '',
                email: '',
                password: '',
                role: 'Super Admin',
                status: 'approved',
                privileges: { ...DEFAULT_PRIVS }
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <UserPlus size={16} />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Key Stats Bar */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Administrators</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Shield size={18} />
            </div>
          </div>
          <div className="stat-value">
            <span>{stats.total_admins}</span>
          </div>
          <div className="stat-footer" style={{ color: 'var(--text-muted)' }}>
            Configured administrative users
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Admins</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">
            <span style={{ color: '#34d399' }}>{stats.active_admins}</span>
          </div>
          <div className="stat-footer" style={{ color: 'var(--text-muted)' }}>
            Granted full platform authorization
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Suspended Accounts</span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value">
            <span style={{ color: stats.suspended_admins > 0 ? '#f87171' : 'var(--text-muted)' }}>
              {stats.suspended_admins}
            </span>
          </div>
          <div className="stat-footer" style={{ color: 'var(--text-muted)' }}>
            Access temporarily revoked
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Super Admins</span>
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Crown size={18} />
            </div>
          </div>
          <div className="stat-value">
            <span style={{ color: '#c084fc' }}>{stats.super_admins}</span>
          </div>
          <div className="stat-footer" style={{ color: 'var(--text-muted)' }}>
            Unrestricted root permissions
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '1rem 1.25rem',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px', maxWidth: '550px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={17}
              style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by admin name, email, or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 36px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all">All Roles</option>
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved / Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-main)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
              title="Table View"
            >
              <Table size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: viewMode === 'cards' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
              title="Cards Grid View"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admins List Table or Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading administrative accounts...</div>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)'
          }}
        >
          <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px' }}>
            No Administrators Found
          </h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem' }}>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No admin accounts match your active search filters.'
              : 'No administrative accounts configured yet.'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Privileges</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Active</th>
                <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(admin => {
                const privCount = getPrivilegeCount(admin.privileges);
                const isSuper = admin.role === 'Super Admin';
                const roleBadge = getRoleBadgeStyle(admin.role);

                return (
                  <tr
                    key={admin.user_id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Admin User Info */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={admin.profile}
                            alt={admin.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-color)'
                            }}
                            onError={(e: any) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: admin.status === 'approved' ? '#10b981' : '#ef4444',
                              border: '2px solid var(--bg-card)'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                            {admin.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {admin.email}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ID: {admin.user_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          ...roleBadge
                        }}
                      >
                        {isSuper && <Crown size={13} />}
                        {admin.role}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {admin.status === 'approved' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: 'rgba(16, 185, 129, 0.14)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: 'rgba(239, 68, 68, 0.14)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <XCircle size={12} />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Privileges Chips */}
                    <td style={{ padding: '14px 18px' }}>
                      {isSuper ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'rgba(168, 85, 247, 0.14)',
                              color: '#c084fc',
                              border: '1px solid rgba(168, 85, 247, 0.3)'
                            }}
                          >
                            All Modules Unlocked (11/11)
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                          {admin.privileges?.can_manage_cms && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>CMS</span>
                          )}
                          {admin.privileges?.can_manage_courses && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>Courses</span>
                          )}
                          {admin.privileges?.can_manage_sfs && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>SFS</span>
                          )}
                          {admin.privileges?.can_manage_sonicora && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' }}>SonicOra</span>
                          )}
                          {admin.privileges?.can_manage_skiltrix && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>SkilTrix</span>
                          )}
                          {admin.privileges?.can_manage_users && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>Users</span>
                          )}
                          {admin.privileges?.can_manage_database && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(234, 88, 12, 0.12)', color: '#fb923c' }}>DB</span>
                          )}
                          {admin.privileges?.can_view_logs && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' }}>Logs</span>
                          )}
                          {admin.privileges?.can_manage_payments && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>Payments</span>
                          )}
                          {privCount === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No privileges assigned</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Last Active */}
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <div>{admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Created: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(admin)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            cursor: 'pointer'
                          }}
                          title="Edit Privileges & Role"
                        >
                          <SlidersHorizontal size={14} />
                        </button>

                        <button
                          onClick={() => openPasswordReset(admin)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            cursor: 'pointer'
                          }}
                          title="Reset Password"
                        >
                          <Key size={14} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(admin)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: admin.status === 'approved' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: admin.status === 'approved' ? '#f87171' : '#34d399',
                            border: admin.status === 'approved' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                            cursor: 'pointer'
                          }}
                          title={admin.status === 'approved' ? 'Suspend Admin' : 'Activate Admin'}
                        >
                          {admin.status === 'approved' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>

                        <button
                          onClick={() => setDemotingAdmin(admin)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(148, 163, 184, 0.12)',
                            color: '#94a3b8',
                            border: '1px solid rgba(148, 163, 184, 0.25)',
                            cursor: 'pointer'
                          }}
                          title="Demote to Member"
                        >
                          <UserMinus size={14} />
                        </button>

                        <button
                          onClick={() => setDeletingAdmin(admin)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(220, 38, 38, 0.12)',
                            color: '#f87171',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            cursor: 'pointer'
                          }}
                          title="Delete Admin Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredAdmins.map(admin => {
            const isSuper = admin.role === 'Super Admin';
            const roleBadge = getRoleBadgeStyle(admin.role);
            const privCount = getPrivilegeCount(admin.privileges);

            return (
              <div
                key={admin.user_id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {/* Header with avatar & role */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={admin.profile}
                        alt={admin.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)'
                        }}
                        onError={(e: any) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: admin.status === 'approved' ? '#10b981' : '#ef4444',
                          border: '2px solid var(--bg-card)'
                        }}
                      />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px' }}>
                        {admin.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      ...roleBadge
                    }}
                  >
                    {isSuper && <Crown size={12} />}
                    {admin.role}
                  </span>
                </div>

                {/* Privileges summary */}
                <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Active Privileges
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSuper ? '#c084fc' : '#818cf8' }}>
                      {isSuper ? 'Full Access (11)' : `${privCount} of 11`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {isSuper ? (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.14)', color: '#c084fc' }}>
                        All Admin Capabilities Unlocked
                      </span>
                    ) : (
                      <>
                        {admin.privileges?.can_manage_cms && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>CMS</span>}
                        {admin.privileges?.can_manage_courses && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>Courses</span>}
                        {admin.privileges?.can_manage_sfs && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>SFS</span>}
                        {admin.privileges?.can_manage_sonicora && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' }}>SonicOra</span>}
                        {admin.privileges?.can_manage_skiltrix && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>SkilTrix</span>}
                        {admin.privileges?.can_manage_users && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>Users</span>}
                        {admin.privileges?.can_manage_database && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(234, 88, 12, 0.12)', color: '#fb923c' }}>DB</span>}
                        {admin.privileges?.can_view_logs && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' }}>Logs</span>}
                        {admin.privileges?.can_manage_payments && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>Payments</span>}
                        {privCount === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>None assigned</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer with metadata & action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Last login: {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(admin)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: '#818cf8',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <SlidersHorizontal size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => openPasswordReset(admin)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        cursor: 'pointer'
                      }}
                      title="Reset Password"
                    >
                      <Key size={13} />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(admin)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: admin.status === 'approved' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: admin.status === 'approved' ? '#f87171' : '#34d399',
                        border: admin.status === 'approved' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                        cursor: 'pointer'
                      }}
                      title={admin.status === 'approved' ? 'Suspend Admin' : 'Activate Admin'}
                    >
                      {admin.status === 'approved' ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>

                    <button
                      onClick={() => setDemotingAdmin(admin)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(148, 163, 184, 0.12)',
                        color: '#94a3b8',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        cursor: 'pointer'
                      }}
                      title="Demote to Member"
                    >
                      <UserMinus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. ADD NEW ADMIN MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Administrator"
        maxWidth="750px"
      >
        <form onSubmit={handleCreateAdmin}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ashok"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Last Name
              </label>
              <input
                type="text"
                value={addForm.lastname}
                onChange={e => setAddForm(prev => ({ ...prev, lastname: e.target.value }))}
                placeholder="e.g. Kumar"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={addForm.email}
                onChange={e => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@ascentracore.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Initial Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  required
                  value={addForm.password}
                  onChange={e => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword(!showAddPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Admin Role Preset
              </label>
              <select
                value={addForm.role}
                onChange={e => handleAddRolePresetChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              >
                {roles.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Initial Status
              </label>
              <select
                value={addForm.status}
                onChange={e => setAddForm(prev => ({ ...prev, status: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              >
                <option value="approved">Approved & Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Granular Privileges Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px' }}>
                  Granular Module Permissions
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Toggle specific platform privileges for this administrator.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const allTrue: AdminPrivileges = { ...DEFAULT_PRIVS };
                    Object.keys(allTrue).forEach(k => (allTrue[k] = true));
                    setAddForm(prev => ({ ...prev, privileges: allTrue, role: 'Super Admin' }));
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#818cf8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allFalse: AdminPrivileges = { ...DEFAULT_PRIVS };
                    Object.keys(allFalse).forEach(k => (allFalse[k] = false));
                    setAddForm(prev => ({ ...prev, privileges: allFalse, role: 'Custom Admin' }));
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-main)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Privilege Checkbox Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '320px', overflowY: 'auto', paddingRight: '6px' }}>
              {PRIVILEGE_CATEGORIES.map(cat => (
                <div key={cat.category} style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    {cat.category}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                    {cat.keys.map(key => {
                      const meta = privMetaMap.get(key);
                      const isChecked = Boolean(addForm.privileges[key]);
                      return (
                        <label
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              const checked = e.target.checked;
                              setAddForm(prev => ({
                                ...prev,
                                role: 'Custom Admin',
                                privileges: { ...prev.privileges, [key]: checked }
                              }));
                            }}
                            style={{ marginTop: '3px', accentColor: '#6366f1' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {meta?.label || key}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {meta?.description || ''}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <UserPlus size={16} />}
              <span>Create Administrator</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. EDIT ADMIN PRIVILEGES & ROLE MODAL */}
      <Modal
        isOpen={Boolean(editingAdmin)}
        onClose={() => setEditingAdmin(null)}
        title="Edit Administrator Privileges"
        maxWidth="750px"
      >
        {editingAdmin && (
          <form onSubmit={handleUpdateAdmin}>
            {/* Admin identity banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: 'var(--bg-main)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                marginBottom: '16px'
              }}
            >
              <img
                src={editingAdmin.profile}
                alt={editingAdmin.name}
                style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {editingAdmin.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{editingAdmin.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Role:</div>
                <div style={{ fontWeight: 600, color: '#818cf8', fontSize: '0.85rem' }}>{editForm.role}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastname}
                  onChange={e => setEditForm(prev => ({ ...prev, lastname: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  Change Role Preset
                </label>
                <select
                  value={editForm.role}
                  onChange={e => handleEditRolePresetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                  Account Status
                </label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="approved">Approved & Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Granular Privileges */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px' }}>
                    Granular Privileges
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Grant or revoke specific functional modules.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const allTrue: AdminPrivileges = { ...DEFAULT_PRIVS };
                      Object.keys(allTrue).forEach(k => (allTrue[k] = true));
                      setEditForm(prev => ({ ...prev, privileges: allTrue, role: 'Super Admin' }));
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#818cf8',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allFalse: AdminPrivileges = { ...DEFAULT_PRIVS };
                      Object.keys(allFalse).forEach(k => (allFalse[k] = false));
                      setEditForm(prev => ({ ...prev, privileges: allFalse, role: 'Custom Admin' }));
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '300px', overflowY: 'auto', paddingRight: '6px' }}>
                {PRIVILEGE_CATEGORIES.map(cat => (
                  <div key={cat.category} style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      {cat.category}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                      {cat.keys.map(key => {
                        const meta = privMetaMap.get(key);
                        const isChecked = Boolean(editForm.privileges[key]);
                        return (
                          <label
                            key={key}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              cursor: 'pointer',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const checked = e.target.checked;
                                setEditForm(prev => ({
                                  ...prev,
                                  role: 'Custom Admin',
                                  privileges: { ...prev.privileges, [key]: checked }
                                }));
                              }}
                              style={{ marginTop: '3px', accentColor: '#6366f1' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {meta?.label || key}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {meta?.description || ''}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Save Privilege Changes</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 3. RESET PASSWORD MODAL */}
      <Modal
        isOpen={Boolean(passwordResetAdmin)}
        onClose={() => setPasswordResetAdmin(null)}
        title="Reset Administrator Password"
        maxWidth="500px"
      >
        {passwordResetAdmin && (
          <form onSubmit={handleResetPasswordSubmit}>
            <div style={{ marginBottom: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Set a new secure password for{' '}
              <strong style={{ color: 'var(--text-main)' }}>{passwordResetAdmin.name}</strong> ({passwordResetAdmin.email}).
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%',
                    padding: '9px 36px 9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                Confirm New Password *
              </label>
              <input
                type={showResetPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPasswordResetAdmin(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 4. PROMOTE EXISTING USER MODAL */}
      <Modal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        title="Promote Platform User to Administrator"
        maxWidth="680px"
      >
        <form onSubmit={handlePromoteSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
              Search Registered Member
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Type member name, email or username to search..."
                value={candidateSearch}
                onChange={e => handleSearchCandidates(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem'
                }}
              />
              {searchingCandidates && (
                <RefreshCw
                  size={15}
                  className="animate-spin"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              )}
            </div>
          </div>

          {/* Candidates dropdown list */}
          {!selectedCandidate && candidates.length > 0 && (
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              {candidates.map(cand => (
                <div
                  key={cand.user_id}
                  onClick={() => {
                    setSelectedCandidate(cand);
                    setCandidates([]);
                  }}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={cand.profile}
                      alt={cand.name}
                      style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{cand.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cand.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>Select</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected Candidate Preview */}
          {selectedCandidate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedCandidate.profile}
                  alt={selectedCandidate.name}
                  style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {selectedCandidate.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedCandidate.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Role selection for promotion */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
              Assign Administrative Role
            </label>
            <select
              value={promoteRole}
              onChange={e => handlePromoteRoleChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.88rem'
              }}
            >
              {roles.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Privilege Checkboxes */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Included Privileges for this Role:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {availablePrivileges.map(p => {
                const isChecked = Boolean(promotePrivileges[p.key]);
                return (
                  <label
                    key={p.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const checked = e.target.checked;
                        setPromotePrivileges(prev => ({ ...prev, [p.key]: checked }));
                        setPromoteRole('Custom Admin');
                      }}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: isChecked ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: isChecked ? 600 : 400 }}>
                      {p.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsPromoteModalOpen(false)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCandidate || actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                background: selectedCandidate ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'rgba(99, 102, 241, 0.3)',
                color: '#fff',
                border: 'none',
                cursor: selectedCandidate ? 'pointer' : 'not-allowed',
                fontWeight: 600
              }}
            >
              {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <UserCheck size={16} />}
              <span>Promote to Administrator</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. DEMOTE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(demotingAdmin)}
        onClose={() => setDemotingAdmin(null)}
        title="Revoke Admin Access / Demote to Member"
        maxWidth="520px"
      >
        {demotingAdmin && (
          <div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Are you sure you want to demote <strong>{demotingAdmin.name}</strong> ({demotingAdmin.email})?
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  This will safely revoke all administrative privileges and change the account to a regular platform Member.
                  Their account data, login capability, and course enrollments will be preserved.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setDemotingAdmin(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDemote}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <UserMinus size={16} />}
                <span>Demote to Member</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingAdmin)}
        onClose={() => setDeletingAdmin(null)}
        title="Permanently Delete Administrator"
        maxWidth="500px"
      >
        {deletingAdmin && (
          <div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Are you sure you want to permanently delete <strong>{deletingAdmin.name}</strong> ({deletingAdmin.email})?
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  This will completely remove the user account from the Ascentracore database. This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setDeletingAdmin(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
