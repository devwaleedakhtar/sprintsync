# SprintSync Frontend

SprintSync is a modern, AI-powered internal tool for engineers to log work, track time, and get LLM-powered daily planning. This frontend is built with Next.js, React, and Tailwind CSS, and is designed for clarity, speed, and cloud deployment.

---

## Scenario

A fast-moving AI consultancy needs a lean internal tool—SprintSync—so its engineers can log work, track time, and lean on an LLM for quick planning help. The repo also serves as a reference for clean, modular frontend architecture and thoughtful UX.

---

## Features

- **Authentication**: NextAuth.js (Credentials provider, JWT, session management)
- **Task Management**: Kanban board, create/edit/delete, time tracking
- **AI Daily Planning**: Generate and view daily plans with LLM streaming
- **Modern UI**: Tailwind CSS, Headless UI, Heroicons
- **Forms**: react-hook-form for robust validation
- **Responsive**: Works on desktop and mobile

---

## Stack

- **Next.js 15**
- **React 19**
- **Tailwind CSS 4**
- **NextAuth.js 5 (beta)**
- **react-hook-form**
- **@headlessui/react** (UI primitives)
- **@heroicons/react** (icons)
- **react-markdown** (rendering markdown)
- See [`package.json`](./package.json) for all packages.

---

## Project Structure

```
frontend/
  src/
    app/
      components/   # UI components (Kanban, DailyReport, TaskForm, etc.)
      page.tsx      # Main entrypoint
      lib/          # API helpers
      globals.css   # Tailwind/global styles
      layout.tsx    # App layout
    middleware.ts   # Auth middleware
  public/           # Static assets
  .env.example      # Environment variable template
  package.json
  tailwind.config.js
  next.config.ts
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values as needed.

---

## Running Locally

```sh
npm install
npm run dev
# Open http://localhost:3000
```

---

## Linting & Formatting

```sh
npm run lint
```

---

## Deployment

- Ready for Vercel, Netlify, or any Node.js host.
- Configure your backend API URL and environment variables as needed.

---

## User Flow

1. **Sign Up / Sign In** (NextAuth, credentials)
2. **Create Tasks** (with markdown description, time estimate)
3. **View Kanban Board** (drag/drop, edit, delete)
4. **Generate Daily Plan** (AI-powered, markdown preview)
5. **Review Daily Plan History**

---

## Reference Implementation

SprintSync is designed as a reference for:

- Modern Next.js app structure
- Clean, modular React components
- Secure, full-stack authentication
- LLM integration
