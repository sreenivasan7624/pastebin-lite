'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const body: any = { content };
      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError('TTL seconds must be an integer ≥ 1');
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttl;
      }
      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError('Max views must be an integer ≥ 1');
          setLoading(false);
          return;
        }
        body.max_views = views;
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        setLoading(false);
        return;
      }

      setSuccess(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('Failed to create paste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Pastebin-Lite</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Create a paste and share it with a simple link. Optionally set expiration time or view limits.
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            <strong>Paste created successfully!</strong>
            <div className="url-display">
              <strong>Share this URL:</strong>{' '}
              <a href={success.url} target="_blank" rel="noopener noreferrer">
                {success.url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(success.url);
              }}
              style={{ marginTop: '0.5rem' }}
            >
              Copy URL
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter your paste content here..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="ttl_seconds">TTL (Time To Live) in seconds (optional)</label>
            <input
              type="number"
              id="ttl_seconds"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              min="1"
              placeholder="e.g., 3600"
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              Paste will expire after this many seconds
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="max_views">Max Views (optional)</label>
            <input
              type="number"
              id="max_views"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              min="1"
              placeholder="e.g., 10"
            />
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              Paste will become unavailable after this many views
            </small>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}
