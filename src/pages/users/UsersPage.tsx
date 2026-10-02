import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Globe,
  Upload,
  Download
} from 'lucide-react';
import { initialUsers } from '../../data/mockData';
import { User } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'disapproved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const itemsPerPage = 6;

  // Selected user for details/edit modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    type: 'Member',
    platform: 'Web',
    platform_name: 'Chrome on Windows',
    status: 'approved' as 'approved' | 'pending' | 'disapproved',
    profile: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (data && data.length > 0) {
        setUsers(data);
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.platform_name && user.platform_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.platform && user.platform.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Actions
  const handleUpdateStatus = async (userId: number | string, status: 'approved' | 'pending' | 'disapproved') => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => (prev ? { ...prev, status } : null));
    }
    await api.updateUser(userId, { status });
  };

  const handleDeleteUser = async (userId: number | string) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      await api.deleteUser(userId);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) {
      alert('Please provide name and email');
      return;
    }

    try {
      await api.createUser(newUserData);
      await fetchUsers();
    } catch {
      const newUser: User = {
        id: Date.now(),
        name: newUserData.name,
        email: newUserData.email,
        profile: newUserData.profile,
        type: newUserData.type,
        status: newUserData.status,
        platform: newUserData.platform,
        platform_name: newUserData.platform_name,
        uploads: 0,
        downloads: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      setUsers([newUser, ...users]);
    }
    setIsAddUserOpen(false);
    setNewUserData({
      name: '',
      email: '',
      type: 'Member',
      platform: 'Web',
      platform_name: 'Chrome on Windows',
      status: 'approved',
      profile: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });
  };

  const approvedCount = users.filter(u => u.status === 'approved').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const disapprovedCount = users.filter(u => u.status === 'disapproved').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Global User Directory</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                background: isLive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: isLive ? '#22c55e' : '#eab308'
              }}
            >
              {isLive ? 'Live Database' : 'Mock Mode'}
            </span>
          </div>
          <p className="page-subtitle">Manage Ascentracore Solutions user registrations, platforms, and access permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} title="Refresh users">
            <span>Sync</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Users</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
            Registered across system
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Approved</span>
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#22c55e' }}>{approvedCount}</div>
          <div className="stat-change" style={{ color: '#22c55e' }}>
            Active verified credentials
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Verification</span>
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#eab308' }}>{pendingCount}</div>
          <div className="stat-change" style={{ color: '#eab308' }}>
            Awaiting administrator approval
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Disapproved / Blocked</span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{disapprovedCount}</div>
          <div className="stat-change" style={{ color: '#ef4444' }}>
            Access restricted
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching backend form */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search users by name, email, platform..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: '34px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses ({users.length})</option>
              <option value="approved">Approved ({approvedCount})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="disapproved">Disapproved ({disapprovedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table matching backend u_index.html */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Platform</th>
                <th>Platform Name</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                currentUsers.map(user => (
                  <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                    <td>
                      <img
                        src={user.profile || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={user.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td>
                      <Badge variant={user.type === 'Administrator' ? 'primary' : 'neutral'}>
                        {user.type || 'Member'}
                      </Badge>
                    </td>
                    <td>
                      {/* Preserving backend status badges with approved/pending/disapproved classes */}
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          color: '#fff',
                          backgroundColor:
                            user.status === 'approved'
                              ? '#16a34a'
                              : user.status === 'pending'
                              ? '#ea580c'
                              : '#dc2626'
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        {user.platform?.toLowerCase().includes('mobile') ? (
                          <Smartphone size={14} color="#3b82f6" />
                        ) : (
                          <Globe size={14} color="#10b981" />
                        )}
                        {user.platform || 'Web'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {user.platform_name || 'Chrome Browser'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 6px' }}
                          onClick={() => setSelectedUser(user)}
                          title="Inspect Details"
                        >
                          <Eye size={14} />
                        </button>
                        {user.status !== 'approved' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 6px', background: '#16a34a', borderColor: '#16a34a' }}
                            onClick={() => handleUpdateStatus(user.id, 'approved')}
                            title="Approve User"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {user.status !== 'disapproved' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px', color: '#ea580c' }}
                            onClick={() => handleUpdateStatus(user.id, 'disapproved')}
                            title="Disapprove User"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 6px' }}
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching backend Previous and Next buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* User Details & Status Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `User: ${selectedUser.name}` : ''}
        maxWidth="560px"
      >
        {selectedUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <img
                src={selectedUser.profile || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={selectedUser.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedUser.name}</h3>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedUser.email}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <Badge variant={selectedUser.type === 'Administrator' ? 'primary' : 'neutral'}>
                    {selectedUser.type || 'Member'}
                  </Badge>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      color: '#fff',
                      backgroundColor:
                        selectedUser.status === 'approved'
                          ? '#16a34a'
                          : selectedUser.status === 'pending'
                          ? '#ea580c'
                          : '#dc2626'
                    }}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row-2col" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform Device</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedUser.platform || 'Web'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser.platform_name || 'Chrome'}</div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Activity Counters</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Upload size={14} color="#3b82f6" /> {selectedUser.uploads ?? 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} color="#22c55e" /> {selectedUser.downloads ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Change Account Status
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedUser.status === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, backgroundColor: selectedUser.status === 'approved' ? '#16a34a' : undefined }}
                  onClick={() => handleUpdateStatus(selectedUser.id, 'approved')}
                >
                  <CheckCircle2 size={15} />
                  <span>Approved</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedUser.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, backgroundColor: selectedUser.status === 'pending' ? '#ea580c' : undefined }}
                  onClick={() => handleUpdateStatus(selectedUser.id, 'pending')}
                >
                  <Clock size={15} />
                  <span>Pending</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedUser.status === 'disapproved' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => handleUpdateStatus(selectedUser.id, 'disapproved')}
                >
                  <XCircle size={15} />
                  <span>Disapproved</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteUser(selectedUser.id)}
              >
                <Trash2 size={15} />
                <span>Delete Account</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Register New User"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={newUserData.name}
              onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. john@ascentracoresolutions.com"
              value={newUserData.email}
              onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-row-2col" style={{ marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Role</label>
              <select
                value={newUserData.type}
                onChange={e => setNewUserData({ ...newUserData, type: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Administrator">Administrator</option>
                <option value="Moderator">Moderator</option>
                <option value="Member">Member</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Initial Status</label>
              <select
                value={newUserData.status}
                onChange={e => setNewUserData({ ...newUserData, status: e.target.value as any })}
                style={{ width: '100%' }}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="disapproved">Disapproved</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col" style={{ marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Platform</label>
              <select
                value={newUserData.platform}
                onChange={e => setNewUserData({ ...newUserData, platform: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="API">API Client</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>Platform Name</label>
              <input
                type="text"
                placeholder="e.g. Chrome / iOS"
                value={newUserData.platform_name}
                onChange={e => setNewUserData({ ...newUserData, platform_name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Create User</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
