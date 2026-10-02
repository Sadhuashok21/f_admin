import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  BookOpen,
  Building2,
  Film,
  Languages,
  FolderGit2,
  Users,
  FileCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { api } from '../../services/api';
import { initialInternships, initialCourses, initialCompanies, initialVideos, initialLanguages, initialSubmissions } from '../../data/mockData';

export const SkiltrixOverviewPage: React.FC = () => {
  const [stats, setStats] = useState({
    internships: initialInternships.length,
    courses: initialCourses.length,
    companies: initialCompanies.length,
    languages: initialLanguages.length,
    videos: initialVideos.length,
    submissions: initialSubmissions.length
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getSkiltrixStats();
      setStats(data);
    } catch {
      // keep fallbacks
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SkilTrix Education & Career Hub</h1>
          <p className="page-subtitle">Manage tech courses, student internships, company partnerships, and submissions</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/skiltrix/internships" className="btn btn-primary btn-sm">
            <Briefcase size={16} />
            <span>Manage Internships</span>
          </Link>
          <Link to="/skiltrix/courses" className="btn btn-secondary btn-sm">
            <BookOpen size={16} />
            <span>Manage Courses</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards - 6 Live Metrics */}
      <div className="stats-grid">
        <StatCard
          title="Active Internships"
          value={stats.internships}
          trend="15.2"
          trendDirection="up"
          comparisonText="Across top industry tech leaders"
          icon={<Briefcase size={20} color="var(--primary)" />}
        />
        <StatCard
          title="Available Courses"
          value={stats.courses}
          trend="22.5"
          trendDirection="up"
          comparisonText="From beginner to advanced tracks"
          icon={<BookOpen size={20} color="var(--success)" />}
        />
        <StatCard
          title="Partner Companies"
          value={stats.companies}
          trend="8.1"
          trendDirection="up"
          comparisonText="Global technology enterprise partners"
          icon={<Building2 size={20} color="#8b5cf6" />}
        />
        <StatCard
          title="Programming Languages"
          value={stats.languages}
          trend="11.4"
          trendDirection="up"
          comparisonText="Live compiler runtimes in MySQL"
          icon={<Languages size={20} color="var(--warning)" />}
        />
        <StatCard
          title="Lecture Videos"
          value={stats.videos}
          trend="18.9"
          trendDirection="up"
          comparisonText="Streamed curriculum modules"
          icon={<Film size={20} color="var(--info)" />}
        />
        <StatCard
          title="Student Submissions"
          value={stats.submissions}
          trend="14.3"
          trendDirection="up"
          comparisonText="Evaluated solutions & code tests"
          icon={<FileCheck size={20} color="#ec4899" />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">SkilTrix Quick Modules</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <Link to="/skiltrix/internships" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Internships ({stats.internships})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remote & hybrid opportunities</div>
            </div>
          </Link>

          <Link to="/skiltrix/courses" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(22,163,74,0.1)', color: 'var(--success)', borderRadius: '10px' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Course Catalog ({stats.courses})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free and certified paid training</div>
            </div>
          </Link>

          <Link to="/skiltrix/companies" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', borderRadius: '10px' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Companies Directory ({stats.companies})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corporate recruiters & sponsors</div>
            </div>
          </Link>

          <Link to="/skiltrix/videos" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(2,132,199,0.1)', color: 'var(--info)', borderRadius: '10px' }}>
              <Film size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Lecture Videos ({stats.videos})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tutorials & chapter lessons</div>
            </div>
          </Link>

          <Link to="/skiltrix/languages" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', borderRadius: '10px' }}>
              <Languages size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Languages ({stats.languages})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compiler runtime matrix</div>
            </div>
          </Link>

          <Link to="/skiltrix/submissions" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '10px' }}>
              <FileCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Submissions ({stats.submissions})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student project evaluations</div>
            </div>
          </Link>

          <Link to="/skiltrix/file-system" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '10px' }}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>WYSIWYG File System</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Document editor & code viewer</div>
            </div>
          </Link>

          <Link to="/skiltrix/users" className="card" style={{ marginBottom: 0, textDecoration: 'none', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '10px' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Students & Mentors</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrollment & certifications</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
