# DARUL HIJRA — Arabic & Islamic College Portal

A modern, responsive school portal and website for Darul Hijra Arabic & Islamic College built with React 19, TanStack Start, TypeScript, Tailwind CSS v4, and Supabase.

---

## 🌟 Key Features

1. **Public College Website (`/`)**:
   - Hero banner with campus highlights and values (*Faith · Knowledge · Character*).
   - Academic pillars: Qur’an & Tajweed, Arabic Language & Literature, Islamic Studies & Fiqh.
   - Live published news & campus events with graceful fallback.
   - Fully responsive mobile drawer navigation and admissions CTA.

2. **Student & Parent Registration (`/register`)**:
   - Multi-field application form including academic programme choice and prior schooling.
   - Automatic integration with Supabase Auth and the `admissions` table.
   - Direct session detection with one-click portal entrance.

3. **Authentication & Access Control (`/auth`)**:
   - Email/password authentication and resilient Google OAuth fallback.
   - Password reset request with instant toast notifications.
   - **Instant Demo Access**: Test and preview the portal as **Admin**, **Teacher**, or **Student** with one click without configuring credentials.

4. **School Management Portal (`/dashboard`)**:
   - **Overview Dashboard**: High-level metrics for learners, teachers, classes, and admissions with today's campus operations schedule.
   - **Directory Modules**:
     - 🎓 **Students**: Admission ID, learner names, class assignments, academic status.
     - 👥 **Teachers**: Faculty IDs, instructors, specializations, employment status.
     - 🏫 **Classes**: Class levels, assigned rooms, weekly schedules.
     - 📖 **Subjects**: Curriculum codes, English and Arabic subject titles, descriptions.
     - 📋 **Results**: Assessment records, academic terms, scores, distinction remarks.
     - 📝 **Admissions**: Applicant lists, contact info, status management (Pending ➔ Accepted / Reviewing / Declined).
     - 💳 **Fees**: Fee schedules, payments, dues, and one-click "Mark Paid" actions.
     - 📰 **News & Announcements**: Campus press releases, categories, publication state.
     - 📅 **Events**: Upcoming gatherings, dates, times, and venue locations.
   - **Interactive Functionality**:
     - Real-time search across all directories.
     - **Add Record Modal Dialog**: Add learners, faculty, classes, subjects, results, fees, news, and events.
     - Dynamic Supabase database sync with offline demo fallback.
     - Record deletion and status updates with instant feedback.
     - Responsive mobile drawer navigation.

5. **Password Reset (`/reset-password`)**:
   - Supports both PKCE query parameters and recovery hash tokens.
   - Password confirmation and validation with feedback.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
A `.env` file is provided in the project root. To link to your live Supabase project, update the credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

*(If environment variables are omitted or placeholders are used, the application gracefully functions in demo preview mode).*

### 3. Database Migrations (Supabase)
Run the SQL migration scripts in `drizzle/migrations/` inside your Supabase SQL Editor:
1. `0000_create_darul_hijra_school_system.sql` — Creates tables, RLS policies, roles, triggers.
2. `0001_secure_role_function_permissions.sql` — Hardens role checks and security definer functions.
3. `0002_seed_initial_data.sql` — Populates foundational classes, subjects, news, and events.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 5. Production Build & Linting
```bash
npm run build      # Verifies TypeScript compilation and Nitro production build
npm run lint       # Runs ESLint code quality checks
npm run format     # Formats all source files with Prettier
```

---

## 📂 Project Architecture

```
darul-hijra-full-code/
├── src/
│   ├── routes/
│   │   ├── __root.tsx            # Global layout shell, fonts, Sonner toaster
│   │   ├── index.tsx             # Public landing page & mobile navigation
│   │   ├── auth.tsx              # Portal login & demo preview access
│   │   ├── register.tsx          # Student admission registration
│   │   ├── reset-password.tsx    # Password recovery (PKCE & hash support)
│   │   └── _authenticated/
│   │       ├── route.tsx         # Route guard (Supabase auth & demo mode)
│   │       └── dashboard.tsx     # Full school management portal
│   ├── components/ui/            # shadcn/ui components (Dialog, Badge, Button, etc.)
│   ├── integrations/
│   │   └── supabase/             # Resilient Supabase client, types & middleware
│   └── styles.css                # Tailwind CSS v4 design tokens & Islamic patterns
├── drizzle/migrations/           # SQL migration scripts and seed data
└── vite.config.ts / tsconfig.json
```
