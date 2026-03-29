import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Clock, PlusCircle, Trash2 } from 'lucide-react';
import './PlaylistDashboard.css';

export default function PlaylistDashboard({ playlists, onAddPlaylist, videos, setVideos }) {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName, description: 'Created from dashboard' })
      });
      setNewPlaylistName('');
      setIsCreating(false);
      onAddPlaylist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/playlists/${playlistId}`, { method: 'DELETE' });
      if (res.ok) {
        onAddPlaylist(); // Refresh data
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlaylist = async (video, playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const currentIds = video.playlists?.map(p => p.id) || [];
      let newIds;
      if (currentIds.includes(playlistId)) {
        newIds = currentIds.filter(id => id !== playlistId);
      } else {
        newIds = [...currentIds, playlistId];
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_ids: newIds })
      });
      if (res.ok) {
        const updatedVideo = await res.json();
        setVideos(prev => prev.map(v => v.video_id === video.video_id ? updatedVideo : v));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="playlist-dashboard">
      <div className="playlists-header">
        <h2>Your Playlists</h2>
        {!isCreating ? (
          <button className="btn-new-playlist" onClick={() => setIsCreating(true)}>
            <Plus size={20} strokeWidth={3} /> New Playlist
          </button>
        ) : (
          <form className="create-playlist-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Playlist Name..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              autoFocus
              className="create-playlist-input"
            />
            <button type="submit" className="btn-create-save">Save</button>
            <button type="button" className="btn-create-cancel" onClick={() => setIsCreating(false)}>Cancel</button>
          </form>
        )}
      </div>

      <div className="playlists-grid">
        {playlists.map((pl, idx) => (
          <Link key={pl.id} to={`/playlist/${pl.id}`} className={`playlist-card ${idx % 3 === 2 ? 'card-purple' : ''}`} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{pl.name}</h3>
              <button onClick={(e) => handleDeletePlaylist(pl.id, e)} style={{ background: 'var(--danger-color)', color: 'white', border: '2px solid #000', boxShadow: '2px 2px 0px #000', padding: '6px', borderRadius: '8px', cursor: 'pointer', zIndex: 10 }}>
                <Trash2 size={16} />
              </button>
            </div>
            <p>{pl.description || 'A stunning collection of curated videos tailored to your focus.'}</p>
            <div className="card-footer">
              <Clock size={16} />
              <span>{Math.floor(Math.random() * 40) + 10}:00</span>
            </div>
          </Link>
        ))}
        {playlists.length === 0 && (
          <div className="empty-playlist-state brutalist-panel">
            <PlusCircle size={48} />
            <p>You haven't created any playlists yet.</p>
          </div>
        )}
      </div>

      <div className="all-videos-section" style={{ marginTop: '0rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-1px' }}>All Videos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {videos?.map(video => (
            <Link to={`/watch/${video.id}`} key={video.id} className="brutalist-panel" style={{ display: 'flex', flexDirection: 'column', color: '#000', textDecoration: 'none', overflow: 'visible', padding: 0, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000', borderBottom: '2px solid #000', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
                <img
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                  alt={video.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, background: '#fff', borderRadius: '0 0 14px 14px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3 }}>{video.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div className="playlist-assigner" style={{ position: 'relative', zIndex: 10 }}>
                    <button
                      onClick={(e) => { e.preventDefault(); setOpenDropdownId(openDropdownId === video.id ? null : video.id); }}
                      style={{ border: '2px solid #000', borderRadius: '6px', fontWeight: 700, padding: '6px 10px', background: '#fbcfe8', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '2px 2px 0px #000', display: 'flex', alignItems: 'center' }}
                    >
                      Manage Playlists
                    </button>

                    {openDropdownId === video.id && (
                      <div style={{ position: 'absolute', bottom: '120%', left: 0, marginBottom: '0.5rem', background: '#fff', border: '3px solid #000', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '4px 4px 0px #000', width: '200px', maxHeight: '180px', overflowY: 'auto' }}>
                        {playlists.map(pl => {
                          const isInPlaylist = video.playlists?.some(p => p.id === pl.id);
                          return (
                            <label key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isInPlaylist}
                                onChange={(e) => togglePlaylist(video, pl.id, e)}
                                style={{ margin: 0, width: '16px', height: '16px' }}
                              />
                              {pl.name}
                            </label>
                          );
                        })}
                        {playlists.length === 0 && <span style={{ fontSize: '0.8rem' }}>No playlists yet.</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => handleDelete(video.id, e)} style={{ background: 'var(--danger-color)', color: 'white', border: '2px solid #000', boxShadow: '2px 2px 0px #000', padding: '6px', borderRadius: '8px', cursor: 'pointer', zIndex: 11 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
          {(!videos || videos.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#fff', border: '3px solid #000', borderRadius: '16px', boxShadow: '8px 8px 0px #000' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>No videos found. Add one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
