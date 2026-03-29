import { Link } from 'react-router-dom';
import { Play, Trash2, Video } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ videos, setVideos, searchQuery, selectedCategory }) {

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete video');
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tags && v.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard-grid-only">
      {console.log(filteredVideos)}
      {filteredVideos.length === 0 ? (
        <div className="empty-state">
          <Video size={48} className="empty-icon" />
          <p>No videos found.</p>
          <span>{searchQuery || selectedCategory !== 'All' ? 'Try adjusting your filters.' : 'Click "Add Video" to get started.'}</span>
        </div>
      ) : (
        <div className="video-grid">
          {filteredVideos.map(video => (
            <Link to={`/watch/${video.id}`} key={video.id} className="video-card glass-panel">
              <div className="thumbnail-container">
                <img
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                  alt={video.title}
                  className="thumbnail"
                />
                <div className="play-overlay">
                  <Play size={48} fill="currentColor" />
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title" title={video.title}>{video.title}</h3>
                <div className="video-meta">
                  {video.category && <span className="badge category-badge">{video.category}</span>}
                  <button className="btn-icon btn-delete" onClick={(e) => handleDelete(video.id, e)} title="Delete Video">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
