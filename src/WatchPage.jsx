import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import YouTube from 'react-youtube';
import './WatchPage.css';

export default function WatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [notes, setNotes] = useState('');
  const [isWatched, setIsWatched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVideo(data);
        setNotes(data.notes || '');
        setIsWatched(data.is_watched || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWatched = async () => {
    try {
      const newStatus = !isWatched;
      setIsWatched(newStatus);
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: newStatus })
      });
    } catch (err) {
      console.error(err);
      setIsWatched(!isWatched); // revert on error
    }
  };

  useEffect(() => {
    if (!player) return;

    let syncInterval;
    let initialTimeout;

    const syncTime = async () => {
      try {
        // playerState 1 means PLAYING
        if (player.getPlayerState() === 1) {
          const currentTime = Math.floor(player.getCurrentTime());
          const duration = Math.floor(player.getDuration());
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ watch_time: currentTime, duration })
          });
        }
      } catch (err) {
        console.error('Failed to sync watch time:', err);
      }
    };

    // Fast sync after 10 seconds 
    initialTimeout = setTimeout(() => {
      syncTime();
      // Regular sync every 60 seconds
      syncInterval = setInterval(syncTime, 60000);
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [player, id]);

  const onReady = (event) => {
    setPlayer(event.target);
  };

  if (isLoading) return <div className="watch-loading">Loading...</div>;
  if (!video) return <div className="watch-loading">Video not found.</div>;

  return (
    <div className="watch-page">
      <div className="watch-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </Link>
      </div>

      <div className="watch-title-row">
        <h1 className="watch-title">{video.title}</h1>
        <button
          className={`btn-watched ${isWatched ? 'active' : ''}`}
          onClick={toggleWatched}
        >
          <CheckCircle size={18} />
          {isWatched ? 'Watched' : 'Mark as Watched'}
        </button>
      </div>

      <div className="player-container">
        <YouTube 
          videoId={video.video_id} 
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 0,
              start: video.watch_time || 0,
              rel: 0,
              modestbranding: 1
            }
          }}
          onReady={onReady} 
          className="video-player"
          iframeClassName="video-player"
        />
      </div>

      <div className="notes-section glass-panel">
        <h2>Your Notes hello</h2>
        <textarea
          className="notes-textarea"
          placeholder="Jot down key takeaways, timestamps, or ideas while you watch..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        {console.log(video)}
        <div className="notes-footer">
          <button
            className="btn-save-notes"
            onClick={handleSaveNotes}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}
