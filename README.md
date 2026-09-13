# API Monitor - Frontend

## Overview

API Monitor is a comprehensive API monitoring and uptime tracking platform. This repository contains the frontend application built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS**.

## Project Structure

```
api-monitor-web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/           # Dashboard routes
│   │   │   ├── services/
│   │   │   └── monitors/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/              # Reusable React components
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── services/
│   │   └── monitors/
│   ├── lib/                     # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript definitions
│   └── public/                  # Static assets
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint + Prettier
- **HTTP Client**: Axios
- **Runtime**: Node.js 18+

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Horace-web/api-monitor-web.git
   cd api-monitor-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build for production
- **`npm start`** - Start the production server
- **`npm run lint`** - Run ESLint
- **`npm run format`** - Format code with Prettier

## Backend Integration

This frontend connects to the **api-monitor-api** NestJS backend.

Backend repository: https://github.com/Horace-web/api-monitor-api

Ensure the backend API is running on: `http://localhost:3000/api`

## Features (Planned)

- [ ] User authentication (login/register)
- [ ] Dashboard with monitoring statistics
- [ ] Service management (CRUD)
- [ ] Monitor management (CRUD)
- [ ] Real-time monitoring status
- [ ] Incident alerts and notifications
- [ ] Response time analytics
- [ ] Uptime reports
- [ ] API response validation
- [ ] Custom health check endpoints

## Development Guidelines

### Code Style
- Use TypeScript for all components and files
- Follow the existing folder structure
- Use Tailwind CSS for styling
- Format code with Prettier before committing

### Naming Conventions
- Components: PascalCase (e.g., `DashboardCard.tsx`)
- Files/folders: kebab-case (e.g., `dashboard-card.tsx`)
- Types: PascalCase with `I` prefix (e.g., `IUser`)

## License

MIT

---

**Created by**: Horace-web  
**Version**: 0.1.0