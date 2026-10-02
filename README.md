# CodeBot

**QuillBot for programmers.** A full-stack AI coding assistant where you paste code,
pick an operation (Explain, Fix, Debug, Improve, Refactor, Optimize, Generate,
Convert, Complexity Analysis, Review, AI Chat), and get a structured AI result that is
saved to your history.

---

## Features

- **10 one-shot operations**: Explain, Fix, Debug, Improve, Refactor, Optimize,
  Generate, Convert, Complexity Analysis and Review.
- **AI Chat**: ask follow-up questions about the code currently in the editor,
  with conversation history sent back to the model for context.
- **Structured results**: each operation has its own JSON shape, validated on the
  backend and rendered with the right layout (code blocks, lists, complexity
  badges) instead of a wall of text.
- **Accounts**: email/password registration and login with bcrypt hashing and
  JWTs. Passwords and tokens are never exposed to the browser beyond the token.
- **Automatic history**: every run is saved, successes and failures alike, and is
  scoped to the owner.
- **Monaco editor** with syntax highlighting for Python, JavaScript, Java, C, C++,
  HTML, CSS and SQL.

## Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React, Vite, JavaScript/JSX, React Router, Tailwind CSS |
| Backend   | Python, FastAPI, Pydantic                               |
| Database  | MongoDB Atlas                                           |
| Auth      | JWT + bcrypt-compatible password hashing                |
| AI        | OpenAI API, backend-only access                         |
| Deploy    | Vercel (frontend), production host (backend)            |

## Repository layout

```
CodeBot/
├── backend/          # FastAPI application (Python)
├── frontend/         # React + Vite application (JavaScript)
├── docs/             # Architecture and planning notes
├── .editorconfig
└── .gitignore
```

`frontend/` and `backend/` are fully independent applications. They never import from
each other and communicate only over HTTP through `/api/*`.

---

## Prerequisites

- Node.js 20+ (developed on Node 24)
- Python 3.11+
- A MongoDB Atlas connection string
- An OpenAI API key

## Backend setup

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
# then fill in the real values in .env

uvicorn app.main:app --reload
```

The API is served at `http://127.0.0.1:8000`.

- Health check: `http://127.0.0.1:8000/api/health`
- Interactive docs: `http://127.0.0.1:8000/docs`

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

The app is served at `http://localhost:5173`.

---

## Environment variables

Secrets live in `.env` files only and are never committed.

### `backend/.env`

| Variable                       | Required | Description                                       |
| ------------------------------ | -------- | ------------------------------------------------- |
| `MONGODB_URI`                  | yes      | MongoDB Atlas connection string                   |
| `DATABASE_NAME`                | yes      | Database name, e.g. `codebot`                     |
| `JWT_SECRET`                   | yes      | Secret used to sign JWTs                          |
| `JWT_ALGORITHM`                | no       | Defaults to `HS256`                               |
| `JWT_EXPIRE_MINUTES`           | no       | Defaults to `60`                                  |
| `OPENAI_API_KEY`               | yes      | OpenAI key, used **only** on the backend          |
| `OPENAI_MODEL`                 | no       | Defaults to `gpt-4o-mini`                         |
| `OPENAI_TIMEOUT_SECONDS`       | no       | Defaults to `60`                                  |
| `CORS_ORIGINS`                 | no       | Comma-separated list of allowed origins           |
| `MAX_CODE_LENGTH`              | no       | Defaults to `20000`                               |
| `MAX_PROMPT_LENGTH`            | no       | Defaults to `2000`                                |
| `MAX_CHAT_MESSAGE_LENGTH`      | no       | Defaults to `2000`                                |
| `MAX_CHAT_HISTORY_MESSAGES`    | no       | Defaults to `20`                                  |

### `frontend/.env`

| Variable             | Description                                         |
| -------------------- | --------------------------------------------------- |
| `VITE_API_BASE_URL`  | Base URL of the backend, e.g. `http://127.0.0.1:8000` |

---

## Tests

```bash
cd backend
.\.venv\Scripts\python.exe -m pytest        # 54 tests, no network or credentials needed
```

The suite runs against an in-memory database double, so it does not touch MongoDB
or OpenAI.

### Getting the two required credentials

