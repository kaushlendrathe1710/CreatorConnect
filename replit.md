# CreatorHub - Subscription Social Platform

## Overview

CreatorHub is a subscription-based social media platform designed to empower creators to monetize their content. It merges Instagram's visual-first content feed with Patreon's subscription model, allowing creators to share exclusive content with a loyal, paying community. The platform enables users to browse public posts, follow creators, and subscribe for access to premium content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It leverages shadcn/ui (built on Radix UI and Tailwind CSS) for a modern, accessible UI. Client-side routing is handled by Wouter, and TanStack Query manages server state and data fetching. A comprehensive design system with consistent typography, spacing, and theme support (light/dark mode) is implemented.

### Backend Architecture

The backend is an Express.js server in TypeScript, structured as a monorepo sharing type definitions with the client. Authentication uses Replit Auth (OpenID Connect) with Google, Apple, GitHub, and email login options, storing sessions in PostgreSQL via `connect-pg-simple`. APIs are RESTful, organized by resource, and utilize middleware for logging, parsing, and authentication. A `storage.ts` abstraction layer manages database operations.

### Database Architecture

A PostgreSQL database, accessed via Neon serverless driver, is used with Drizzle ORM for type-safe queries. Core tables include `users`, `posts`, `follows`, `likes`, `comments`, `subscriptions`, `notifications`, and `sessions`. Strategic indexing is applied for performance.

### Payment Processing

Stripe is integrated for subscription payments and creator payouts, supporting customer/subscription management, payment intents, and webhook processing. Stripe's recommended approach is used, storing customer and subscription IDs, with Stripe Elements for secure frontend payment collection.

### File Storage

Google Cloud Storage (GCS) is used for media storage via Replit's sidecar service. A custom ACL system enforces public, private, and subscriber-only access. Signed URLs enable direct client-to-storage uploads, and Uppy is used for the upload experience.

### Security Architecture

Session-based authentication with secure HTTP-only cookies and CSRF protection is implemented. Middleware handles authorization (`isAuthenticated`). Zod schemas, derived from Drizzle, validate API input for type safety.

### Key Features

*   **Instagram-like Features**: Full implementation of Stories, Reels, Direct Messages, Video Posts, and Carousel Posts, all integrated across the stack.
*   **Admin Dashboard**: A comprehensive admin panel (accessible to a super admin and other designated admins) for user management, content moderation, and platform configuration.
*   **Instagram-Style Layout**: A three-panel layout with a left sidebar navigation, central content feed, and a right sidebar for user suggestions.
*   **Instagram-Style Profile Dashboard**: Detailed user profile pages with stats, bio, action buttons, and tabbed content (posts, analytics for creators, account details).
*   **Landing Page Redesign**: A modern, Instagram-inspired landing page designed to attract both creators and fans, highlighting platform benefits and features.
*   **Email OTP Authentication**: A custom two-step email OTP system for login, including first-time user onboarding and professional branded emails.

## External Dependencies

### Authentication & Identity
*   **Replit Auth (OIDC)**: Primary authentication.
*   **OpenID Client**: OIDC client library.
*   **Passport.js**: Authentication middleware.

### Payment Processing
*   **Stripe**: Payment infrastructure.
*   **@stripe/stripe-js**: Frontend SDK.
*   **@stripe/react-stripe-js**: React components for Stripe Elements.

### Database & ORM
*   **PostgreSQL**: Database via Neon serverless.
*   **Drizzle ORM**: Type-safe ORM.
*   **@neondatabase/serverless**: Serverless Postgres driver.

### File Storage
*   **Google Cloud Storage**: Object storage.
*   **Uppy**: File uploader.
*   **@google-cloud/storage**: GCS client SDK.

### Frontend Framework & UI
*   **React 18**: UI framework.
*   **Vite**: Build tool.
*   **Wouter**: Client-side routing.
*   **TanStack Query**: Server state management.
*   **Radix UI**: Accessible component primitives.
*   **Tailwind CSS**: CSS framework.
*   **shadcn/ui**: Component library.
*   **date-fns**: Date manipulation.

### Development Tools
*   **TypeScript**: Type safety.
*   **ESBuild**: JavaScript bundler.
*   **TSX**: TypeScript execution.
*   **Drizzle Kit**: Migration and schema management.