# CodeBot architecture

Design notes for the project, written so the reasoning can be explained in an
interview.

## 1. Why a split frontend / backend?

The frontend and the backend are two separate applications with separate
dependencies and separate deploy targets.

- The frontend is a static bundle (React) deployed to Vercel.
- The backend is a Python process deployed to a host that can run FastAPI.
- They talk over plain HTTP using JSON.

The hard rule that follows from this: **the OpenAI API key never reaches the
browser.** Every AI call is made from the backend, so the key stays in a
server-side environment variable.

## 2. Backend layering

```
backend/app/
├── main.py             # Application entry point, CORS, lifespan, routers
├── core/
│   ├── config.py       # All environment variables, read once at startup
│   ├── database.py     # Async PyMongo client, collections, indexes
│   └── security.py     # bcrypt hashing + JWT create/verify
├── models/             # Documents as stored in MongoDB
├── schemas/            # Pydantic request/response models
├── prompts/            # One module per AI operation
├── services/
│   ├── ai_service.py     # The only module that calls OpenAI
│   ├── codebot_service.py# Operation -> prompt -> OpenAI -> validation -> save
│   ├── history_service.py# Owner-scoped reads and deletes
│   └── user_service.py   # User lookups and registration
├── utils/
│   ├── validators.py     # Cross-field input limits
│   └── response_parser.py# Extract and validate JSON from a model reply
└── api/
    ├── dependencies.py   # get_current_user, bearer auth
    └── routes/           # HTTP layer only: parse, call service, shape response
```

The important boundary: **route files never call OpenAI or MongoDB directly.**
They validate input with Pydantic, delegate to a service, and return a response
model. That keeps business logic testable without HTTP.

## 3. AI architecture

One giant prompt is the failure mode this design avoids. Each operation gets its
own module in `app/prompts/`:

| Module         | Operation           |
| -------------- | ------------------- |
| `explain.py`   | Explain             |
| `fix.py`       | Fix                 |
| `debug.py`     | Debug               |
| `improve.py`   | Improve             |
| `refactor.py`  | Refactor            |
| `optimize.py`  | Optimize            |
| `generate.py`  | Generate            |
| `convert.py`   | Convert             |
| `complexity.py`| Complexity Analysis |
| `review.py`    | Review              |
| `chat.py`      | AI Chat             |

`services/codebot_service.py` looks up the module by operation name, builds the
prompt, calls the OpenAI chat completions API requesting JSON output, and
validates the reply against a Pydantic model. If validation fails, the request
fails loudly rather than storing malformed data. `utils/response_parser.py`
copes with a reply that is fenced or wrapped in prose before giving up.

The model is `gpt-4o-mini`: fast and inexpensive, which matters for a tool where
a user may run dozens of operations.

## 4. Database

Two collections.

**`users`**

| Field          | Type     | Notes                        |
| -------------- | -------- | ---------------------------- |
| `_id`          | ObjectId |                              |
| `name`         | string   |                              |
| `email`        | string   | Unique index, lowercased     |
| `password_hash`| string   | bcrypt, never returned       |
| `created_at`   | datetime |                              |
| `updated_at`   | datetime |                              |

**`code_sessions`**

| Field             | Type     | Notes                                  |
| ----------------- | -------- | -------------------------------------- |
| `_id`             | ObjectId |                                        |
| `user_id`         | ObjectId | Indexed. Owner of the session.         |
| `operation`       | string   | Validated against the supported list   |
| `language`        | string   | Validated against the supported list   |
| `target_language` | string   | Only for `convert`                     |
| `source_code`     | string   |                                        |
| `input_prompt`    | string   |                                        |
| `result`          | object   | Structured AI result                   |
| `status`          | string   | `success` or `error`                   |
| `created_at`      | datetime | Indexed with `user_id` for sorting      |
| `updated_at`      | datetime |                                        |

Every run is saved automatically, so history is always complete without the user
clicking anything.

## 5. Security model

- Passwords are hashed with bcrypt using a per-password salt. Plaintext passwords
  are never stored or logged.
- Login returns a signed JWT. Protected endpoints read it from the
  `Authorization: Bearer <token>` header.
- **Every** history query filters by `user_id`. Reading or deleting a session
  that belongs to another user returns `404`, not `403`, so the endpoint does not
  confirm that someone else's session even exists.
- Inputs are validated before use: operation must be in the supported list,
  language must be in the supported list, code length is capped.
- The API key lives only in the backend environment.
- CORS is restricted to configured origins instead of `*`.
- Unexpected errors return a generic message. Stack traces stay on the server.

## 6. API surface

| Method | Path                     | Auth | Purpose                     |
| ------ | ------------------------ | ---- | --------------------------- |
| GET    | `/api/health`            | no   | Liveness check              |
| POST   | `/api/auth/register`     | no   | Create account              |
| POST   | `/api/auth/login`        | no   | Exchange credentials for JWT|
| GET    | `/api/auth/me`           | yes  | Current user profile        |
| GET    | `/api/users/me`          | yes  | Current user profile        |
| GET    | `/api/users/me/stats`    | yes  | Dashboard summary counts    |
| POST   | `/api/codebot/run`       | yes  | Run an AI operation         |
| POST   | `/api/codebot/chat`      | yes  | Ask about the code in editor|
| GET    | `/api/history`           | yes  | List own sessions           |
| GET    | `/api/history/{id}`      | yes  | Read one own session        |
| DELETE | `/api/history/{id}`      | yes  | Delete one own session      |

Request body for a run:

```json
{
  "operation": "explain",
  "language": "python",
  "target_language": null,
  "code": "...",
  "prompt": "..."
}
```

## 7. Frontend routes

| Path            | Page           |
| --------------- | -------------- |
| `/`             | Home           |
| `/login`        | Login          |
| `/register`     | Register       |
| `/dashboard`    | Dashboard      |
| `/workspace`    | Workspace      |
| `/history`      | History        |
| `/history/:id`  | HistoryDetail  |
| `/profile`      | Profile        |
| `*`             | NotFound       |

Authenticated routes are wrapped by a `ProtectedRoute` component that redirects
to `/login` when there is no valid token.

## 8. Testing strategy

Backend tests run against an in-memory database double (`tests/conftest.py`)
that implements only the PyMongo operations the services use, and OpenAI is
replaced by a fake. The suite therefore needs no network and no credentials, and
it still covers the real service logic: validation, ownership filtering, token
verification and error mapping.