**MongoDB Atlas**
1. Create a free account at <https://www.mongodb.com/cloud/atlas> and a free M0
   cluster.
2. **Database Access** → add a user with a password (this is not your Atlas
   login).
3. **Network Access** → add your IP. For a demo host, `0.0.0.0/0`.
4. **Connect** → **Drivers** → copy the `mongodb+srv://...` string, replace
   `<password>` with the database user's password (URL-encoded), and paste it as
   `MONGODB_URI`.

**OpenAI**
1. Create a key at <https://platform.openai.com/api-keys>.
2. Paste it as `OPENAI_API_KEY` in `backend/.env`. It is read only by the
   backend and never reaches the browser.

Set a real `JWT_SECRET` with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Verify both credentials before starting the server:

```bash
cd backend
.\.venv\Scripts\python.exe -m scripts.check_connections
```

The command checks the settings, pings MongoDB, and makes one tiny OpenAI call.
It prints `[ OK ]` or `[FAIL]` for each and never shows a secret.

---

## Build status

| Area                            | Status      |
| ------------------------------- | ----------- |
| Project foundation, routing      | **Complete** |
| Authentication (JWT + bcrypt)    | **Complete** |
| CodeBot AI engine, 11 prompts    | **Complete** |
| History with ownership checks    | **Complete** |
| Workspace UI + Monaco editor     | **Complete** |
| Frontend/backend integration     | **Complete** |
| Backend test suite               | **Complete** |
| Deployment configuration         | Pending real credentials |

See [`docs/architecture.md`](docs/architecture.md) for design decisions and the
API surface.

## API

All endpoints are prefixed with `/api`. Protected routes expect
`Authorization: Bearer <token>`.

| Method | Path                     | Auth | Purpose                        |
| ------ | ------------------------ | ---- | ------------------------------ |
| GET    | `/health`                | no   | Liveness check                 |
| POST   | `/auth/register`         | no   | Create account, returns a JWT  |
| POST   | `/auth/login`            | no   | Exchange credentials for a JWT |
| GET    | `/auth/me`               | yes  | Current user profile           |
| GET    | `/users/me/stats`        | yes  | Dashboard summary counts       |
| POST   | `/codebot/run`           | yes  | Run one AI operation           |
| POST   | `/codebot/chat`          | yes  | Ask about the code in editor   |
| GET    | `/history`               | yes  | List own sessions (paged)      |
| GET    | `/history/{id}`          | yes  | Read one own session           |
| DELETE | `/history/{id}`          | yes  | Delete one own session         |

Interactive documentation is available at `/docs` while the backend is running.

## Screenshots

> Placeholders — add real screenshots after deployment.

| Home             | Workspace          | History            |
| ---------------- | ------------------ | ------------------ |
| _screenshot here_| _screenshot here_  | _screenshot here_  |

## Deployment

Config files are included, so each platform only needs to be pointed at the repo:

- `render.yaml` — Render blueprint for the backend (builds `backend/`, runs
  Uvicorn, health-checks `/api/health`, generates `JWT_SECRET`).
- `backend/Procfile` — start command for Railway, Heroku and similar hosts.
- `frontend/vercel.json` — Vercel build settings and the SPA rewrite so deep
  links such as `/history/:id` do not 404.

Steps:

1. **MongoDB Atlas**: create a free cluster, a database user, and allow your
   backend host's IP (or `0.0.0.0/0` for a demo). Copy the connection string into
   the backend host's environment.
2. **Backend** (Render, Railway, Fly.io, or any host that runs Python):
   - Build: `pip install -r backend/requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Set every backend variable from the table above, including
     `ENVIRONMENT=production` and a real `CORS_ORIGINS` (a wildcard is rejected
     in production).
3. **Frontend** (Vercel or Netlify):
   - Import the repo, set the root directory to `frontend/`
   - Build: `npm run build`, output directory: `dist`
   - Set `VITE_API_BASE_URL` to the deployed backend URL.

## Future improvements

- Streaming AI responses so long explanations appear as they are generated.
- Shareable read-only links for a single session.
- Per-user usage limits and richer dashboard analytics.
- More languages and an inline diff view for the Fix and Refactor operations.
- Refresh tokens so a session can outlive a single access token.