# mini-EMR

Electronic Medical Records system with admin and patient portals.

**Live:** https://zealthy-emr-rust.vercel.app  
**Stack:** Next.js 16, TypeScript, Prisma 6, PostgreSQL (Neon), Tailwind CSS, Framer Motion and Magic UI components

## Demo Credentials

**Patient Portal** (`/`)
- `mark@some-email-provider.net` / `Password123!`
- `lisa@some-email-provider.net` / `Password123!`

**Admin Portal** (`/admin`) — no auth required

## Architecture Decisions

### Separate Portals, Shared Backend
Admin and patient portals are isolated route groups (`/admin`, `/(patient)`) with separate layouts. Shared API layer under `/api/admin` and `/api/patient`. This keeps concerns separated while reusing Prisma models and utilities.

### JWT Auth with localStorage
Stateless auth for patient portal. Token contains `patientId`, `email`, `name`. Layout checks token on mount, redirects if invalid. Chose `window.location.href` over `router.push` for login redirect to avoid React hydration race conditions.

### Recurring Appointments
Appointments support `none`, `weekly`, `monthly` repeat with optional `endDate`. Frontend calculates upcoming occurrences dynamically rather than storing each instance — keeps DB lean, makes rescheduling simple.

### Prescription Refill Logic
`refillOn` stores the next refill date. `refillSchedule` determines recurrence. Frontend auto-advances past dates to show the actual next refill. Visual urgency indicators (amber for this week, red for 3 days) are calculated client-side.

### Glassmorphism + L-Border Pattern
Consistent design language: violet primary (`#7c3aed`), amber accent (`#f59e0b`). Glass cards with `backdrop-blur`. L-shaped border hover effect (left + bottom) on interactive elements — buttons, table rows, nav items.

### Prisma 6 over 7
Downgraded from Prisma 7 due to breaking config changes in the beta. Prisma 6 is stable and sufficient.

### Component Structure
```
components/
├── admin/          # Admin-specific (forms, cards, stats)
├── patient/        # Patient-specific (read-only cards)
├── auth/           # LoginForm
└── ui/             # Shared primitives (shadcn/ui + custom)
```

### API Response Pattern
All endpoints return `{ data: T }` on success, `{ error: string }` on failure. Consistent structure simplifies frontend error handling.

## Local Setup
```bash
npm install
cp .env.example .env    # Add DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Project Structure
```
src/
├── app/
│   ├── (patient)/        # Patient portal (auth required)
│   ├── admin/            # Admin portal
│   └── api/              # REST endpoints
├── components/
├── lib/                  # Prisma client, auth utils, validation
└── types/                # Shared TypeScript interfaces
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Patient authentication |
| GET/POST | `/api/admin/patients` | List/create patients |
| GET/PUT/DELETE | `/api/admin/patients/[id]` | Patient CRUD |
| GET/POST | `/api/admin/appointments` | List/create appointments |
| PUT/DELETE | `/api/admin/appointments/[id]` | Appointment CRUD |
| GET/POST | `/api/admin/prescriptions` | List/create prescriptions |
| PUT/DELETE | `/api/admin/prescriptions/[id]` | Prescription CRUD |
| GET | `/api/patient/dashboard` | 7-day summary |
| GET | `/api/patient/appointments` | Patient's appointments |
| GET | `/api/patient/prescriptions` | Patient's prescriptions |

## Validation Rules

- **Name:** First and last name required
- **Email:** Valid format, unique per patient
- **Password:** 8+ chars, uppercase, lowercase, special char, no consecutive chars, no name inclusion
- **Appointments:** Future dates only, end date must be after start
- **Prescriptions:** Refill date cannot be in past

## Future Improvements

### Features
- **Admin Authentication** — Role-based access with admin login
- **Appointment Notifications** — Email/SMS reminders for upcoming appointments
- **Prescription Refill Requests** — Patients can request refills through the portal
- **Patient Profile Editing** — Allow patients to update contact info
- **Audit Logging** — Track all CRUD operations for compliance

### Code Quality
- **Shared Types** — Extract duplicated interfaces to `src/types/index.ts`
- **Date Utilities** — Consolidate `isSameDay`, `getDaysUntil`, `getUpcomingDates` into `src/lib/date-utils.ts`
- **API Helpers** — Create `successResponse`, `errorResponse`, `unauthorizedResponse` utilities to reduce boilerplate
- **Custom Hooks** — Extract fetch logic into `usePatientApi` hook for consistent data fetching
- **Error Boundaries** — Add React error boundaries for graceful failure handling
- **Testing** — Unit tests for validation logic, integration tests for API endpoints

### Performance
- **React Query / SWR** — Replace manual fetch with caching and background refetching
- **Optimistic Updates** — Immediate UI feedback on mutations
- **Pagination** — Paginate patient list and appointment/prescription tables for scale
---

Built by [Prajwal Gangadhar Melinamane](https://prajwalgm.tech)
