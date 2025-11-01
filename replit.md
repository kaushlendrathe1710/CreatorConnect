# CreatorHub - Subscription Social Platform

## Overview

CreatorHub is a subscription-based social media platform that enables creators to monetize their content through monthly subscriptions. The platform combines Instagram's visual-first feed design with Patreon's creator monetization model, allowing creators to share exclusive content with subscribers while building a loyal community. Users can browse public posts, follow creators, and subscribe to access premium subscriber-only content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, using Vite as the build tool and bundler.

**UI Framework**: The application uses shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. This provides accessible, customizable components with a modern design system following the "New York" style variant.

**Routing**: Client-side routing is handled by Wouter, a minimal routing library. The application has distinct routes for authenticated and unauthenticated users, with a landing page for guests and feed/profile/dashboard pages for logged-in users.

**State Management**: TanStack Query (React Query) manages server state and data fetching with built-in caching and synchronization. Authentication state is handled through a custom `useAuth` hook that queries the user endpoint.

**Design System**: The application follows a comprehensive design system with:
- Typography using Inter and DM Sans fonts
- Spacing primitives based on Tailwind's 8px grid system
- Theme support (light/dark mode) with CSS custom properties
- Consistent elevation patterns for interactive elements

### Backend Architecture

**Server Framework**: Express.js server written in TypeScript, following a monorepo structure where client and server code share type definitions.

**Authentication**: Implements Replit Auth using OpenID Connect (OIDC) for authentication. The system supports Google, Apple, GitHub, and email-based login. Sessions are stored in PostgreSQL using connect-pg-simple, with a 7-day session lifetime.

**API Design**: RESTful API endpoints organized by resource type (users, posts, comments, subscriptions, notifications). The server uses middleware for logging, request parsing, and authentication checks.

**Data Access Layer**: A storage abstraction layer (`storage.ts`) provides a clean interface for database operations, making the codebase more maintainable and testable.

### Database Architecture

**Database**: PostgreSQL database accessed through Neon serverless driver with WebSocket support for connection pooling.

**ORM**: Drizzle ORM provides type-safe database queries with schema definitions in TypeScript. The schema uses UUID primary keys and includes proper foreign key relationships with cascade deletes.

**Core Tables**:
- `users`: Stores user profiles, creator status, subscription pricing, and Stripe integration details
- `posts`: Content posts with visibility flags (public vs subscriber-only)
- `follows`: User following relationships
- `likes`: Post likes
- `comments`: Post comments
- `subscriptions`: Stripe subscription records linking subscribers to creators
- `notifications`: User activity notifications
- `sessions`: Server-side session storage for authentication

**Indexes**: Strategic indexes on foreign keys and frequently queried fields (username, email, post timestamps) for performance.

### Payment Processing

**Stripe Integration**: Handles subscription payments and creator payouts. The architecture supports:
- Customer creation and management
- Subscription creation with pricing plans
- Payment intent handling for subscription setup
- Webhook processing for subscription lifecycle events

**Implementation Pattern**: Uses Stripe's recommended approach with customer IDs stored in the users table and subscription IDs tracked in the subscriptions table. The frontend uses Stripe Elements for secure payment collection.

### File Storage

**Object Storage**: Google Cloud Storage integration through Replit's sidecar service for storing user-uploaded media (images and videos).

**Access Control**: Custom ACL (Access Control List) system built on top of GCS that enforces visibility rules:
- Public objects accessible to all users
- Private objects restricted to the owner
- Subscriber-only objects accessible to active subscribers

**Upload Flow**: Uses signed URLs for direct client-to-storage uploads, reducing server load and improving upload performance. The `ObjectUploader` component wraps Uppy for a polished upload experience.

### Security Architecture

**Authentication Security**: 
- Session-based authentication with secure HTTP-only cookies
- CSRF protection through same-site cookie settings
- Session secrets stored in environment variables

**Authorization Pattern**: Middleware-based authentication checks (`isAuthenticated`) protect sensitive endpoints. Object access uses a policy-based system evaluated at request time.

**Data Validation**: Zod schemas derived from Drizzle table definitions validate incoming data on API endpoints, ensuring type safety and preventing malformed requests.

## External Dependencies

### Authentication & Identity
- **Replit Auth (OIDC)**: Primary authentication provider supporting multiple identity providers (Google, Apple, GitHub, email)
- **OpenID Client**: OIDC client library for authentication flows
- **Passport.js**: Authentication middleware for Express

### Payment Processing
- **Stripe**: Complete payment infrastructure including customer management, subscriptions, and webhook handling
- **@stripe/stripe-js**: Frontend Stripe SDK for payment forms
- **@stripe/react-stripe-js**: React components for Stripe Elements integration

### Database & ORM
- **PostgreSQL**: Primary database via Neon serverless
- **Drizzle ORM**: Type-safe ORM with schema management
- **@neondatabase/serverless**: Serverless Postgres driver with WebSocket support

### File Storage
- **Google Cloud Storage**: Object storage for media files
- **Uppy**: Modern file uploader with dashboard UI, progress tracking, and AWS S3-compatible uploads
- **@google-cloud/storage**: GCS client SDK

### Frontend Framework & UI
- **React 18**: UI framework with modern hooks and concurrent features
- **Vite**: Fast build tool and development server
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management with caching
- **Radix UI**: Accessible component primitives (40+ components including dialogs, dropdowns, popovers, tooltips)
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library on Radix UI
- **date-fns**: Date formatting and manipulation

### Development Tools
- **TypeScript**: Type safety across full stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **Drizzle Kit**: Database migration and schema management tool