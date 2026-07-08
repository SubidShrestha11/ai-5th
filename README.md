# Letterboxd Lite

A premium cinematic social network — your personal film journal with social features, powered by a REST API and TMDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand + TanStack React Query |
| Routing | React Router v7 |
| Icons | Lucide React |
| Deploy | Vercel (static) or Docker (Vite preview) |

## Project Structure

```
├── src/
│   ├── api/          # HTTP client, services, DTO types
│   ├── hooks/
│   │   ├── queries/  # React Query hooks
│   │   └── *.ts      # UI / composed hooks
│   ├── lib/          # Mock data, utils
│   ├── providers/    # QueryClient + auth bootstrap
│   ├── store/        # Zustand stores
│   ├── types/        # App domain types
│   ├── components/
│   └── pages/
├── public/
├── Dockerfile        # Local test image (build + vite preview)
├── docker-compose.yml
└── vercel.json       # SPA routing for Vercel
```

## Environment Variables

Copy `.env.example` to `.env.local` and set your backend URL:

```env
VITE_API_BASE_URL=https://your-api-host.example.com
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes (for auth/API) | Backend REST API base URL (no trailing slash) |

## Run with Docker (no local npm needed)

### Production build + serve

```bash
docker compose build
docker compose up web
```

Open [http://localhost:4173](http://localhost:4173).

Build with custom API URL:

```bash
VITE_API_BASE_URL=https://your-api.example.com docker compose build
docker compose up web
```

### Development server (hot reload)

```bash
docker compose --profile dev up dev
```

Open [http://localhost:5173](http://localhost:5173).

### One-off Docker build

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api.example.com \
  -t letterboxd-lite .
docker run -p 4173:4173 letterboxd-lite
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Vercel auto-detects Vite from the repo root — no root directory override needed.
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_API_BASE_URL` → your production API URL
5. Deploy.

`vercel.json` includes SPA rewrites so client-side routes (`/movie/:id`, `/profile/:username`, etc.) work on refresh.

## Local development (with npm)

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Notes

- Vite embeds `VITE_*` variables at **build time**. Set them in Vercel/Docker before building.
- Authentication tokens are stored in `localStorage` (see `src/api/tokenStorage.ts`).
- TMDB poster images load from the public CDN without an API key.
