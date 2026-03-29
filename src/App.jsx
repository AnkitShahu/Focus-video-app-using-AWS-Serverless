import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import PlaylistDashboard from './PlaylistDashboard';
import PlaylistDetail from './PlaylistDetail';
import WatchPage from './WatchPage';
import AddVideoModal from './AddVideoModal';
import './App.css';

function AppContent() {
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/playlists`)
      .then(res => res.json())
      .then(data => setPlaylists(data))
      .catch(err => console.error(err));
      
    fetch(`${import.meta.env.VITE_API_BASE_URL}/videos`)
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVideo = (newVideo) => {
    setVideos(prev => [...prev, newVideo]);
    setIsModalOpen(false);
  };

  return (
    <div className="brutalist-app">
      <nav className="brutalist-nav">
        <Link to="/" className="brand">
          <div className="brand-logo"><Play size={20} fill="currentColor" /></div>
          <span>Focus.</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/">Playlists</Link>
          <Link to="/">FAQ</Link>
        </div>
        <div className="nav-actions">
          <button className="btn-nav-outline">Login</button>
          <button className="btn-nav-solid" onClick={() => setIsModalOpen(true)}>+ Add Video</button>
        </div>
      </nav>

      <main className="brutalist-main">
        <Routes>
          <Route path="/" element={<PlaylistDashboard playlists={playlists} onAddPlaylist={fetchData} videos={videos} setVideos={setVideos} />} />
          <Route path="/playlist/:id" element={<PlaylistDetail playlists={playlists} onAddPlaylist={fetchData} />} />
          <Route path="/watch/:id" element={<WatchPage />} />
        </Routes>
      </main>

      {isModalOpen && (
        <AddVideoModal 
          playlists={playlists}
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddVideo} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
