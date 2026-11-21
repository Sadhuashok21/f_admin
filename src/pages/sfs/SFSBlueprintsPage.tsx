import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Blueprint } from '../../types';
import { api } from '../../services/api';
import { getSfsImageUrl } from '../../utils/cdn';

interface SFSBlueprintsPageProps {
  filterType?: 'blueprint' | 'planet' | 'mod';
  pageTitle?: string;
}

export const SFSBlueprintsPage: React.FC<SFSBlueprintsPageProps> = ({
  filterType = 'blueprint',
  pageTitle = 'Blueprints'
}) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBlueprints = async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await api.getPaginatedBlueprints({
        type: filterType,
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: itemsPerPage,
      });
      setBlueprints(res.blueprints);
      setTotalCount(res.total);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
    fetchBlueprints(1);
  }, [filterType, search, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBlueprints(newPage);
  };

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
          <button className="btn btn-secondary btn-sm" onClick={() => fetchBlueprints(currentPage)} title="Refresh blueprints">
            <span>Sync</span>
          </button>
          <Link to={`/sfs/upload_bp${filterType === 'planet' ? '?type=pla' : filterType === 'mod' ? '?type=mod' : ''}`} className="btn btn-primary btn-sm">
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
                placeholder={filterType === 'blueprint' ? "Search by name or category..." : "Search by name..."}
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
                {filterType === 'blueprint' && <th>Categories</th>}
                <th style={{ textAlign: 'center' }}>Downloads</th>
                <th style={{ textAlign: 'center' }}>Likes</th>
                <th style={{ textAlign: 'center' }}>Views</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={filterType === 'blueprint' ? 7 : 6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <LoadingSpinner message={`Retrieving ${pageTitle.toLowerCase()} from database...`} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={filterType === 'blueprint' ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No {filterType === 'planet' ? 'planets' : filterType === 'mod' ? 'mods' : 'blueprints'} found in database.
                  </td>
                </tr>
              ) : (
                filtered.map(bp => (
                  <tr key={bp.bp_id}>
                    <td>
                      <div className="bp_image" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={getSfsImageUrl(bp.image)}
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

                    {filterType === 'blueprint' && (
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
                    )}

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

        {/* Pagination Footer */}
        {totalCount > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} {pageTitle}
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px', color: 'var(--text-main)' }}>
                Page {currentPage} of {Math.max(1, Math.ceil(totalCount / itemsPerPage))}
              </span>

              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
