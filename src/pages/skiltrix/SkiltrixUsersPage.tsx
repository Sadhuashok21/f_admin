import React, { useState, useEffect } from 'react';
import { Search, Loader2, RefreshCw, Mail, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { initialUsers } from '../../data/mockData';
import { User } from '../../types';

export const SkiltrixUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SkilTrix Students & Mentors</h1>
          <p className="page-subtitle">Track student course enrollments, internship applications, and progress certifications</p>
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search students & mentors..."
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
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} active registered users
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Fetching students & mentors from database...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student / Member</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Completed Courses</th>
                  <th style={{ textAlign: 'center' }}>Platform</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No students or mentors found matching your search.
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
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{u.type || 'Student'}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{u.uploads ? u.uploads * 2 : 1}</td>
                      <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.platform_name || u.platform || 'Web'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge badge-${u.status || 'approved'}`}>{u.status || 'approved'}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.created_at || u.time || 'Recent'}</td>
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
