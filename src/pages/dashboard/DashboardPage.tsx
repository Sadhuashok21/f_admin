import React, { useState, useEffect } from 'react';
import {
  Eye,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Server,
  RefreshCw,
  Bug,
  FolderTree
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { User } from '../../types';
import { initialUsers } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState({
    total_blueprints: 111,
    approved_blueprints: 110,
    total_categories: 13,
    total_users: 17,
    total_views: 31,
    total_downloads: 6,
    total_likes: 2,
    total_activities: 1851,
    total_errors: 260
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getDashboardStats();
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
        setIsLive(true);
      }

      const usersRes = await api.getUsers({ limit: 6 });
      if (usersRes && usersRes.length > 0) {
        setUsers(usersRes);
      }
    } catch (e) {
      console.warn('Dashboard using fallback mock data', e);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Analytics points for the chart
  const chartPoints = [
    { day: 'Mon', fullDay: 'Monday', views: Math.round(stats.total_views * 0.15) || 120, downloads: Math.round(stats.total_downloads * 0.2) || 40 },
    { day: 'Tue', fullDay: 'Tuesday', views: Math.round(stats.total_views * 0.22) || 185, downloads: Math.round(stats.total_downloads * 0.25) || 59 },
    { day: 'Wed', fullDay: 'Wednesday', views: Math.round(stats.total_views * 0.35) || 240, downloads: Math.round(stats.total_downloads * 0.3) || 78 },
    { day: 'Thu', fullDay: 'Thursday', views: Math.round(stats.total_views * 0.28) || 195, downloads: Math.round(stats.total_downloads * 0.28) || 64 },
    { day: 'Fri', fullDay: 'Friday', views: Math.round(stats.total_views * 0.45) || 290, downloads: Math.round(stats.total_downloads * 0.4) || 92 },
    { day: 'Sat', fullDay: 'Saturday', views: Math.round(stats.total_views * 0.6) || 340, downloads: Math.round(stats.total_downloads * 0.6) || 125 },
    { day: 'Sun', fullDay: 'Sunday', views: stats.total_views || 410, downloads: stats.total_downloads || 154 }
  ];

  const maxVal = Math.max(...chartPoints.map(c => Math.max(c.views, c.downloads)), 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">Admin Dashboard</h1>
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
              <Server size={12} />
              {isLive ? 'Live API (Port 8000)' : 'Standalone Mode'}
            </span>
          </div>
          <p className="page-subtitle">Ascentracore Solutions Central Unified Control Plane</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadData} title="Refresh data">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <Link to="/sfs/upload_bp" className="btn btn-primary btn-sm">
            <Rocket size={16} />
            <span>Upload Blueprint</span>
          </Link>
          <Link to="/skiltrix/internships" className="btn btn-secondary btn-sm">
            <span>View Internships</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Boxes matching home.html total_box */}
      <div className="stats-grid">
        <StatCard
          title="Total Views"
          value={stats.total_views}
          trend="18.4"
          trendDirection="up"
          comparisonText="Platform wide across SFS & Web"
          icon={<Eye size={20} color="var(--primary)" />}
        />
        <StatCard
          title="Total Blueprints"
          value={stats.total_blueprints}
          trend="8.2"
          trendDirection="up"
          comparisonText="110 Approved, 1 In Review"
          icon={<Rocket size={20} color="var(--warning)" />}
        />
        <StatCard
          title="Total Users"
          value={stats.total_users}
          trend="12.0"
          trendDirection="up"
          comparisonText="Active registered accounts"
          icon={<Users size={20} color="var(--success)" />}
        />
        <StatCard
          title="Recorded Errors"
          value={stats.total_errors}
          trend="4.2"
          trendDirection="down"
          comparisonText="Logged in AllErrors audit table"
          icon={<Bug size={20} color="var(--danger)" />}
        />
      </div>

      {/* Date Filter & Analytics Chart Section */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h2 className="card-title">Live Telemetry & Activity</h2>
          </div>
          <div className="date-filter-group">
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Legend & Hover Instruction */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '0.25rem 0', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)' }} />
              Views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
              Downloads
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hover or tap any column to inspect daily telemetry
          </span>
        </div>

        {/* SVG Visualizer Chart with Interactive Hover */}
        <div
          style={{ height: '240px', width: '100%', position: 'relative', marginTop: '0.5rem' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="viewsGradHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="downloadsGradHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
              </linearGradient>
              <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Horizontal Gridlines */}
            <line x1="0" y1="20" x2="100%" y2="20" stroke="var(--border-color)" strokeDasharray="4" opacity="0.6" />
            <line x1="0" y1="80" x2="100%" y2="80" stroke="var(--border-color)" strokeDasharray="4" opacity="0.6" />
            <line x1="0" y1="140" x2="100%" y2="140" stroke="var(--border-color)" strokeDasharray="4" opacity="0.6" />
            <line x1="0" y1="200" x2="100%" y2="200" stroke="var(--border-color)" />

            {/* Y-axis baseline marker labels */}
            <text x="0" y="24" fontSize="10" fill="var(--text-muted)" opacity="0.75">{maxVal}</text>
            <text x="0" y="84" fontSize="10" fill="var(--text-muted)" opacity="0.75">{Math.round(maxVal * 0.66)}</text>
            <text x="0" y="144" fontSize="10" fill="var(--text-muted)" opacity="0.75">{Math.round(maxVal * 0.33)}</text>

            {/* Columns & Data Bars */}
            {chartPoints.map((p, idx) => {
              const xPercent = (idx / (chartPoints.length - 1)) * 82 + 9;
              const barHeightViews = Math.min(170, (p.views / maxVal) * 160 + 10);
              const yPosViews = 200 - barHeightViews;

              const barHeightDownloads = Math.min(170, (p.downloads / maxVal) * 160 + 10);
              const yPosDownloads = 200 - barHeightDownloads;

              const isHovered = hoveredIdx === idx;

              return (
                <g key={p.day}>
                  {/* Subtle Column Highlight Background on Hover */}
                  <rect
                    x={`${xPercent - 5.5}%`}
                    y="10"
                    width="11%"
                    height="190"
                    rx="6"
                    fill={isHovered ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
                    style={{ transition: 'fill 0.2s ease' }}
                  />

                  {/* Vertical Guide Line when Hovered */}
                  {isHovered && (
                    <line
                      x1={`${xPercent}%`}
                      y1="15"
                      x2={`${xPercent}%`}
                      y2="200"
                      stroke="var(--primary)"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                  )}

                  {/* Views Bar (Primary) */}
                  <rect
                    x={`${xPercent - 2.8}%`}
                    y={yPosViews}
                    width="2.6%"
                    height={barHeightViews}
                    rx="3"
                    fill={isHovered ? 'url(#viewsGradHover)' : 'url(#viewsGrad)'}
                    filter={isHovered ? 'url(#barGlow)' : undefined}
                    style={{
                      transition: 'y 0.2s ease, height 0.2s ease, fill 0.2s ease',
                      cursor: 'pointer'
                    }}
                  />

                  {/* Downloads Bar (Secondary) */}
                  <rect
                    x={`${xPercent + 0.2}%`}
                    y={yPosDownloads}
                    width="2.6%"
                    height={barHeightDownloads}
                    rx="3"
                    fill={isHovered ? 'url(#downloadsGradHover)' : 'url(#downloadsGrad)'}
                    style={{
                      transition: 'y 0.2s ease, height 0.2s ease, fill 0.2s ease',
                      cursor: 'pointer'
                    }}
                  />

                  {/* Indicator Dot on Bar Peaks when Hovered */}
                  {isHovered && (
                    <>
                      <circle
                        cx={`${xPercent - 1.5}%`}
                        cy={yPosViews}
                        r="4"
                        fill="#60a5fa"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={`${xPercent + 1.5}%`}
                        cy={yPosDownloads}
                        r="4"
                        fill="#34d399"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </>
                  )}

                  {/* Day Label (X-Axis) */}
                  <text
                    x={`${xPercent}%`}
                    y="218"
                    fontSize="11"
                    fill={isHovered ? 'var(--primary)' : 'var(--text-muted)'}
                    fontWeight={isHovered ? '700' : '500'}
                    textAnchor="middle"
                    style={{ transition: 'fill 0.2s ease, font-weight 0.2s ease' }}
                  >
                    {p.day}
                  </text>

                  {/* Metric Number above peak */}
                  <text
                    x={`${xPercent}%`}
                    y={Math.min(yPosViews, yPosDownloads) - 8}
                    fontSize={isHovered ? '11' : '10'}
                    fill={isHovered ? 'var(--primary)' : 'var(--text-main)'}
                    fontWeight={isHovered ? '800' : '600'}
                    textAnchor="middle"
                    style={{ transition: 'fill 0.2s ease' }}
                  >
                    {p.views}
                  </text>

                  {/* Invisible Full-Column Touch & Hover Hit Box */}
                  <rect
                    x={`${xPercent - 5.5}%`}
                    y="0"
                    width="11%"
                    height="235"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onTouchStart={() => setHoveredIdx(idx)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Card */}
          {hoveredIdx !== null && (() => {
            const p = chartPoints[hoveredIdx];
            const xPercent = (hoveredIdx / (chartPoints.length - 1)) * 82 + 9;
            const barHeightViews = Math.min(170, (p.views / maxVal) * 160 + 10);
            const yPosViews = 200 - barHeightViews;

            // Clamping horizontal alignment so it never overflows left or right edges
            let transformAlign = 'translate(-50%, -105%)';
            if (hoveredIdx === 0) transformAlign = 'translate(-10%, -105%)';
            else if (hoveredIdx === chartPoints.length - 1) transformAlign = 'translate(-90%, -105%)';

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${xPercent}%`,
                  top: `${Math.max(16, yPosViews - 10)}px`,
                  transform: transformAlign,
                  pointerEvents: 'none',
                  zIndex: 50,
                  minWidth: '185px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.95rem',
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  transition: 'top 0.15s ease-out, left 0.15s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '0.45rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{p.fullDay}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Activity</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                      Page Views:
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.views.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      Downloads:
                    </span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{p.downloads.toLocaleString()}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>Conversion Rate:</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {p.views > 0 ? `${Math.round((p.downloads / p.views) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Users Table matching backend home.html */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Registered Users</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Connected platform creators & administrators ({users.length} shown)
            </p>
          </div>
          <Link to="/users" className="btn btn-secondary btn-sm">
            <span>View All Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Platform</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(u => (
                <tr key={u.id}>
                  <td>
                    <img
                      src={u.profile || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={u.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {u.platform_name || u.platform || 'SFS Web'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: '#fff',
                        backgroundColor: u.status === 'approved' ? '#16a34a' : u.status === 'pending' ? '#ea580c' : '#dc2626'
                      }}
                    >
                      {u.status || 'approved'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to="/users" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px' }}>
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
