# ICT Service Hub — Diocese of Kalookan

Internal platform for ICT support and media service requests, built for the Diocese of Kalookan. Optimized for the Supabase Free Tier and Vercel Hobby Plan.

## Project Overview

*   **Purpose:** Centralized ticketing system for ICT staff and media service requests (live streaming, photography, videography).
*   **Target Audience:** Parish staff, clergy, and diocesan employees (requesters) and ICT Department staff (admins).
*   **Key Features:** RBAC (Role-Based Access Control), ticket lifecycle management, internal notes, automated email notifications (via Resend), audit logs, and spam protection.

## Tech Stack

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS + SSR)
*   **Email Notifications:** [Resend](https://resend.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
*   **Styling:** [Vanilla Tailwind CSS](https://tailwindcss.com/) with a Navy/Gold/Slate theme.

## Project Structure

*   `app/`: Next.js App Router routes.
    *   `(user)/`: Requester portal (Dashboard, Tickets, Notifications).
    *   `(admin)/`: ICT Staff/Admin portal (Ticket Management, User Management, Audit Logs).
    *   `auth/`: Authentication pages (Login, Signup, Password Reset).
    *   `api/`: API routes for administrative actions and auth callbacks.
*   `components/`: Reusable React components.
    *   `ui/`: Generic UI components (Navbar, PageHeader, Badges, etc.).
    *   `tickets/`: Ticket-specific components (Submit Form, Detail view).
    *   `admin/`: Admin-specific components (Usage Monitor, Action buttons).
*   `lib/`: Core logic and utilities.
    *   `actions/`: Next.js Server Actions for all data mutations.
    *   `supabase/`: Supabase client configurations (server-side with SSR, and admin with service_role).
    *   `email/`: Email templates and Resend integration logic.
    *   `validations/`: Zod schemas for form and data validation (sanitization included).
*   `supabase/`: Database schema (`schema.sql`) and migration files.
*   `types/`: TypeScript definitions, including a robust `Database` interface in `database.ts`.

## Development Conventions

### Roles and Permissions (RBAC)
*   **requester:** Default role. Can create and view their own tickets and notifications.
*   **ict_staff:** Can manage all tickets, add internal notes, and assign tickets.
*   **ict_admin:** Staff privileges + user management.
*   **super_admin:** Full system access, including promoting other admins.
*   Permissions are enforced via:
    1.  **Middleware:** Handles redirects based on role and auth status.
    2.  **Database RLS (Row Level Security):** Policies in `supabase/schema.sql` ensure data-level security.

### Data Management
*   **No File Uploads:** To stay within Supabase Free Tier limits, the system uses external archive links (Google Drive, OneDrive, etc.).
*   **Sanitization:** Zod schemas in `lib/validations/schemas.ts` include HTML stripping and character replacement for all text inputs.
*   **Server Actions:** Prefer Server Actions in `lib/actions/` for all data mutations.
*   **Audit Logs:** Critical actions (status changes, role changes) are logged in the `audit_logs` table via the Admin client.

### Code Style
*   **TypeScript:** Strict typing is mandatory. Use the `Database` type for all Supabase operations.
*   **Fonts:** Uses `next/font/google` for Inter font.
*   **Linting:** Project is clean of ESLint errors. Use `npm run lint` before committing.
*   **Type Safety:** Avoid `any` where possible. In cases where Supabase internal types conflict with custom interfaces, use targeted `as any` with ESLint ignore comments.

## Key Commands

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Runs ESLint for code quality checks.
*   `npm run type-check`: Runs TypeScript compiler checks.
*   `npm run db:types`: Generates TypeScript definitions from the Supabase schema.

## Maintenance Notes

*   **Database Cleanup:** Monthly cleanup of read notifications older than 30 days is recommended.
*   **Rate Limiting:** Active in `middleware.ts`. Defaults: 300 requests/min for general routes, 60 requests/min for auth routes.
*   **Domain Verification:** Resend requires a verified domain to send emails in production.
