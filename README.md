# Aura Health EMR

[![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

A production-ready full-stack application built on Cloudflare Workers, featuring a reactive frontend with React, TanStack Query, and shadcn/ui, powered by Durable Objects for scalable stateful storage.

## Overview

Aura Health EMR is a modern Electronic Medical Records (EMR) system template designed for healthcare applications. It leverages Cloudflare's edge computing for zero-cold-start backend services, global state management via Durable Objects, and a performant React frontend. The app demonstrates user management, chat boards for patient-provider communication, and extensible entity-based architecture.

## Key Features

- **Edge-Native Backend**: Hono router with Durable Objects for multi-tenant storage (Users, Chats, Messages).
- **Indexed Entities**: Automatic listing, pagination, CRUD operations, and seeding for scalable data management.
- **Reactive Frontend**: Vite + React 18, TanStack Query for data syncing, shadcn/ui components.
- **Type-Safe Full-Stack**: Shared TypeScript types between worker and frontend.
- **Global Distribution**: Durable Objects handle state with automatic migration and high availability.
- **Modern UI/UX**: Tailwind CSS, dark mode, responsive design, animations.
- **Developer Experience**: Hot reload, Bun scripts, Wrangler deployment, ESLint/TypeScript strict.
- **Extensible**: Add new entities/routes easily without modifying core files.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript
- **Frontend**: React 18, Vite, TanStack Query, React Router, shadcn/ui, Tailwind CSS, Lucide Icons
- **State/Data**: Indexed Durable Objects (CAS transactions), Immer for mutations
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript 5.8
- **UI Libraries**: Radix UI, Framer Motion, Sonner (toasts), class-variance-authority
- **Other**: Zod validation, date-fns, UUID, error reporting

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Cloudflare Account](https://dash.cloudflare.com) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`bunx wrangler@latest`)

### Installation

1. Clone/fork the repo.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Generate Worker types (if needed):

   ```bash
   bun run cf-typegen
   ```

### Development

Start the dev server (frontend + worker proxy):

```bash
bun run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api/*`
- Edit `src/pages/HomePage.tsx` for your UI.
- Add routes/entities in `worker/user-routes.ts` and `worker/entities.ts`.

### Build

```bash
bun run build
```

Outputs static assets and worker bundle.

## Usage

### API Endpoints

All APIs return `{ success: boolean; data?: T; error?: string }`.

- **Users**:
  - `GET /api/users?cursor=&limit=10` - List users (paginated)
  - `POST /api/users` - `{ name: string }`
  - `DELETE /api/users/:id`
  - `POST /api/users/deleteMany` - `{ ids: string[] }`

- **Chats**:
  - `GET /api/chats?cursor=&limit=10` - List chats
  - `POST /api/chats` - `{ title: string }`
  - `GET /api/chats/:chatId/messages` - List messages
  - `POST /api/chats/:chatId/messages` - `{ userId: string; text: string }`
  - `DELETE /api/chats/:id`
  - `POST /api/chats/deleteMany` - `{ ids: string[] }`

Frontend uses `src/lib/api-client.ts` for typed fetches.

### Extending

1. **New Entity**: Extend `IndexedEntity` in `worker/entities.ts`.
2. **New Routes**: Add to `export function userRoutes(app)` in `worker/user-routes.ts`.
3. **Seed Data**: Update `static seedData` and shared types.
4. **UI Pages**: Add routes in `src/main.tsx`, use TanStack Query + `api()` helper.

## Deployment

1. **Login to Cloudflare**:

   ```bash
   bunx wrangler@latest login
   ```

2. **Deploy**:

   ```bash
   bun run deploy
   ```

   Or via UI: [![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

3. **Custom Domain** (optional):
   ```
   wrangler deploy --var ASSETS_URL:https://your-pages-domain.pages.dev
   ```

4. **Environment Variables**: Set in Wrangler dashboard.

**Production Notes**:
- Assets served via Cloudflare Pages (auto-configured).
- Durable Objects auto-migrate.
- Global replication for low-latency worldwide.

## Architecture

```
Frontend (Vite/React) → Workers (Hono + Durable Objects) → SQLite Storage
                       ↑
                   GlobalDurableObject (multi-tenant KV-like)
```

- **Entities**: One DO per entity instance, indexed for listing.
- **Concurrency**: CAS transactions prevent race conditions.
- **Offline-First**: Frontend caching via TanStack Query.

## Contributing

1. Fork & PR.
2. Run `bun run lint`.
3. **Do not modify**: `worker/index.ts`, `worker/core-utils.ts`.

## License

MIT. See [LICENSE](LICENSE) for details.

---

Built with ❤️ on Cloudflare Workers. Questions? [Cloudflare Docs](https://developers.cloudflare.com/workers/)