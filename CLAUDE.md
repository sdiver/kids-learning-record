# CLAUDE.md — Kids Learning Record System

## Project Overview

A full-stack, family-focused learning management system for tracking children's educational progress. Built for home deployment (primarily Synology NAS), featuring gamified practice games, speech-recognition-based reading evaluation, and a mistake-tracking system for Chinese character learning.

**Tech stack:** Node.js + Express (backend), Vanilla HTML/CSS/JS (frontend), SQLite (database), Docker (deployment).

---

## Repository Structure

```
kids-learning-record/
├── server.js              # Single-file Express server (~900 lines) — all API routes
├── database.sql           # MySQL reference schema (SQLite is used in practice)
├── package.json           # Dependencies and npm scripts
├── Dockerfile             # Alpine Node 18 container
├── docker-compose.yml     # Docker Compose with volume-mounted DB
├── .mcp.json              # WeChat MCP integration config
├── public/                # Student/parent-facing frontend
│   ├── index.html / index.js        # Home dashboard
│   ├── practice.html / practice.js  # Interactive mini-games
│   ├── reading.html / reading.js    # Speech-recognition reading practice
│   └── mistakes.html / mistakes.js  # Mistake book (wrong characters)
├── admin/
│   ├── index.html         # Admin dashboard (password: 123456)
│   └── admin.js           # Admin logic (kids, records, points, achievements)
└── scripts/
    └── init-db.js         # One-time DB initialization helper
```

---

## Development Workflow

### Setup

```bash
npm install
npm run dev       # nodemon hot-reload (development)
npm start         # production
```

Access at `http://localhost:3000`. Admin panel at `http://localhost:3000/hub`.

### Docker

```bash
docker-compose up -d
# DB persists to ./data/kids_learning.db
```

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `JWT_SECRET` | `'your-secret-key-change-in-production'` | JWT signing key |
| `DB_PATH` / `DATABASE_PATH` | `./kids_learning.db` | SQLite file path |
| `BASE_PATH` | (none) | Reverse proxy prefix |
| `TZ` | system | Timezone (e.g. `Asia/Shanghai`) |

### No test suite is configured. Verify changes by manual testing or checking server startup logs.

---

## Architecture

### Backend (`server.js`)

All server logic lives in a single file. Key sections:

1. **Middleware stack:** helmet (CSP disabled) → CORS (all origins allowed) → rate-limiter (100 req / 15 min on `/api/`) → JSON body parser
2. **Proxy path support:** Server normalises incoming paths to handle reverse proxy prefixes (`/portal-home/app/parenting`, `/app/parenting`, `/parenting`) so the same binary works behind Synology Portal and direct access.
3. **Database init:** SQLite tables are created on startup with `CREATE TABLE IF NOT EXISTS`.
4. **API router:** All routes mounted under `/api/` (also reachable via proxy prefixes).
5. **Static serving:** `/public` → root, `/admin` → `/hub` or `/hub/`.

### Frontend

Pure vanilla JS — no build step, no bundler, no framework. Each page is self-contained (`*.html` + `*.js` pair). Pages auto-detect `API_BASE` from the current URL path to support reverse proxy deployments.

### Database (SQLite)

Tables auto-created on first run. Key tables:

| Table | Purpose |
|---|---|
| `kids` | Child profiles (name, grade, avatar, birth_date) |
| `subjects` | Learning subjects with icons/colors (8 defaults seeded) |
| `learning_records` | Session logs (kid, subject, duration, performance 1-5, mood) |
| `achievements` | Badges earned by a child |
| `points` | Points ledger (earn / spend entries) |
| `mistakes` | Per-character reading errors (status: new → practicing → mastered) |
| `users` | Auth accounts (parent / admin roles) |
| `user_kids` | Parent ↔ child relationships |
| `audit_logs` | Action audit trail |
| `custom_articles` | User-submitted reading articles (max 500 chars) |

**Point auto-calculation:** `(duration_minutes / 10) * 5` on each learning record; achievements award 50 points.

---

## API Reference

Standard response envelope:
```json
{ "success": true, "data": {}, "message": "..." }
```

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login → JWT (7-day) |
| `GET` | `/api/auth/me` | Current user (Bearer token) |
| `GET/POST` | `/api/kids` | List / create children |
| `GET/PUT/DELETE` | `/api/kids/:id` | Single child CRUD |
| `GET/POST/DELETE` | `/api/records` | Learning records |
| `GET/POST/DELETE` | `/api/subjects` | Subjects |
| `GET/POST/DELETE` | `/api/achievements` | Achievements |
| `GET/POST` | `/api/points` | Points ledger |
| `GET` | `/api/stats/:kid_id` | Aggregate stats for a child |
| `GET/POST/PUT/DELETE` | `/api/mistakes/:kid_id` | Mistake book |
| `GET` | `/api/pinyin/:char` | Pinyin lookup (800+ char dict) |
| `GET/POST/DELETE` | `/api/articles/custom` | Custom reading articles |

