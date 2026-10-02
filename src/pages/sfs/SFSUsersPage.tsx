import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Mail, RefreshCw, Loader2, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { initialUsers } from '../../data/mockData';
import { User } from '../../types';

export const SFSUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({ limit: 100 });
      setUsers(data && data.length > 0 ? data : initialUsers);
    } catch {
      setUsers(initialUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole =
      roleFilter === 'all' || (u.type && u.type.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Delete this SFS user account permanently?')) {
      try {
        await api.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SFS Community Creators & Users</h1>
          <p className="page-subtitle">Track blueprint submitters, download activity, and creator clearance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search SFS users by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="creator">Creator</option>
              <option value="student">Student</option>
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Fetching community users from MySQL database...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role / Type</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Uploads</th>
                  <th style={{ textAlign: 'center' }}>Platform</th>
                  <th>Joined Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No community users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={u.profile || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={u.name}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.type || 'Member'}</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge badge-${u.status || 'approved'}`}>{u.status || 'approved'}</span>
                      </td>

                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{u.uploads ?? 0}</td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.platform_name || u.platform || 'Web'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.time || u.created_at || 'Recent'}</td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
