# API Monitor - Frontend

## Overview

API Monitor is a web application for monitoring API availability, response time and uptime. This repository contains the frontend built with **Next.js 14**, **React 18**, **TypeScript** and **Tailwind CSS**.

## Current state

The frontend now includes the first functional authentication flow with **Supabase Auth**:

- Registration with email/password
- Login with email/password
- Email-confirmation handling when enabled in Supabase
- Authenticated dashboard shell
- Automatic redirect to `/login` when no session exists
- Logout
- Supabase browser client
- Monitoring-oriented visual system and responsive landing/auth pages
- Monitoring favicon using the API health/heartbeat visual

The monitoring dashboard UI is intentionally still a shell. Service/monitor CRUD and real metrics will be connected to the NestJS API progressively.

## Design system

The frontend uses the following visual tokens:

| Role | Color |
| --- | --- |
| Ink | `#0B0F1A` |
| Electric | `#3D6FFF` |
| Volt | `#00E5A0` |
| Flare | `#FF4757` |
| Solar | `#FFB830` |

Typography:

- **Space Grotesk** for UI and content
- **Space Mono** for endpoints, statuses and technical data

Motion guidelines:

- `120ms` for immediate interaction feedback
- `240ms` for component transitions
- `400ms` for page/loading entrances

## Project Structure

```text
api-monitor-web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login and registration
│   │   ├── dashboard/           # Authenticated dashboard
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── icon.svg             # Monitoring favicon
│   │   └── providers.tsx
│   ├── components/              # Reusable React components
│   ├── lib/                     # Clients and utilities
│   │   └── supabase.ts          # Supabase browser client
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript definitions
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── README.md
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Fonts**: Space Grotesk + Space Mono
- **Runtime**: Node.js 18+

## Environment variables

The browser needs the Supabase project URL and the **publishable** key, so these variables intentionally use Next.js's `NEXT_PUBLIC_` prefix:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NODE_ENV=development
```

These values are suitable for browser exposure when they contain only the Supabase URL, Supabase publishable key and public API URL. **Never put a Supabase secret/service-role key, database password or other private credential in a `NEXT_PUBLIC_` variable.**

For local development:

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Backend integration

The frontend connects to the **api-monitor-api** NestJS backend.

Backend repository: https://github.com/Horace-web/api-monitor-api

Production API:

```text
https://api-monitor-api-7q9b.onrender.com
```

## Features

- [x] User registration with Supabase Auth
- [x] User login with Supabase Auth
- [x] Session-aware dashboard
- [x] Logout
- [x] Monitoring visual system
- [x] Monitoring favicon
- [ ] Service management
- [ ] Monitor management
- [ ] Real monitoring statistics
- [ ] Check-result history and charts
- [ ] Incident alerts and notifications
- [ ] Uptime reports

## Available scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm start` — Start the production server
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier

## License

MIT

---

**Created by**: Horace-web  
**Version**: 0.1.0