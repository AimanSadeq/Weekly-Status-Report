# VIFM Activity Tracker — Deployment Guide

## Overview

This is a Node.js/Express web application with a Supabase (PostgreSQL) backend. It serves static HTML files and exposes a REST API. No build step is required.

---

## Requirements

- **Node.js** >= 16.0.0 (recommended: 18 or 20 LTS)
- **npm** >= 8.0.0
- **Supabase** project (already provisioned — credentials provided separately)

---

## Repository

```
https://github.com/AimanSadeq/Weekly-Status-Report.git
Branch: main
```

---

## Environment Variables

Create a `.env` file in the project root (or set these in your hosting platform's environment settings):

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL (e.g. `https://xxxxx.supabase.co`) |
| `SUPABASE_KEY` | Yes | Supabase anon/public API key |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens. Use a strong random string (32+ chars). |
| `PORT` | No | Server port (default: `3000`) |
| `NODE_ENV` | No | Set to `production` for production deployments |
| `APP_URL` | No | The public URL of the app (used for CORS). Set to `*` or your domain. |
| `SENDGRID_API_KEY` | No | SendGrid API key for email notifications. Emails are disabled if not set. |
| `SENDGRID_FROM_EMAIL` | No | Sender email for notifications (default: `noreply@viftraining.com`) |
| `DEFAULT_PASSWORD` | No | Default password for new employees created via admin panel (default: `Vifm2025!`) |

**Note:** `JWT_SECRET` is critical — the server will refuse to start without it. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Steps

### 1. Clone the repository

```bash
git clone https://github.com/AimanSadeq/Weekly-Status-Report.git
cd Weekly-Status-Report
```

### 2. Install dependencies

```bash
npm install --production
```

### 3. Set environment variables

Either create a `.env` file in the project root or configure them in your hosting platform. Contact Aiman for the Supabase credentials and JWT secret.

### 4. Start the server

```bash
npm start
```

The server will start on the configured `PORT` (default 3000) and log:
```
VIFM Activity Tracker Server running on port 3000
```

### 5. Verify

- Visit `http://<your-domain>/` — should show the login page
- Visit `http://<your-domain>/api/health` — should return `{"status":"ok"}`

---

## Platform-Specific Notes

### Render
- **Build command:** `npm install`
- **Start command:** `npm start`
- Set environment variables in the Render dashboard
- Use a **Web Service** (not Static Site)

### Railway
- Auto-detects Node.js. Just connect the GitHub repo.
- Set environment variables in Settings > Variables

### Azure App Service / AWS Elastic Beanstalk
- Standard Node.js deployment
- Ensure the `PORT` environment variable is set by the platform (both Azure and AWS do this automatically)

### Docker (if needed)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Database

The database is hosted on **Supabase** (managed PostgreSQL). No database setup is needed — all tables and migrations have already been applied. The application connects via the Supabase JavaScript client using `SUPABASE_URL` and `SUPABASE_KEY`.

---

## Architecture

```
vif-activity-tracker/
├── server/
│   ├── index.js          # Express app entry point
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Database abstraction layer
│   ├── routes/            # API route handlers
│   ├── services/          # Audit logging, notifications
│   └── jobs/              # Scheduled cron jobs (weekly email digest)
├── public/                # Static frontend files (served by Express)
│   ├── index.html         # Main employee dashboard
│   ├── admin-management.html  # Admin panel
│   ├── calendar.html      # Calendar view
│   ├── reports.html       # Report builder
│   └── auth-helpers.js    # Shared auth utilities
├── package.json
└── .env
```

- **No build step** — the frontend is vanilla HTML/JS served as static files
- **No separate frontend server** — Express serves both API and static files
- **Single process** — one `npm start` runs everything (API + static files + cron jobs)

---

## User Access

All employees log in with their `@viftraining.com` email address.

- **Current default password:** `Vifm2025!`
- Users can change their password after logging in (via the menu in the header)
- Admins can reset any employee's password from the Admin Panel > Employees tab

---

## Health Check

`GET /api/health` returns:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

Use this for load balancer health checks or uptime monitoring.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Server won't start: "JWT_SECRET not set" | Set the `JWT_SECRET` environment variable |
| Login fails: "User not found" | Employee needs to be added via the Admin Panel |
| Login fails: "Account not set up" | Admin needs to reset the employee's password |
| Emails not sending | Check that `SENDGRID_API_KEY` is set and valid |
| 401 errors on API calls | JWT token expired — user needs to log in again (tokens expire after 24 hours) |
