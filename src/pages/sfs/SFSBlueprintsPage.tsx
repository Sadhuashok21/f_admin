import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink, Filter, Search } from 'lucide-react';
import { initialBlueprints } from '../../data/mockData';
import { Blueprint } from '../../types';
import { api } from '../../services/api';

interface SFSBlueprintsPageProps {
  filterType?: 'blueprint' | 'planet';
  pageTitle?: string;
}

export const SFSBlueprintsPage: React.FC<SFSBlueprintsPageProps> = ({
  filterType = 'blueprint',
  pageTitle = 'Blueprints'
}) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(() =>
    initialBlueprints.filter(b => (filterType ? b.type === filterType : true))
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchBlueprints = async () => {
    setLoading(true);
    try {
      const data = await api.getBlueprints({
        type: filterType,
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (data && data.length > 0) {
        setBlueprints(data);
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBlueprints();
  }, [filterType, search, statusFilter]);

  const filtered = blueprints.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (bpId: string) => {
    if (window.confirm('Are you sure you want to delete this blueprint?')) {
      setBlueprints(prev => prev.filter(b => b.bp_id !== bpId));
      await api.deleteBlueprint(bpId);
    }
  };

  const handleToggleStatus = async (bpId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'disapproved' : 'approved';
    setBlueprints(prev => prev.map(b => b.bp_id === bpId ? { ...b, status: newStatus as any } : b));
    await api.updateBlueprint(bpId, { status: newStatus as any });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">{pageTitle}</h1>
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
              {isLive ? 'Live Blueprints DB' : 'Offline Cache'}
            </span>
          </div>
          <p className="page-subtitle">
            Manage {filterType === 'planet' ? 'custom planet packs & celestial bodies' : 'rocket designs & launch crafts'} ({blueprints.length} loaded)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchBlueprints} title="Refresh blueprints">
            <span>Sync</span>
          </button>
          <Link to="/sfs/upload_bp" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Upload {filterType === 'planet' ? 'Planet' : 'Blueprint'}</span>
          </Link>
        </div>
      </div>

      <div className="card">
        {/* Filters and Search Bar */}
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or category..."
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="disapproved">Disapproved</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo & Craft</th>
                <th>Categories</th>
                <th style={{ textAlign: 'center' }}>Downloads</th>
                <th style={{ textAlign: 'center' }}>Likes</th>
                <th style={{ textAlign: 'center' }}>Views</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No blueprints found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(bp => (
                  <tr key={bp.bp_id}>
                    <td>
                      <div className="bp_image" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={bp.image}
                          alt={bp.name}
                          className="blueprint_img"
                          style={{ width: '70px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div className="bp_con">
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {bp.name}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {bp.user?.name || 'Community Creator'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {bp.categories.map((c, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--primary)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.downloads.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.likes.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.views.toLocaleString()}</td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${bp.status}`}>{bp.status}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link to={`/sfs/edit_bp?bp_id=${bp.bp_id}`} className="action-btn edit" title="Edit Blueprint">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(bp.bp_id)}
                          title="Delete Blueprint"
                        >
                          <Trash2 size={16} />
                        </button>
                        {bp.sfs_link && (
                          <a
                            href={bp.sfs_link}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn"
                            title="View on SFS Platform"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
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
};
