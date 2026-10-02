import React, { useState } from 'react';
import { Database, Table, Plus, Trash2, ArrowLeft, RefreshCw, AlertTriangle, Layers, HardDrive } from 'lucide-react';
import { initialDatabases, initialDatabaseTables } from '../../data/mockData';
import { DatabaseInfo, TableInfo } from '../../types';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';

export const DatabaseManagerPage: React.FC = () => {
  const [databases, setDatabases] = useState<DatabaseInfo[]>(initialDatabases);
  const [tablesMap, setTablesMap] = useState<Record<string, TableInfo[]>>(initialDatabaseTables);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    try {
      const res = await api.getDatabaseTables();
      if (res && res.tables) {
        const liveDbName = res.database_name || 'as_main';
        const liveDb: DatabaseInfo = {
          name: liveDbName,
          tables_count: res.tables_count,
          size: '142.8 MB',
          created_at: '2026-01-01'
        };
        setDatabases(prev => [liveDb, ...prev.filter(d => d.name !== liveDbName)]);
        setTablesMap(prev => ({
          ...prev,
          [liveDbName]: res.tables
        }));
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  // Modals & form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [dbToDelete, setDbToDelete] = useState<string | null>(null);
  const [acceptDelete, setAcceptDelete] = useState(false);

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (databases.some(d => d.name === newDbName)) {
      alert('Database already exists!');
      return;
    }

    const newDb: DatabaseInfo = {
      name: newDbName,
      tables_count: 0,
      size: '0.01 MB',
      created_at: new Date().toISOString().split('T')[0]
    };

    setDatabases(prev => [...prev, newDb]);
    setTablesMap(prev => ({ ...prev, [newDbName]: [] }));
    setIsCreateOpen(false);
    setNewDbName('');
  };

  const confirmDelete = () => {
    if (!dbToDelete) return;
    setDatabases(prev => prev.filter(d => d.name !== dbToDelete));
    if (selectedDb === dbToDelete) setSelectedDb(null);
    setDbToDelete(null);
    setAcceptDelete(false);
  };

  // If a database is selected, render drill-down view matching dd.html
  if (selectedDb) {
    const tables = tablesMap[selectedDb] || [];
    return (
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDb(null)}>
              <ArrowLeft size={16} />
              <span>Back to Databases</span>
            </button>
            <div>
              <h1 className="page-title">Database: {selectedDb}</h1>
              <p className="page-subtitle">Total tables: {tables.length} • MySQL InnoDB Storage Engine</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Table Name</th>
                  <th style={{ textAlign: 'center' }}>Estimated Rows</th>
                  <th style={{ textAlign: 'center' }}>Storage Engine</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No tables found in database "{selectedDb}".
                    </td>
                  </tr>
                ) : (
                  tables.map(t => (
                    <tr key={t.table_name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <Table size={16} color="var(--primary)" />
                          <span>{t.table_name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>
                        {t.rows_count.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          InnoDB
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => alert(`Running SQL SELECT query on ${t.table_name}`)}
                        >
                          Browse Data
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Default Database Overview matching database.html
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Database Management</h1>
          <p className="page-subtitle">
            MySQL Multi-DB router instances, schema structures, and table record counts (Total databases: {databases.length})
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>Create Database</span>
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Database Name</th>
                <th style={{ textAlign: 'center' }}>Total Tables</th>
                <th style={{ textAlign: 'center' }}>Disk Size</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {databases.map(db => (
                <tr key={db.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Database size={18} color="var(--primary)" />
                      <span
                        style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                        onClick={() => setSelectedDb(db.name)}
                      >
                        {db.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {tablesMap[db.name]?.length ?? db.tables_count}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{db.size || '32.4 MB'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{db.created_at || '2026-01-01'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedDb(db.name)}
                        title="Browse Tables"
                      >
                        <Layers size={14} />
                        <span>Tables</span>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => setDbToDelete(db.name)}
                        title="Delete Database"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Database Modal matching database.html form */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Database">
        <form onSubmit={handleCreateDatabase}>
          <div className="form-group">
            <label className="form-label" htmlFor="db_name">
              Database Name <span className="star">*</span>
            </label>
            <input
              type="text"
              id="db_name"
              className="form-input"
              placeholder="e.g. ascentra_analytics_prod"
              value={newDbName}
              onChange={e => setNewDbName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Alphanumeric characters and underscores only.
            </span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Database
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Database Confirmation Modal matching database.html .alert */}
      <Modal
        isOpen={!!dbToDelete}
        onClose={() => {
          setDbToDelete(null);
          setAcceptDelete(false);
        }}
        title="Confirm Database Drop"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '1rem' }}>
            <AlertTriangle size={24} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              Drop database "{dbToDelete}"?
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Warning: Dropping this database will permanently erase all associated tables, schemas, indexes, and stored records.
            <b style={{ color: 'var(--danger)' }}> This action cannot be undone.</b>
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={acceptDelete}
              onChange={e => setAcceptDelete(e.target.checked)}
            />
            <span>I understand the consequences and accept to delete this database.</span>
          </label>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDbToDelete(null);
                setAcceptDelete(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={!acceptDelete}
              onClick={confirmDelete}
            >
              Delete Database
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
