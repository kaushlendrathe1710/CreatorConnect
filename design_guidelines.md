# Design Guidelines: Subscription-Based Social Media Platform

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from Instagram's visual-first approach, combined with Patreon's creator-focused monetization UI and OnlyFans' subscription model. The platform balances content discovery aesthetics with professional creator tools.

**Core Principles**:
- Content-first visual hierarchy prioritizing creator media
- Seamless subscription flow that doesn't disrupt browsing experience
- Professional creator dashboard with approachable design
- Modern, clean aesthetic with generous whitespace

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, modern, excellent at all sizes
- Secondary: DM Sans (Google Fonts) - friendly, approachable for UI elements

**Hierarchy**:
- Hero/Display: 48px bold (mobile: 32px)
- Page Headings: 32px semibold (mobile: 24px)
- Section Titles: 24px semibold (mobile: 20px)
- Body Large: 18px regular (captions, bios)
- Body Default: 16px regular (comments, descriptions)
- Body Small: 14px regular (metadata, timestamps)
- Tiny/Labels: 12px medium (badges, counts)

## Layout System

**Spacing Primitives**: Using Tailwind units of 2, 4, 8, 12, and 16 for consistency
- Micro spacing: p-2, gap-2 (8px) - tight element grouping
- Standard spacing: p-4, gap-4 (16px) - default component padding
- Section spacing: p-8, py-12 (32px-48px) - content sections
- Large spacing: py-16, py-20 (64px-80px) - major section divisions

**Grid System**:
- Feed: 3-column grid on desktop (grid-cols-3), 2-column tablet (grid-cols-2), single column mobile
- Profile posts: 3x3 grid on all viewports (tighter on mobile)
- Max container width: max-w-6xl for main content, max-w-7xl for full-width sections
- Sidebar width: 280px fixed on desktop, full-width drawer on mobile

## Component Library

### Navigation
**Top Navigation Bar**: 
- Fixed header with max-w-7xl container
- Logo left, search center, user menu/notifications right
- Height: h-16, with shadow and backdrop blur when scrolling
- Mobile: Collapsed menu with bottom tab navigation

**Bottom Tab Bar (Mobile)**:
- Fixed bottom navigation with 5 icons: Home, Explore, Create, Notifications, Profile
- Height: h-16, elevated with shadow

### Content Cards

**Feed Post Card**:
- Full-width image/video with 1:1 aspect ratio default
- Username and profile picture header (h-14)
- Interaction bar below: like, comment, share icons (h-12)
- Caption with "Read more" truncation at 3 lines
- Timestamp and engagement counts in small text
- Subscription lock icon overlay for locked content (blurred preview)

**Profile Grid**:
- Square thumbnails (aspect-square)
- Subscription badge overlay on locked posts
- Hover state shows engagement stats overlay (desktop only)
- Gap-1 between items for tight grid aesthetic

### Subscription Components

**Subscribe Button**:
- Prominent CTA with gradient treatment (no color specified, but visually distinct)
- Shows price per month prominently
- Two states: "Subscribe" vs "Subscribed" with checkmark
- Positioned below profile bio, full-width mobile, fixed-width desktop

**Subscription Modal**:
- Center overlay with blur backdrop
- Payment form with single plan display
- Stripe Elements integration for card input
- Monthly recurring badge, auto-renewal notice
- Price breakdown and confirmation

**Creator Tier Badge**:
- Small pill badge on profile (h-6)
- Displays next to username in posts and profile
- Verified checkmark-style icon

### Forms & Inputs

**Upload Post Flow**:
- Drag-and-drop zone with preview
- Caption textarea with hashtag highlighting
- Visibility toggle: "Public" vs "Subscribers Only" with icon indicators
- Media preview with crop/filter options (Instagram-style)

**Profile Edit**:
- Large circular profile photo upload (w-24 h-24)
- Text inputs with floating labels
- Bio textarea with character counter
- Creator mode toggle switch with explanation text
- Save button sticky at bottom on mobile

### Dashboard Components

**Creator Analytics Cards**:
- Card-based layout with rounded-lg borders
- Large numbers (text-4xl) for key metrics
- Icons paired with stats
- Grid: 2x2 on desktop, stacked on mobile
- Earnings chart using simple bar/line visualization

**Subscriber List**:
- Avatar + username + subscription date
- Monthly revenue per subscriber shown
- Search and filter options
- Pagination for large lists

### Discovery & Search

**Explore Grid**:
- Masonry-style layout on desktop (Pinterest-inspired)
- Equal-height rows on mobile
- Mix of different aspect ratios (1:1, 4:5, 16:9)
- Trending hashtag chips at top

**Search Interface**:
- Full-screen overlay on mobile
- Instant results as you type
- Categorized results: Users, Posts, Hashtags
- Avatar thumbnails for users, post previews for content

## Interaction Patterns

**Gestures** (Mobile):
- Swipe left/right between feed items
- Pull to refresh on feeds
- Double-tap to like (Instagram-style)
- Long-press for post options menu

**States**:
- Loading: Skeleton screens for feed, subtle pulse animation
- Empty states: Centered illustration + encouraging message + CTA
- Error states: Inline error messages with retry option
- Success: Brief toast notifications (bottom on mobile, top-right on desktop)

## Animations

**Strategic Use Only**:
- Like heart animation: Scale up + fade when double-tap (300ms)
- Page transitions: Smooth fade (200ms)
- Modal entry: Slide up from bottom on mobile, fade scale on desktop
- Loading shimmer: Gentle pulse on skeleton screens
- NO scroll-triggered animations, NO parallax effects

## Images & Media

**Hero Section** (Landing Page):
- Full-width hero image showing diverse creators and content
- Height: 85vh on desktop, 70vh on mobile
- Overlay gradient for text readability
- CTA buttons with backdrop blur

**Profile Images**:
- Circular avatars: 40px (small), 56px (medium), 96px (large)
- Square post thumbnails: Equal aspect ratio for grid consistency
- Lazy loading for all feed images
- Progressive blur-up loading effect

**Image Descriptions for Stock Photos**:
1. Hero: Diverse content creators filming/photographing in bright, modern studio setting
2. Features section: Close-up of hands using phone showing the app interface
3. Creator spotlight: Happy creator reviewing analytics on laptop
4. Community section: Group of people engaged with content on mobile devices
5. Footer: Abstract minimalist pattern or geometric shapes

## Accessibility

- All interactive elements minimum 44px touch target
- Focus states with visible outline (2px) on all interactive elements
- ARIA labels on icon-only buttons
- Alt text required for all uploaded images
- Color contrast minimum 4.5:1 for text
- Keyboard navigation support throughout
- Screen reader announcements for dynamic content updates

## Page Structure

**Landing Page** (6 sections):
1. Hero: Value proposition + "Start Creating" / "Explore Creators" CTAs
2. How It Works: 3-column grid (Sign Up, Create, Earn)
3. Creator Showcase: Featured creators with subscriber counts
4. Features: 2-column feature list with icons
5. Pricing/Revenue Share: Transparent breakdown
6. Footer: Links, social, newsletter signup

**App Navigation Flow**:
- Home Feed (default view)
- Explore (trending/discover)
- Create/Upload (modal or full page)
- Notifications (drawer)
- Profile (own or others)
- Settings (full page)
- Creator Dashboard (if creator mode enabled)

This design system creates a polished, modern platform that prioritizes content while seamlessly integrating monetization features. The Instagram-inspired aesthetic ensures familiarity while subscription components add unique value for creators.