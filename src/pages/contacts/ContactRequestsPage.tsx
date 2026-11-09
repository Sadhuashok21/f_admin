import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  Activity,
  Check,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ContactSubmission, ContactMetrics } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ContactRequestsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [metrics, setMetrics] = useState<ContactMetrics>({
    total: 0,
    pending: 0,
    contacted: 0,
    in_progress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const itemsPerPage = 10;

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getContactSubmissions({
        status: statusFilter,
        source: sourceFilter,
        search: searchTerm,
        page: currentPage,
        page_size: itemsPerPage,
      });
      setSubmissions(res.submissions);
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load contact submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [searchTerm, statusFilter, sourceFilter, currentPage]);

  const handleOpenDetail = (sub: ContactSubmission) => {
    setSelectedSubmission(sub);
    setAdminNotes(sub.notes || '');
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setActionLoading(true);
    try {
      const ok = await api.updateContactSubmission(id, { status: newStatus });
      if (ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus as any } : s))
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
        // Refresh metrics
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to update submission status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSubmission) return;
    setSavingNotes(true);
    try {
      const ok = await api.updateContactSubmission(selectedSubmission.id, { notes: adminNotes });
      if (ok) {
        setSelectedSubmission((prev) => (prev ? { ...prev, notes: adminNotes } : null));
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSubmission.id ? { ...s, notes: adminNotes } : s))
        );
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      const ok = await api.deleteContactSubmission(id);
      if (ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission(null);
        }
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  const formatSource = (source: string) => {
    if (source === 'landing_request') return 'Landing: Request Form';
    if (source === 'landing_contact') return 'Landing: Direct Contact';
    if (source === 'contact_page') return 'Contact Page';
    return source || 'Website';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">New / Pending</Badge>;
      case 'contacted':
        return <Badge variant="primary">Contacted</Badge>;
      case 'in_progress':
        return <Badge variant="active">In Progress</Badge>;
      case 'completed':
        return <Badge variant="approved">Completed</Badge>;
      case 'archived':
        return <Badge variant="neutral">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="admin-page">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} color="#3b82f6" />
            Contact Inquiries & Project Requests
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage client requests, landing page inquiries, and technical consultation submissions.
          </p>
        </div>

        <button
          className="btn-refresh"
          onClick={fetchSubmissions}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Inquiries</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <MessageSquare size={18} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{metrics.total}</div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>New / Pending</span>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <Clock size={18} color="#eab308" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#eab308' }}>{metrics.pending}</div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Contacted</span>
            <div style={{ background: 'rgba(147, 51, 234, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle2 size={18} color="#a855f7" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>{metrics.contacted}</div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <Activity size={18} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{metrics.in_progress}</div>
        </div>

        <div className="stat-card" style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed</span>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <Check size={18} color="#22c55e" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22c55e' }}>{metrics.completed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="filter-bar"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--surface-color)',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending / New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--text-muted)" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Sources</option>
            <option value="landing_request">Landing: Request Form</option>
            <option value="landing_contact">Landing: Direct Contact</option>
            <option value="contact_page">Contact Page</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div
        className="table-container"
        style={{
          background: 'var(--surface-color)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--table-header-bg, rgba(0,0,0,0.05))', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Client Contact</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Service / Requirement</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Budget</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Source</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="spin" />
                      Loading submissions from database...
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No contact requests found</p>
                      <span style={{ fontSize: '0.78rem' }}>When users fill the form on the landing page or contact page, they will appear here.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const waNumber = (sub.phone || '').replace(/[^0-9]/g, '');
                  const waLink = waNumber ? `https://wa.me/${waNumber}` : null;

                  return (
                    <tr
                      key={sub.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{sub.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {sub.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                          <Mail size={12} />
                          <a href={`mailto:${sub.email}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-link">
                            {sub.email}
                          </a>
                        </div>
                        {sub.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                            <Phone size={12} />
                            <span>{sub.phone}</span>
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                style={{ color: '#22c55e', marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}
                              >
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {sub.service || sub.subject || 'General Inquiry'}
                        </div>
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            marginTop: '2px',
                            maxWidth: '280px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={sub.message}
                        >
                          {sub.message || 'No description provided'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontWeight: 600 }}>
                        {sub.budget ? (
                          <span style={{ color: '#10b981' }}>{sub.budget}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Flexible / Open</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatSource(sub.source_page)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(sub.status)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {sub.created_at || 'Just now'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenDetail(sub)}
                            style={{
                              padding: '6px',
                              background: 'var(--bg-color)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#3b82f6'
                            }}
                            title="View Full Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            style={{
                              padding: '6px',
                              background: 'var(--bg-color)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#ef4444'
                            }}
                            title="Delete Submission"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            Showing {submissions.length} results
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-main)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600 }}>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={submissions.length < itemsPerPage}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-main)',
                cursor: submissions.length < itemsPerPage ? 'not-allowed' : 'pointer',
                opacity: submissions.length < itemsPerPage ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`Inquiry #${selectedSubmission.id}: ${selectedSubmission.name}`}
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Info Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                background: 'var(--bg-color)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Client Name
                </span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{selectedSubmission.name}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Current Status
                </span>
                <div>{getStatusBadge(selectedSubmission.status)}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Email Address
                </span>
                <a href={`mailto:${selectedSubmission.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  {selectedSubmission.email}
                </a>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Phone Number
                </span>
                <span style={{ color: 'var(--text-main)' }}>{selectedSubmission.phone || 'Not provided'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Service Requested
                </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedSubmission.service || 'N/A'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Project Budget
                </span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedSubmission.budget || 'Flexible'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Tech Stack Preferred
                </span>
                <span style={{ color: 'var(--text-main)' }}>{selectedSubmission.tech_stack || 'Open / Consulting'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Deployment Requirement
                </span>
                <span style={{ color: 'var(--text-main)' }}>{selectedSubmission.deployment || 'Not specified'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Submission Date
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedSubmission.created_at}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>
                  Source Channel
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{formatSource(selectedSubmission.source_page)}</span>
              </div>
            </div>

            {/* Project Message / Requirements */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                <FileText size={16} color="#3b82f6" />
                Project Description & Requirements
              </div>
              <div
                style={{
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedSubmission.message || selectedSubmission.subject || 'No project description provided.'}
              </div>
            </div>

            {/* Features if provided */}
            {selectedSubmission.features && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  Required Features Specified by Client
                </div>
                <div
                  style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {selectedSubmission.features}
                </div>
              </div>
            )}

            {/* Quick Status Action Buttons */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Change Lead Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  disabled={actionLoading || selectedSubmission.status === 'pending'}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'pending')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #eab308',
                    background: selectedSubmission.status === 'pending' ? '#eab308' : 'transparent',
                    color: selectedSubmission.status === 'pending' ? '#000' : '#eab308',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Pending
                </button>

                <button
                  type="button"
                  disabled={actionLoading || selectedSubmission.status === 'contacted'}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'contacted')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #a855f7',
                    background: selectedSubmission.status === 'contacted' ? '#a855f7' : 'transparent',
                    color: selectedSubmission.status === 'contacted' ? '#fff' : '#a855f7',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Contacted
                </button>

                <button
                  type="button"
                  disabled={actionLoading || selectedSubmission.status === 'in_progress'}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'in_progress')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #3b82f6',
                    background: selectedSubmission.status === 'in_progress' ? '#3b82f6' : 'transparent',
                    color: selectedSubmission.status === 'in_progress' ? '#fff' : '#3b82f6',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  In Progress
                </button>

                <button
                  type="button"
                  disabled={actionLoading || selectedSubmission.status === 'completed'}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'completed')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #22c55e',
                    background: selectedSubmission.status === 'completed' ? '#22c55e' : 'transparent',
                    color: selectedSubmission.status === 'completed' ? '#fff' : '#22c55e',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Completed
                </button>

                <button
                  type="button"
                  disabled={actionLoading || selectedSubmission.status === 'archived'}
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'archived')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: selectedSubmission.status === 'archived' ? 'var(--border-color)' : 'transparent',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Archive
                </button>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Internal Admin Notes
              </div>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter internal follow-up notes, quotation status, client preferences..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    padding: '6px 14px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

