# GlowPro

GlowPro is a premium beauty and salon booking platform for Rwanda. Find and book salons and stylists, discover services, and onboard your salon with a guided multi-step wizard.

**Working domain (placeholder):**

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for bundling
- **Tailwind CSS** + **shadcn/ui** for styling and components
- **React Router v6** for navigation
- **TanStack Query v5** for data fetching
- **React Hook Form** + **Zod** for forms and validation

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |

## Project Structure

```
src/
├── assets/          # Salon images
├── components/      # Shared UI components
│   ├── biz/         # Salon onboarding & dashboard components
│   └── ui/          # shadcn/ui primitives
├── data/            # Static data (listings, categories)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── pages/           # Route-level page components
```
