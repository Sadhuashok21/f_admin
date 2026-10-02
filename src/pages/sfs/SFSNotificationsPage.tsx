import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

export const SFSNotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('SFS Blueprints Update');
  const [body, setBody] = useState('New blueprints and custom planets available! Check them out now.');
  const [topic, setTopic] = useState('all-users');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">SFS Push Notifications</h1>
          <p className="page-subtitle">Send Firebase Cloud Messaging (FCM) notifications to mobile game players</p>
        </div>
      </div>

      {sentSuccess && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '8px', color: 'var(--success)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>FCM Notification broadcast sent successfully to topic "{topic}"!</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label" htmlFor="topic">
              Target Audience Topic <span className="star">*</span>
            </label>
            <select
              id="topic"
              className="form-select"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              <option value="all-users">All Registered Players (Topic: all-users)</option>
              <option value="creators">Verified Creators Only (Topic: creators)</option>
              <option value="beta-testers">Beta Flight Testers (Topic: beta)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Notification Title <span className="star">*</span>
            </label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. SFS Blueprints Update"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="body">
              Message Body <span className="star">*</span>
            </label>
            <textarea
              id="body"
              className="form-textarea"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write notification alert content..."
              required
            />
          </div>

          {/* Preview Box on Device */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={14} />
              <span>Mobile Push Preview</span>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <img src="/as_logo.webp" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{title || 'SFS Notification'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{body || 'Notification message text...'}</div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSending}>
            <Send size={16} />
            <span>{isSending ? 'Broadcasting via Firebase...' : 'Send Broadcast Notification'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
