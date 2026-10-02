import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Film, User, Disc, Plus, Trash2, Play } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { initialMovies, initialSongs } from '../../data/mockData';
import { Movie, Song } from '../../types';

export const SonicoraOverviewPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [songs, setSongs] = useState<Song[]>(initialSongs);

  const handleDeleteMovie = (id: string) => {
    if (window.confirm('Delete this movie from SonicOra?')) {
      setMovies(prev => prev.filter(m => m.movie_id !== id));
    }
  };

  const handleDeleteSong = (id: string) => {
    if (window.confirm('Delete this track from SonicOra?')) {
      setSongs(prev => prev.filter(s => s.song_id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SonicOra Music & Cinema Streaming</h1>
          <p className="page-subtitle">Manage regional discographies, movie tracks, artists, and lossless audio catalog</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/sonicora/song_upload" className="btn btn-primary btn-sm">
            <Music size={16} />
            <span>Upload Song</span>
          </Link>
          <Link to="/sonicora/movie_upload" className="btn btn-secondary btn-sm">
            <Film size={16} />
            <span>Upload Movie</span>
          </Link>
          <Link to="/sonicora/hero_upload" className="btn btn-secondary btn-sm">
            <User size={16} />
            <span>Upload Artist / Hero</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Boxes matching sonicora.html total_con */}
      <div className="stats-grid">
        <StatCard
          title="Total Songs"
          value={songs.length * 480}
          trend="14.3"
          trendDirection="up"
          comparisonText="Hi-Res audio catalog"
          icon={<Music size={20} color="var(--primary)" />}
        />
        <StatCard
          title="Total Telugu Songs"
          value={songs.length * 360}
          trend="18.9"
          trendDirection="up"
          comparisonText="Tollywood & regional hits"
          icon={<Disc size={20} color="var(--success)" />}
        />
        <StatCard
          title="Total Movies"
          value={movies.length * 45}
          trend="9.2"
          trendDirection="up"
          comparisonText="Films with licensed OSTs"
          icon={<Film size={20} color="var(--warning)" />}
        />
      </div>

      {/* Movies Table matching sonicora.html .movies */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Catalog Movies</h2>
          <Link to="/sonicora/movie_upload" className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>New Movie</span>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Movie Title & Poster</th>
                <th>Cast & Star Hero</th>
                <th>Heroine</th>
                <th style={{ textAlign: 'center' }}>Release Year</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.movie_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={movie.movie_img}
                        alt={movie.movie_name}
                        style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{movie.movie_name}</span>
                    </div>
                  </td>
                  <td>{movie.hero}</td>
                  <td>{movie.heroine}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{movie.release_year}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${movie.status}`}>{movie.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn delete" onClick={() => handleDeleteMovie(movie.movie_id)} title="Delete Movie">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Featured Songs Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tracks & Song Releases</h2>
          <Link to="/sonicora/song_upload" className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>New Track</span>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Song Title</th>
                <th>Movie Album</th>
                <th>Playback Singer</th>
                <th>Genre Category</th>
                <th style={{ textAlign: 'center' }}>Duration</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map(song => (
                <tr key={song.song_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={14} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{song.song_name}</span>
                    </div>
                  </td>
                  <td>{song.movie_name}</td>
                  <td>{song.singer}</td>
                  <td>
                    <span style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {song.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{song.duration}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn delete" onClick={() => handleDeleteSong(song.song_id)} title="Delete Track">
                      <Trash2 size={16} />
                    </button>
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
