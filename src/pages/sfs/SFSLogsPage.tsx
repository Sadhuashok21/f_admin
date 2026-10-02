import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { initialLogs } from '../../data/mockData';
import { LogEntry } from '../../types';

export const SFSLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getLogs({ type: 'errors', limit: 100 });
      setLogs(data && data.length > 0 ? data : initialLogs);
    } catch {
      setLogs(initialLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    l =>
      (l.error_msg && l.error_msg.toLowerCase().includes(search.toLowerCase())) ||
      (l.user_id && l.user_id.toLowerCase().includes(search.toLowerCase())) ||
      (l.user && l.user.toLowerCase().includes(search.toLowerCase())) ||
      (l.ip && l.ip.includes(search))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SFS System Logs & Telemetry</h1>
          <p className="page-subtitle">Inspect client error reports, request versions, and IP tracing</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search SFS error logs, user, or IP..."
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
            Showing {filtered.length} logged error incidents
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} style={{ marginRight: '8px' }} />
              <span>Fetching telemetry error logs from MySQL database...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Error Message</th>
                  <th>User ID / Name</th>
                  <th>Client IP</th>
                  <th>App Version</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No error logs found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: log.error_code === 200 ? 'var(--text-main)' : 'var(--danger)', fontWeight: 500 }}>
                          {log.error_code !== 200 && <AlertTriangle size={14} color="var(--danger)" />}
                          <span>{log.error_msg || log.change}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.user_id || log.user || 'System'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip || '127.0.0.1'}</td>
                      <td>
                        <span style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                          v{log.version || '1.0'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{log.time}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${log.status === 'Success' ? 'badge-approved' : 'badge-disapproved'}`}>
                          {log.status || 'Active'}
                        </span>
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
