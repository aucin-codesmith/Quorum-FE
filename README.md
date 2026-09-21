# QUORUM — Meeting Room Reservation System (Frontend Prototype)

> "Smarter Meetings, Better Collaboration."

This is a **frontend-only UI/UX prototype** of QUORUM, the meeting room
reservation system, with an employee area and an administrator area. It is visually and interactionally
complete, but it is **not connected to a backend, database, or real
authentication** — everything is powered by local mock data and React
state so the experience feels real without a server behind it.

## Tech stack

- React 19 + Vite
- React Router DOM (client-side routing, role-based route guards)
- Tailwind CSS v4
- shadcn/ui (Radix base, JavaScript) for every UI primitive in `src/components/ui`
- react-hook-form + zod (form state and validation), date-fns + react-day-picker (date picker)
- sonner (toasts)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).
Any email/password on the login screen will sign you in — there is no
real authentication yet. The email decides the area:

| Email | Signs in as |
|---|---|
| contains `admin` (e.g. `admin@company.com`) | Administrator, opens `/admin` |
| an existing user's email (see Users in the admin area) | That user |
| anything else | Alya Ramadhani, employee, opens `/dashboard` |

Inactive users are refused. Employees are redirected away from `/admin/*`, and
administrators away from the employee routes.

## What's real vs. mock

| Area | Status |
|---|---|
| Navigation, layout, responsive design | Fully functional |
| New reservation form (validation, date picker, double-booking check) | Fully functional, in-memory |
| Admin: manage rooms, users and reservations (create, edit, status, delete) | Fully functional, in-memory |
| Admin: overview and monitoring (rooms right now, today's bookings, utilisation) | Derived live from the reservation data |
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
├── components/
│   ├── ui/             shadcn/ui primitives (button, input, select, dialog, table, ...)
│   ├── common/         Composites built on ui/: PageHeader, StatCard, StatusBadge,
│   │                   EmptyState, ConfirmDialog, IconInput, SimpleSelect, MockNotice
│   ├── layout/         Sidebar, Header, AppLayout (employee and admin), Logo, navItems
│   ├── rooms/          RoomCard, FacilitiesFilter
│   ├── reservations/   ReservationCard, ReservationForm (shared by both areas)
│   └── admin/          RoomFormDialog, UserFormDialog, ReservationSheet, RowMenu
├── pages/
│   ├── auth/           LoginPage
│   ├── employee/       Dashboard, FindRoom, RoomDetail, Booking (New reservation),
│   │                   MyReservations, ReservationDetail
│   └── admin/          Overview, Rooms, Users, Reservations, NewReservation
├── hooks/              useAuth, useRooms, useUsers, useReservations, useToast
├── utils/              format.js (labels), date.js (dates, time slots, overlap)
├── data/               mockData.js — single source of truth for mock data
├── routes/             AppRoutes, guards (RequireRole), homeFor
├── lib/utils.js        cn() class merger
└── index.css           Design tokens and the shadcn theme mapping
```

## Connecting a real backend later

State lives in four React Context stores, each with the mutations a real API
would expose:

| Hook | Mutations |
|---|---|
| `useRooms` | `addRoom`, `updateRoom`, `deleteRoom` |
| `useUsers` | `addUser`, `updateUser`, `deleteUser` |
| `useReservations` | `addReservation`, `updateReservation`, `cancelReservation`, `completeReservation`, `deleteReservation`, `findConflict` |
| `useAuth` | `login`, `logout` |

To wire up a real API, replace the in-memory `useState(initial…)` in each hook
with fetched data and swap each mutation for an API call, keeping the same
function signatures so no page component needs to change. Reservations store
only `roomId` / `userId`; room and user names are resolved on read. The
double-booking rule (`findConflict`) and the "can't delete a room or user with
upcoming reservations" guards should be enforced server-side as well.

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
