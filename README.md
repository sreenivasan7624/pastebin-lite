<<<<<<< HEAD
# Pastebin-Lite

A simple pastebin-like application built with Next.js and Vercel KV. Users can create text pastes with optional time-based expiry and view count limits, then share them via a simple URL.

## Features

- Create pastes with arbitrary text content
- Optional time-to-live (TTL) expiry
- Optional view count limits
- Shareable URLs with short, readable IDs
- Safe HTML rendering (XSS protection)
- Deterministic time support for testing

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Persistence**: Vercel KV (Redis-compatible)
- **Language**: TypeScript
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for KV access)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paste
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   KV_REDIS_URL=your_vercel_kv_redis_url
   KV_REDIS_REST_URL=your_vercel_kv_rest_url
   KV_REDIS_REST_TOKEN=your_vercel_kv_rest_token
   ```
   
   To get these values:
   - Go to your Vercel dashboard
   - Create a KV database
   - Copy the connection details

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Persistence Layer

This application uses **Vercel KV** (a Redis-compatible key-value store) for persistence. Vercel KV is ideal for serverless environments because:

- No connection pooling issues (each request gets a fresh connection)
- Atomic operations for view counting
- Built-in TTL support for automatic cleanup
- Seamless integration with Vercel deployments

### Storage Schema

- **Key format**: `paste:{id}`
- **Value**: JSON-serialized `PasteData` object containing:
  - `content`: The paste text
  - `ttl_seconds`: Optional TTL in seconds
  - `max_views`: Optional maximum view count
  - `created_at`: Timestamp of creation
  - `expires_at`: Optional expiration timestamp
  - `views`: Current view count

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns `{ "ok": true }` if the application can access its persistence layer.

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "string",
  "ttl_seconds": 60,      // optional, integer ≥ 1
  "max_views": 5          // optional, integer ≥ 1
}
```

Returns:
```json
{
  "id": "abc1234",
  "url": "https://your-app.vercel.app/p/abc1234"
}
```

### Get Paste (API)
```
GET /api/pastes/:id
```

Returns:
```json
{
  "content": "string",
  "remaining_views": 4,    // null if unlimited
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no TTL
}
```

Each successful API fetch counts as a view.

### View Paste (HTML)
```
GET /p/:id
```

Returns an HTML page displaying the paste content. Also increments the view count.

## Design Decisions

### Short Code IDs
- Uses 7-character alphanumeric codes (e.g., `abc1234`) instead of UUIDs
- More user-friendly and easier to share
- Collision detection with retry logic ensures uniqueness

### Atomic View Counting
- View counts are incremented using read-modify-write operations
- For low-concurrency scenarios (typical pastebin usage), this is sufficient
- The check-before-increment pattern ensures pastes become unavailable immediately when limits are reached

### Dual TTL Management
- Both KV-level TTL (for automatic cleanup) and application-level `expires_at` (for precise expiry checks)
- KV TTL handles automatic deletion of expired pastes
- Application-level check ensures precise expiry timing, especially with TEST_MODE

### Server-Side Rendering
- Paste view pages use Next.js server components for better performance and SEO
- Content is safely escaped to prevent XSS attacks
- No client-side JavaScript required for viewing pastes

### Test Mode Support
- When `TEST_MODE=1` is set, the application respects the `x-test-now-ms` header
- Allows deterministic testing of TTL expiry without waiting for real time to pass
- Only affects time-sensitive operations (expiry checks, not creation timestamps)

## Deployment

### Deploy to Vercel

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import the project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure environment variables**
   - Add `KV_REDIS_URL`, `KV_REDIS_REST_URL`, and `KV_REDIS_REST_TOKEN`
   - These should be automatically available if you created the KV database in Vercel

4. **Deploy**
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://your-project.vercel.app`

## Testing

The application supports deterministic time testing via the `TEST_MODE` environment variable:

```bash
TEST_MODE=1 npm run dev
```

Then make requests with the `x-test-now-ms` header to simulate different times:

```bash
curl -H "x-test-now-ms: 1000000000000" http://localhost:3000/api/pastes/abc1234
```

## Error Handling

- **400 Bad Request**: Invalid input (missing content, invalid TTL/max_views)
- **404 Not Found**: Paste doesn't exist, expired, or exceeded view limit
- **500 Internal Server Error**: Server-side errors (logged, generic message returned)

All errors return JSON responses with an `error` field.

## Security Considerations

- All paste content is HTML-escaped to prevent XSS attacks
- Input validation on all endpoints using Zod schemas
- No secrets or credentials in code (all via environment variables)
- Server-side rendering prevents client-side injection

## License

MIT
=======
# Pastebin
>>>>>>> 64dfef8241f27ceeaf1ce338bc2ea47382bf8ed1