Auth header: `Authorization: Bearer <token>`

---

## Key Conventions

### Backend

- **SQLite callbacks** — The codebase uses the callback-style `sqlite3` API, not promises. Do not convert to async/await without updating all DB calls.
- **Prepared statements** — Always use positional `?` parameters to prevent SQL injection. Never concatenate user input into SQL strings.
- **Error responses** — Use `res.status(4xx/5xx).json({ success: false, message: '...' })`. Do not throw unhandled exceptions.
- **Console logging** — Prefix log lines with emoji for visual scanning: `✅` success, `❌` error, `📁` file ops, `🚀` startup.
- **No ORM** — Raw SQL only. Keep queries simple and readable.

### Frontend

- **No build tooling** — Do not introduce webpack, vite, or any bundler. Files are served as-is.
- **API_BASE detection** — Each JS file derives `API_BASE` from `window.location.pathname` to support proxy deployments. Preserve this pattern when adding new pages.
- **Fetch API** — Use native `fetch()` for all HTTP calls. No axios or similar.
- **Vanilla DOM** — No jQuery, no React. Use `document.getElementById`, `querySelector`, event listeners.
- **Toast notifications** — Use the existing `showToast(message, type)` helper for user feedback.
- **Modal pattern** — Reuse the existing modal/dialog HTML patterns present in each page.

### Naming

- JavaScript: `camelCase` for variables and functions
- Database columns: `snake_case`
- CSS classes: BEM-like (`block-element`, `block--modifier`)
- File names: `kebab-case` for HTML/CSS, `camelCase` for JS modules

---

## Security Notes

- **Admin password** is hardcoded as `123456` in `admin/index.html`. This is intentional for a home-network appliance but must be changed for any internet-facing deployment.
- **JWT_SECRET** must be overridden via environment variable in production.
- **CORS** is wide-open (`*`) by design — this is a private home-network service.
- **Rate limiting** is active on all `/api/` routes (100 req / 15 min per IP).
- **Helmet** is enabled but CSP is disabled to allow inline scripts in the HTML files.
- Do not add `eval()`, `innerHTML` with unsanitised user content, or dynamic `require()`.

---

## Deployment Targets

- **Synology NAS** (primary): Deploy via Docker or directly with Node. Reverse proxy through Synology Portal adds a path prefix — the server handles this automatically.
- **Docker**: `docker-compose up -d`. DB volume at `./data/`.
- **Standard Linux**: `npm start` behind nginx or similar.

The server is designed to work identically in all three environments without code changes — only environment variables differ.

### 生产服务器（Synology NAS）

| 项目 | 值 |
|---|---|
| IP | `10.147.20.30` |
| SSH 端口 | `54646` |
| 用户名 | `sdiver` |
| 项目目录 | `/volume2/docker/homegate/parent/kids-learning-record` |

**本地快速连接：**
```bash
ssh -p 54646 sdiver@10.147.20.30
```

**部署更新（推荐流程）：**
```bash
# 1. 本地推送代码到 git
git push

# 2. SSH 登录后拉取并重启容器
ssh -p 54646 sdiver@10.147.20.30
cd /volume2/docker/homegate/parent/kids-learning-record
git pull
docker-compose up -d --build
```

> 密码请自行保管，勿写入代码或配置文件。建议配置 SSH 免密登录（`ssh-copy-id`）。

---

## WeChat Integration

A WeChat MCP server is configured in `.mcp.json`. Incoming WeChat messages arrive as XML and are handled by the MCP tool layer. Reply using the `wechat_reply` tool, passing the `sender_id` from the inbound message. Keep replies in plain text (no Markdown — WeChat doesn't render it). Respond in Chinese unless the user writes in another language.

---

## Common Tasks

### Add a new API endpoint

1. Find the relevant section in `server.js` (routes are grouped by resource).
2. Add `app.get/post/put/delete('/api/your-route', ...)` following the existing callback pattern.
3. Use prepared statements for any DB queries.
4. Return `res.json({ success: true, data: ... })` on success.

### Add a new frontend page

1. Create `public/yourpage.html` and `public/yourpage.js`.
2. Copy the `API_BASE` detection snippet from an existing JS file.
3. Add a navigation link in `public/index.html` if needed.
4. No build step required — the file is served immediately.

### Change the database schema

1. Add a `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE` statement in the `initDatabase()` function in `server.js`.
2. The change applies on next server restart.
3. Update `database.sql` to keep the reference schema in sync.

### Run in development with live reload

```bash
npm run dev
```

Nodemon watches all `.js` files and restarts automatically. Frontend changes are visible immediately on browser refresh.
