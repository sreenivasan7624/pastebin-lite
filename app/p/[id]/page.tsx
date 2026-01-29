import { notFound } from 'next/navigation';
import { getPaste, isPasteExpired, hasExceededViewLimit, incrementViewCount, getRemainingViews } from '@/lib/paste';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ViewPastePage({ params }: PageProps) {
  const { id } = params;
  
  // Fetch paste
  let paste = await getPaste(id);
  if (!paste) {
    notFound();
  }
  
  // Check if expired (before incrementing view)
  if (await isPasteExpired(paste)) {
    notFound();
  }
  
  // Check if view limit exceeded (before incrementing)
  if (hasExceededViewLimit(paste)) {
    notFound();
  }
  
  // Increment view count atomically
  paste = await incrementViewCount(id);
  if (!paste) {
    notFound();
  }
  
  // Get metadata for display
  const remainingViews = getRemainingViews(paste);
  const expiresAt = paste.expires_at ? new Date(paste.expires_at) : null;
  
  return (
    <div className="container">
      <div className="card">
        <h1>Paste</h1>
        <div className="paste-content">{paste.content}</div>
        {(remainingViews !== null || expiresAt) && (
          <div className="metadata">
            {remainingViews !== null && (
              <div className="metadata-item">
                <strong>Remaining views:</strong> {remainingViews}
              </div>
            )}
            {expiresAt && (
              <div className="metadata-item">
                <strong>Expires at:</strong> {expiresAt.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
