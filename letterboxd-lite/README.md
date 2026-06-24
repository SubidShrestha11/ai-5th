# Letterboxd Lite

A premium cinematic social network — your personal film journal with social features, powered by the TMDB API.

## Features

- **Movie Discovery** — Trending films, curated collections, and personalised suggestions
- **Cinema Diary** — Log films you've watched with ratings, reviews, and watch dates
- **Social Feed** — See what your friends are watching in real-time
- **Friends** — Send/accept/remove friend requests, discover fellow film lovers
- **Smart Suggestions** — Algorithmic recommendations based on your taste
- **Search** — Instant fuzzy search across the full TMDB catalogue
- **Profile** — Personal diary timeline, reviews, and favourites

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Movie Data | TMDB API (falls back to mock data) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure TMDB API (optional)

The app ships with curated mock data and real TMDB poster images — no API key needed to get started.

To enable live search and full TMDB data:

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to **Settings → API** and copy your API key (v3 auth)
3. Create a `.env.local` file in the project root:

```env
VITE_TMDB_API_KEY=your_api_key_here
```

### 3. Run the dev server

```bash
npm run dev
```

## Project Structure

```
src/
├── types/          # TypeScript interfaces
├── lib/
│   ├── api/        # TMDB API client
│   ├── mockData.ts # Curated fallback data
│   └── utils.ts    # Shared utilities
├── store/          # Zustand stores (auth, movies, friends, ui)
├── hooks/          # Data-fetching hooks
├── components/
│   ├── ui/         # Button, Input, Modal, Avatar, Badge, StarRating, Toast, Spinner
│   ├── layout/     # Navbar, Layout
│   ├── auth/       # AuthModal (login + register)
│   ├── movies/     # MovieCard, MovieCarousel, FeaturedMovie, LogMovieModal, MovieDetailPanel
│   ├── social/     # FeedCard, FriendCard, SuggestedUserCard, RequestCard
│   └── search/     # SearchBar
└── pages/          # Home, MovieDetail, Search, Feed, Friends, Profile
```

## Design

- **Background**: `#070B12` Deep Space Navy
- **Surface**: `#101827` Glassy Dark Navy
- **Accents**: `#7DD3FC` Cyan · `#A78BFA` Violet
- **Type**: Source Serif 4 (headlines) · Inter (UI)
- **Style**: Glassmorphic dark cinema aesthetic

## Notes

- Authentication is **local-only** (no backend). Accounts persist in `localStorage`.
- All social features (friends, feed) use mock data seeded on first load.
- TMDB images load from the public CDN — no API key required for posters.
