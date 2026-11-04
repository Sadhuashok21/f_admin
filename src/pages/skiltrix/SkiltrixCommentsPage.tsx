import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, RefreshCw, Search, Send, Filter } from 'lucide-react';
import { VideoComment, Video } from '../../types';
import { api } from '../../services/api';

export const SkiltrixCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToVideoId, setReplyingToVideoId] = useState<string>('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vids, cmts] = await Promise.all([
        api.getVideos(),
        api.getComments(selectedVideoId === 'all' ? undefined : selectedVideoId)
      ]);
      setVideos(vids);
      setComments(cmts);
      if (vids.length > 0 && !replyingToVideoId) {
        setReplyingToVideoId(vids[0].video_id);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedVideoId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.deleteComment(id);
        setComments(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const handlePostAdminComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !replyingToVideoId) return;

    setPostingComment(true);
    try {
      const added = await api.createComment({
        video_id: replyingToVideoId,
        comment: newCommentText.trim()
      });
      if (added) {
        setComments(prev => [added, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to post admin comment:', err);
    } finally {
      setPostingComment(false);
    }
  };

  const filteredComments = comments.filter(c => {
    const matchesSearch =
      c.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.user_name && c.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.video_title && c.video_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Video Discussions & Comments</h1>
          <p className="page-subtitle">Moderate learner feedback, answer questions, and manage video discussion threads</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Post Admin Comment Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--primary)" />
          <span>Post Official Admin Response or Lesson Note</span>
        </h3>
        <form onSubmit={handlePostAdminComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Target Video</label>
              <select
                className="form-select"
                value={replyingToVideoId}
                onChange={e => setReplyingToVideoId(e.target.value)}
                required
              >
                {videos.map(v => (
                  <option key={v.video_id} value={v.video_id}>
                    {v.title} ({v.video_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type your official announcement, solution, or comment to learners..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              style={{ flex: 1 }}
              disabled={postingComment}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={postingComment || !newCommentText.trim() || !replyingToVideoId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              <span>{postingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search comments by keyword, user, or video title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '4px 0' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Filter by Video:</span>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px', fontSize: '0.82rem', padding: '4px 8px' }}
              value={selectedVideoId}
              onChange={e => setSelectedVideoId(e.target.value)}
            >
              <option value="all">All Videos ({comments.length})</option>
              {videos.map(v => (
                <option key={v.video_id} value={v.video_id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Learner / Author</th>
                <th>Comment</th>
                <th>Video Title</th>
                <th>Video ID</th>
                <th>Posted Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading comments...</p>
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No comments found.</p>
                    <p style={{ fontSize: '0.85rem' }}>Comments posted on SkilTrix lecture videos will appear here in real time.</p>
                  </td>
                </tr>
              ) : (
                filteredComments.map(comment => (
                  <tr key={comment.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {(comment.user_name || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                          {comment.user_name || 'Learner'}
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {comment.comment}
                      </p>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.85rem' }}>
                        {comment.video_title || 'Video Lecture'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {comment.video_id}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {comment.created_at || 'Recently'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(comment.id)}
                        title="Delete Comment"
                      >
                        <Trash2 size={16} />
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
};
export default SkiltrixCommentsPage;

