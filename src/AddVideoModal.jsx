import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AddVideoModal({ onClose, onAdd, playlists }) {
  const [formData, setFormData] = useState({ 
    url: '', 
    title: '',
    category: '', 
    tags: '',
    notes: '',
    playlist_ids: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaylistToggle = (plId) => {
    setFormData(prev => {
      const currentIds = prev.playlist_ids || [];
      if (currentIds.includes(plId)) {
        return { ...prev, playlist_ids: currentIds.filter(id => id !== plId) };
      } else {
        return { ...prev, playlist_ids: [...currentIds, plId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        let errorMessage = 'Failed to add video';
        if (errData && errData.detail) {
          if (typeof errData.detail === 'string') {
            errorMessage = errData.detail;
          } else if (Array.isArray(errData.detail)) {
            errorMessage = errData.detail.map(e => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join(', ');
          }
        }
        throw new Error(errorMessage);
      }
      
      const newVideo = await res.json();
      onAdd(newVideo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'black' }}>Add Video</h2>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        {error && <div className="error-message" style={{ marginBottom: '1.5rem', background: '#fee2e2', border: '2px solid #000', padding: '1rem', borderRadius: '8px', color: '#000', fontWeight: 'bold' }}><AlertCircle size={18}/> {error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '1rem', color: '#000', fontWeight: 800 }}>YouTube URL or Embed Code</label>
            <input 
              type="text" 
              name="url"
              placeholder="https://youtube.com/watch?v=..." 
              value={formData.url}
              onChange={handleInputChange}
              required
              data-autofocus
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '1rem', color: '#000', fontWeight: 800 }}>Video Title</label>
            <input 
              type="text" 
              name="title"
              placeholder="Enter video title" 
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '1rem', color: '#000', fontWeight: 800 }}>Playlists</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '2px solid #000', borderRadius: '8px', padding: '12px', maxHeight: '130px', overflowY: 'auto', background: '#fff', boxShadow: '2px 2px 0px #000' }}>
                {playlists?.map(pl => (
                  <label key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#000', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={(formData.playlist_ids || []).includes(pl.id)}
                      onChange={() => handlePlaylistToggle(pl.id)}
                      style={{ margin: 0, width: '16px', height: '16px' }}
                    />
                    {pl.name}
                  </label>
                ))}
                {(!playlists || playlists.length === 0) && <span style={{fontSize: '0.85rem'}}>No playlists yet.</span>}
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '1rem', color: '#000', fontWeight: 800 }}>Category</label>
              <input 
                type="text" 
                name="category"
                placeholder="No Category" 
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '1rem', color: '#000', fontWeight: 800 }}>Initial Notes</label>
            <textarea
              name="notes"
              placeholder="Why are you saving this video?"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-solid"
            style={{ 
              marginTop: '1rem', width: '100%', padding: '16px', fontSize: '1.2rem',
              background: 'var(--accent-color)', color: 'white'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save to Library'}
          </button>
        </form>
      </div>
    </div>
  );
}
