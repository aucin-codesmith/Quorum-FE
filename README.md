# QUORUM — Meeting Room Reservation System (Frontend Prototype)

> "Smarter Meetings, Better Collaboration."

This is a **frontend-only UI/UX prototype** of QUORUM, the employee-facing
meeting room reservation system. It is visually and interactionally
complete, but it is **not connected to a backend, database, or real
authentication** — everything is powered by local mock data and React
state so the experience feels real without a server behind it.

## Tech stack

- React 19 + Vite
- React Router DOM (client-side routing)
- Tailwind CSS v4
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).
Any email/password on the login screen will sign you in — there is no
real authentication yet.

## What's real vs. mock

| Area | Status |
|---|---|
| Navigation, layout, responsive design | Fully functional |
| Search / filter / sort on Find a Room | Fully functional (client-side) |
| Booking form + live summary + confirmation | Fully functional, writes to in-memory state only |
| Cancelling a reservation | Fully functional, in-memory only |
| Login | Mock — accepts any credentials, does not call a real API |
| Room availability / schedules | Static mock data, does not reflect real bookings |
| Toast notifications | Fully functional local UI feedback |

Reload the page and any bookings/cancellations you made will reset,
since nothing is persisted outside of React state.

## Project structure

```
src/
├── assets/
├── components/
│   ├── common/        Button, Input, Select, Badge, Modal, PageHeader,
│   │                   StatCard, EmptyState, MockNotice
│   ├── layout/         Sidebar, Header, AppLayout, Logo
│   ├── rooms/          RoomCard, FacilitiesFilter
│   └── reservations/   ReservationCard
├── pages/
│   ├── auth/           LoginPage
│   └── employee/       DashboardPage, FindRoomPage, RoomDetailPage,
│                        BookingPage, MyReservationsPage,
│                        ReservationDetailPage
├── hooks/               useToast.jsx, useReservations.jsx (React Context)
├── utils/               format.js (dates, times, status labels)
├── data/                mockData.js — single source of truth for mock data
├── routes/              AppRoutes.jsx
├── App.jsx
├── main.jsx
└── index.css            Design tokens (colors, type, shadows, motion)
```

## Connecting a real backend later

Every mutation in the prototype goes through `src/hooks/useReservations.jsx`
(`addReservation`, `cancelReservation`, `getReservation`). To wire up a real
API:

1. Replace the in-memory `useState(initialReservations)` with data fetched
   from your backend (e.g. `useEffect` + `fetch`/React Query).
2. Replace `addReservation` / `cancelReservation` with real API calls,
   keeping the same function signatures so no page component needs to change.
3. Swap `src/data/mockData.js`'s `rooms` export for a `GET /api/rooms` call.
4. Replace the mock login in `src/pages/auth/LoginPage.jsx` with a real
   auth request and token/session handling.

## Design system

- **Palette:** Ink `#313c45`, Slate `#4f6271`, Accent `#778ca4`, Mist
  `#b3bfcb`, Light `#d5dbe2` — defined as CSS variables in `src/index.css`
  and consumed as Tailwind utilities (`bg-ink-800`, `text-slate-600`, etc).
- **Type:** Manrope for UI text, Fraunces for headings/wordmark — a
  deliberate pairing to feel like a considered SaaS brand rather than a
  generic dashboard template.
- Status colors (green/amber/red) are reserved for reservation and
  availability states only.
