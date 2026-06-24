# LetterboxLite

A social media platform for movies. Users can log and review films they've watched, connect with friends, browse what friends are watching, and get algorithmic movie suggestions — all through a clean REST API.

---

## What is LetterboxLite?

LetterboxLite is a lightweight alternative to Letterboxd. A user registers, logs in, and starts building their movie diary — every film they've watched, paired with a personal review. They can send and accept friend requests, browse their friends' movie logs, and discover new films through an algorithmic suggestions engine. A social feed surfaces recent activity from friends in real time.

Movies are sourced from a public API (TMDB or similar), so there's no need to manually curate a film database.

---

## Feature List

### Auth
- **Register** — create an account with email and password
- **Login** — authenticate and receive an access token

### Movies
- **Movie search & browse** — sourced from a public movie API (TMDB)
- **Log a movie** — add a watched film to your personal diary with a date
- **Review a movie** — attach a public written review and rating to a log entry
- **View logs** — browse your own or another user's movie diary

### Friends
- **Send friend request** — request to connect with another user
- **Accept / decline request** — manage incoming friend requests
- **View friends** — list all current friends
- **Remove friend** — unfriend a user

### Discovery
- **Algorithmic suggestions** — personalised movie recommendations based on your log history and your friends' activity
- **Friend activity feed** — chronological feed of what friends have recently watched and reviewed

---

## Progress

### Completed
- [x] Project scaffolded (Django 5.1)
- [x] `.cursorrules` — coding conventions and session context
- [x] `.cursorignore` — Cursor indexing exclusions
- [x] `.gitignore`
- [x] `README.md`
- [x] Custom `User` model (UUID pk, email login, bio, profile image) extending `AbstractBaseUser`
- [x] `AUTH_USER_MODEL` configured in settings
- [x] DRF + SimpleJWT installed and configured (JWT auth, token blacklist, global `IsAuthenticated`)
- [x] `users` app — full auth layer:
  - `POST /api/v1/auth/register/` — register, returns user + JWT tokens
  - `POST /api/v1/auth/login/` — login, returns user + JWT tokens
  - `POST /api/v1/auth/logout/` — blacklists refresh token
  - `GET /api/v1/users/me/` — get own profile
  - `PATCH /api/v1/users/me/` — update bio / profile image
- [x] Migrations applied

### In Progress
- [ ] `movies` app — TMDB integration, movie logs, reviews

### Pending
- [ ] `friends` app — friend requests, friend list, removal
- [ ] `feed` app — friend activity feed
- [ ] `suggestions` app — algorithmic movie recommendations
- [ ] `core` app — shared exception handler, pagination
- [ ] Tests for `users` app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12 |
| Framework | Django 5.1.1 |
| API | Django REST Framework 3.15.2 |
| Auth | SimpleJWT 5.3.1 (Bearer tokens, refresh rotation + blacklist) |
| Database (dev) | SQLite |
| Image handling | Pillow 10.4.0 |

---

## Project Structure

```
letterboxlite/
├── letterboxlite/          # Project config (settings, urls, wsgi)
├── users/                  # Auth, registration, user profiles
├── movies/                 # Movie search, logs, reviews (TMDB integration)
├── friends/                # Friend requests, friend list, removal
├── feed/                   # Friend activity feed
├── suggestions/            # Algorithmic movie recommendations
├── core/                   # Shared utilities, base classes, exception handler
│   ├── exceptions.py
│   └── pagination.py
├── manage.py
├── requirements.txt
├── .env                    # Local environment variables (never committed)
├── .env.example            # Example env template (committed)
├── .cursorrules            # Cursor AI rules and session context
├── .cursorignore           # Files excluded from Cursor indexing
├── .gitignore
└── README.md
```

Each app owns exactly one domain. Every app follows this internal structure:

```
<app>/
├── models.py
├── serializers.py
├── views.py
├── services.py
├── validators.py
├── constants.py
├── urls.py
└── tests.py
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd letterboxlite
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Start the development server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/`.

---

## API Overview

All endpoints are versioned under `/api/v1/`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register/` | Register a new user |
| `POST` | `/api/v1/auth/login/` | Login and receive access token |
| `POST` | `/api/v1/auth/logout/` | Invalidate token |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/movies/search/` | Search movies from public API |
| `GET` | `/api/v1/movies/<id>/` | Get movie details |
| `GET` | `/api/v1/movies/logs/` | List your movie logs |
| `POST` | `/api/v1/movies/logs/` | Log a watched movie |
| `GET` | `/api/v1/movies/logs/<id>/` | Get a specific log entry |
| `PATCH` | `/api/v1/movies/logs/<id>/` | Update a log (add/edit review) |
| `DELETE` | `/api/v1/movies/logs/<id>/` | Remove a log entry |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/friends/request/` | Send a friend request |
| `PATCH` | `/api/v1/friends/request/<id>/` | Accept or decline a request |
| `GET` | `/api/v1/friends/` | List all friends |
| `DELETE` | `/api/v1/friends/<id>/` | Remove a friend |
| `GET` | `/api/v1/friends/<id>/logs/` | View a friend's movie logs |

### Feed & Suggestions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/feed/` | Friend activity feed |
| `GET` | `/api/v1/suggestions/` | Personalised movie suggestions |

---

## Development Conventions

This project enforces the following rules (see `.cursorrules` for full details):

- **Todo first** — a task plan is created before any code is written
- **DRF conventions** — all API code uses DRF classes, `Response`, and status constants
- **SOLID principles** — single responsibility, open/closed, liskov, interface segregation, dependency inversion
- **Validation in serializers** — all input validation lives in `validate_<field>()` / `validate()` methods
- **Thin views** — views only call a service/serializer and return a response
- **Service layer** — business logic lives in `services.py`, never in views
- **No N+1 queries** — always use `select_related` / `prefetch_related`
- **Versioned URLs** — all endpoints prefixed with `/api/v1/`
- **Paginated lists** — no endpoint returns an unbounded list

---

## Running Tests

```bash
python manage.py test
```

Or with pytest:

```bash
pytest
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | Yes | `True` for local dev, `False` in production |
| `DATABASE_URL` | No | Defaults to SQLite in dev |
| `TMDB_API_KEY` | Yes | API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api) |

---

## Contributing

1. Create a feature branch from `main`
2. Follow all conventions in `.cursorrules`
3. Ensure all new endpoints have tests (success, unauthenticated, invalid input)
4. Open a pull request with a clear description
