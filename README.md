# VVCE Connect

VVCE Connect is a Next.js campus portal for Vidyavardhaka College of Engineering. It brings together student, faculty, warden, COE, and admin workflows in one app with Supabase-backed auth and data access.

## Features

- Authentication flows for login, signup, forgot password, and password reset
- Role-based dashboards for students, faculty, wardens, COE, and admins
- Exam duty allocation and announcements
- Hostel, tutoring, hackathon, and profile workflows
- Supabase server, browser, and admin clients for authenticated data access
- Email verification support through Resend

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Resend for transactional email

## Prerequisites

- Node.js 18+ or 20+
- npm
- A Supabase project
- A Resend API key if you want verification emails to send in production

## Environment Variables

Create a `.env.local` file in the project root with these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the browser and server Supabase clients.
- `SUPABASE_SERVICE_ROLE_KEY` is required for admin-only server actions and callback flows that upsert profiles.
- `RESEND_API_KEY` is optional locally, but email verification will be skipped without it.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your environment variables to `.env.local`.

3. Apply the SQL schema updates in the repository to your Supabase database as needed.

4. Start the development server:

```bash
npm run dev
```

The dev script uses Webpack with polling so it works reliably on arm64 Macs in this workspace.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the production app
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Deployment

The easiest deployment path is Vercel.

1. Push your latest changes to GitHub.
2. Import the repository into Vercel.
3. Set the environment variables from `.env.local` in the Vercel project settings.
4. Use the default build settings, or set:
   - Build command: `npm run build`
   - Output directory: default Next.js output
5. Deploy and verify the production URL.

If you use Supabase auth callback URLs, make sure your Supabase project includes the production domain in its allowed redirect URLs.

## Repository Layout

- `src/app` - app routes, layouts, and pages
- `src/lib` - Supabase and email helpers
- `src/utils/supabase` - browser, server, and middleware clients
- `src/services` - domain-specific Supabase services
- `schema.sql` and the `*_schema_updates.sql` files - database and permission updates

## Local Notes

- Port 3000 may already be in use, so Next may fall back to 3001 during development.
- If the dev server is watching too many files in your editor, the project is already configured to use polling-based file watching.
