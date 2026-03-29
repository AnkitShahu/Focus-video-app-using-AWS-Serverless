import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function PlaylistDetail({ playlists, onAddPlaylist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const playlist = playlists.find(p => p.id.toString() === id);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/playlists/${id}/videos`)
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  }, [id]);

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

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onAddPlaylist) onAddPlaylist();
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="playlist-detail" style={{ animation: 'fadeIn 0.3s' }}>
      <Link to="/" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, fontSize: '1.1rem', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{playlist?.name || 'Playlist View'}</h1>
        <button onClick={handleDeletePlaylist} title="Delete Playlist" style={{ background: 'var(--danger-color)', color: 'white', border: '3px solid #000', boxShadow: '4px 4px 0px #000', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={24} />
        </button>
      </div>

      <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {videos.map(video => (
          <Link to={`/watch/${video.id}`} key={video.id} className="brutalist-panel" style={{ display: 'flex', flexDirection: 'column', color: '#000', textDecoration: 'none', overflow: 'hidden', padding: 0, transition: 'transform 0.2s, box-shadow 0.2s' }}>
             <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000', borderBottom: '2px solid #000' }}>
                <img 
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`} 
                  alt={video.title} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
             </div>
             <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, background: '#fff' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3 }}>{video.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  {video.category && <span style={{ background: '#fdf2f8', border: '2px solid #000', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>{video.category}</span>}
                  <button onClick={(e) => handleDelete(video.id, e)} style={{ background: 'var(--danger-color)', color: 'white', border: '2px solid #000', boxShadow: '2px 2px 0px #000', padding: '6px', borderRadius: '8px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
             </div>
          </Link>
        ))}
        {videos.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: '#fff', border: '3px solid #000', borderRadius: '16px', boxShadow: '8px 8px 0px #000' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>No videos yet!</h3>
            <p style={{ color: '#4b5563', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>Click "+ Add Video" in the navbar to populate this playlist.</p>
          </div>
        )}
      </div>
    </div>
  );
}
