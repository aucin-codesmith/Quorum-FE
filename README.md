# QUORUM — Meeting Room Reservation System (Frontend)

> "Smarter Meetings, Better Collaboration."

The web app for QUORUM, the meeting room reservation system, with an employee
area and an administrator area. It talks to the [Quorum-BE](../Quorum-BE) REST
API for everything: sign-in, rooms, users and reservations.

## Tech stack

- React 19 + Vite
- React Router DOM (client-side routing, role-based route guards)
- TanStack Query (server state: caching, loading and error states, invalidation)
- Tailwind CSS v4
- shadcn/ui (Radix base, JavaScript) for every UI primitive in `src/components/ui`
- react-hook-form + zod (form state and validation), date-fns + react-day-picker (date picker)
- sonner (toasts)
- lucide-react (icons)

## Getting started

The app needs the API running. Start it first (see `../Quorum-BE/README.md`):

```bash
cd ../Quorum-BE && docker compose up --build     # API on http://localhost:3000, demo data seeded
```

Then, in this folder:

```bash
npm install
npm run dev
```

Open the printed local URL (Vite defaults to `http://localhost:5173`). The API
only accepts browser requests from the origins listed in its `CORS_ORIGIN`
(`5173` and `5199` by default).

To point at another API, copy `.env.example` to `.env.local` and set
`VITE_API_URL`.

### Signing in

Sign in with a real account. In development the login page has buttons that
fill the seeded demo accounts (password `Password123!`):

| Account | Area |
|---|---|
| `admin@company.com` | Administrator, opens `/admin` |
| `alya.ramadhani@company.com` | Employee, opens `/dashboard` |

New employees can sign up at `/register`; administrators are created by an
admin under Users. Employees are redirected away from `/admin/*`, and
administrators away from the employee routes. The session is a JWT kept in
`localStorage` and re-checked with `GET /api/auth/me` on load; an expired or
revoked token returns you to the login page.

## How it talks to the API

| Piece | Where |
|---|---|
| Fetch client (base URL, Bearer token, `ApiError`, 401 handling) | `src/lib/api.js` |
| Query client defaults | `src/lib/queryClient.js` |
| Data hooks | `src/hooks/useRooms.js`, `useUsers.js`, `useReservations.js`, `useStats.js`, `useFacilities.js` |
| Session | `src/hooks/useAuth.jsx` |
| Server validation errors onto form fields | `src/lib/formErrors.js` |

- Lists are filtered, sorted and paginated **by the server** on the admin tables
  (search is debounced); the employee views load up to 100 rows and filter in
  the browser.
- Mutations invalidate the queries they affect, so tables, schedules and
  counts refresh on their own.
- API errors are shown in place: a duplicate email or room name appears under
  its field, a booking conflict explains which meeting holds the slot, and
  other failures become a toast. A page whose data failed to load shows a
  message with **Try again**; if the API is unreachable on reload the session
  is kept and you can retry.
- The booking form checks conflicts against the room's schedule for that day
  (`GET /api/rooms/:id/schedule`), which includes other people's bookings, and
  the API still enforces the rule on submit.
- The API nests `room` and `user` inside a reservation; the hooks flatten them
  to `roomName`, `userName` and so on, so components stay simple.

## Project structure

```
src/
├── components/
│   ├── ui/             shadcn/ui primitives (button, input, select, dialog, table, ...)
│   ├── common/         Composites built on ui/: PageHeader, StatCard, StatusBadge, EmptyState,
│   │                   ConfirmDialog, IconInput, SimpleSelect, QueryState (skeletons, errors),
│   │                   DataPagination
│   ├── layout/         Sidebar, Header, AppLayout, AuthLayout, Logo, navItems
│   ├── rooms/          RoomCard, FacilitiesFilter
│   ├── reservations/   ReservationCard, ReservationForm (shared by both areas)
│   └── admin/          RoomFormDialog, UserFormDialog, ReservationSheet, RowMenu, TableFilters
├── pages/
│   ├── auth/           Login, Register
│   ├── employee/       Dashboard, FindRoom, RoomDetail, Booking (New reservation),
│   │                   MyReservations, ReservationDetail
│   └── admin/          Overview, Rooms, Users, Reservations, NewReservation
├── hooks/              API hooks, useAuth, useToast, useDebouncedValue
├── lib/                api.js, queryClient.js, formErrors.js, utils.js (cn)
├── utils/              format.js (labels), date.js (dates, time slots, overlap)
├── routes/             AppRoutes, guards (RequireRole), homeFor
└── index.css           Design tokens and the shadcn theme mapping
```

## Scripts

```bash
npm run dev       # start Vite
npm run build     # production build
npm run lint      # oxlint
```

## Design system

The interface follows `../design-rules-meeting-room-booking.md` ("Cloud Dancer").

- **Palette:** six tokens (`ink`, `primary`, `primary-soft`, `tint`, `tint-soft`,
  `canvas`) plus muted `success` / `danger`, defined in `src/index.css`. The
  shadcn variables (`--background`, `--primary`, `--border`, ...) are mapped
  onto them, so shadcn components pick up the palette automatically. There is
  no dark theme.
- **Type:** Manrope only, weights 400–700.
- **Shape:** every radius step resolves to one value (12px); pills use
  `rounded-full`. One resting shadow and one hover shadow, tinted toward primary.
- **Colour use:** `primary` is reserved for the single main action on a screen.
  `primary-soft` is never used for text (it fails WCAG AA on `canvas`).
- **Status:** always a text label first; the coloured dot is only a secondary cue.
