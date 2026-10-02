import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderTree, RefreshCw, Trash2, Rocket } from 'lucide-react';
import { initialCategories } from '../../data/mockData';
import { BlueprintCategory } from '../../types';
import { api } from '../../services/api';

export const SFSCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<BlueprintCategory[]>(initialCategories);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
        setIsLive(true);
      }
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = (id: string | number) => {
    if (window.confirm('Delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">SFS Categories</h1>
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
              {isLive ? 'Live Database Categories' : 'Mock Mode'}
            </span>
          </div>
          <p className="page-subtitle">
            Classification tags and collections for Spaceflight Simulator designs ({categories.length} total)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchCategories} title="Refresh categories">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <Link to="/sfs/upload_category" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add New Category</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
        {categories.map(cat => (
          <div key={cat.id || cat.bp_name} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', width: '100%', position: 'relative' }}>
              <img
                src={cat.bp_img || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'}
                alt={cat.bp_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: cat.status === 'approved' ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}
              >
                {cat.status}
              </span>
              {(cat as any).blueprint_count !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Rocket size={12} />
                  {(cat as any).blueprint_count} Blueprints
                </span>
              )}
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                {cat.bp_name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, marginBottom: '1.25rem', lineHeight: '1.4' }}>
                {cat.bp_para || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {String(cat.id).slice(0, 10)}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="action-btn delete"
                    title="Delete Category"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
