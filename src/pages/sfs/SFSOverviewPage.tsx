import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Heart, Share2, Plus, Edit2, Trash2, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { api } from '../../services/api';
import { initialBlueprints, initialCategories } from '../../data/mockData';
import { Blueprint, BlueprintCategory } from '../../types';

export const SFSOverviewPage: React.FC = () => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [categories, setCategories] = useState<BlueprintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    downloads: 0,
    likes: 0,
    shares: 0,
    totalBlueprints: 0,
    totalCategories: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashStats, bpList, catList] = await Promise.all([
        api.getDashboardStats(),
        api.getBlueprints({ limit: 10 }),
        api.getCategories()
      ]);

      if (dashStats && dashStats.stats) {
        setStats({
          views: dashStats.stats.total_views || 0,
          downloads: dashStats.stats.total_downloads || 0,
          likes: dashStats.stats.total_likes || 0,
          shares: dashStats.stats.total_shares || 0,
          totalBlueprints: dashStats.stats.total_blueprints || bpList.length,
          totalCategories: dashStats.stats.total_categories || catList.length
        });
      }

      setBlueprints(bpList && bpList.length > 0 ? bpList : initialBlueprints);
      setCategories(catList && catList.length > 0 ? catList : initialCategories);
    } catch {
      setBlueprints(initialBlueprints);
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (bpId: string) => {
    if (window.confirm('Are you sure you want to delete this blueprint?')) {
      try {
        await api.deleteBlueprint(bpId);
        setBlueprints(prev => prev.filter(b => b.bp_id !== bpId));
      } catch (err) {
        alert('Failed to delete blueprint.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Spaceflight Simulator (SFS)</h1>
          <p className="page-subtitle">SFS Community rocket blueprints, custom planets, and creator metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/sfs/upload_bp" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Upload Blueprint</span>
          </Link>
          <Link to="/sfs/upload_category" className="btn btn-secondary btn-sm">
            <span>New Category</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Boxes matching sfs.html .top_boxes */}
      <div className="stats-grid">
        <StatCard
          title="Total Views"
          value={stats.views.toLocaleString()}
          trend="35.65"
          trendDirection="up"
          comparisonText="Across all community builds"
          icon={<Eye size={20} color="var(--primary)" />}
        />
        <StatCard
          title="Total Downloads"
          value={stats.downloads.toLocaleString()}
          trend="28.40"
          trendDirection="up"
          comparisonText="Live player rocket imports"
          icon={<Download size={20} color="var(--success)" />}
        />
        <StatCard
          title="Total Likes"
          value={stats.likes.toLocaleString()}
          trend="14.15"
          trendDirection="up"
          comparisonText="Community player endorsements"
          icon={<Heart size={20} color="#ec4899" />}
        />
        <StatCard
          title="Total Shares"
          value={stats.shares.toLocaleString()}
          trend="4.20"
          trendDirection="down"
          comparisonText="Social & sharing link clicks"
          icon={<Share2 size={20} color="var(--warning)" />}
        />
      </div>

      {/* SFS Categories Table matching sfs.html .category */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Categories Overview ({categories.length} Total)</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live categories configured in database</div>
          </div>
          <Link to="/sfs/upload_category" className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>Create new category</span>
          </Link>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={20} style={{ marginRight: '8px' }} />
              <span>Loading categories...</span>
            </div>
          ) : (
            <table className="custom-table category_con">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Thumbnail</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>{cat.bp_name}</td>
                    <td>
                      <img
                        src={cat.bp_img || 'https://images.unsplash.com/photo-1517976487502-5731f30bc482?w=400'}
                        alt={cat.bp_name}
                        style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ maxWidth: '400px', color: 'var(--text-muted)' }}>{cat.bp_para}</td>
                    <td>
                      <span className={`badge badge-${cat.status}`}>
                        {cat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Blueprints Table matching sfs.html .blueprints */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Blueprints ({stats.totalBlueprints || blueprints.length} In Database)</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest submissions from the community</div>
          </div>
          <Link to="/sfs/blueprints" className="btn btn-secondary btn-sm">
            View All Blueprints
          </Link>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={20} style={{ marginRight: '8px' }} />
              <span>Loading blueprints...</span>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Blueprint</th>
                  <th style={{ textAlign: 'center' }}>Views</th>
                  <th style={{ textAlign: 'center' }}>Downloads</th>
                  <th style={{ textAlign: 'center' }}>Likes</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blueprints.map(bp => (
                  <tr key={bp.bp_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={bp.image}
                          alt={bp.name}
                          className="blueprint_img"
                          style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{bp.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            by {bp.user?.name || 'Community'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.views.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.downloads.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{bp.likes.toLocaleString()}</td>
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
                        {bp.sfs_link && bp.sfs_link !== 'none' && (
                          <a
                            href={bp.sfs_link}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn"
                            title="Open Sharing Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
