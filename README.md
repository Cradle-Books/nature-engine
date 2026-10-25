# Cradle ? frontend_1

Independent Next.js frontend. Visual direction comes from the root `design/` images, not the existing frontend. The original `frontend/` is untouched. Backend integration uses the existing Django architecture; see `docs/BACKEND_INTEGRATION.md` for the small JWT authentication fix and validation.

## Scope
The public landing page is at `/`, based on `design/landing-page.png`. The design board's surrounding palette, typography notes, and brand presentation are intentionally excluded from the website. The shared foundation preview stays at `/foundations`. `/dashboard` implements the reader home design with authenticated API data. `/login`, `/signup`, and `/verify-otp` have complete form designs and request handlers for the existing backend. Discover Books, book details, My Shelf, Profile, and Settings now use live API data; Community now supports reader connections; Book Clubs, Messages, and Pass Books On remain placeholders. The actual frontend-to-Django flow has been checked on an isolated fixture database. Real Gmail delivery and deployment configuration remain environment checks.

See [Backend integration](docs/BACKEND_INTEGRATION.md) for setup and repeatable checks. See [Authentication pages](docs/AUTH_FLOW.md) for the request contract, environment configuration, design assets, and verification limits. Product proposals at the project root include [Upcoming Events](../UPCOMING_EVENTS_FEATURE.md) and [Daily Reading Quote](../DAILY_READING_QUOTE_FEATURE.md).

## Development
Next.js dependencies are installed locally. The Next.js version is pinned in `package.json`.

Run `npm run dev`, then visit the Local URL printed by Next.js. On Windows where PowerShell blocks npm scripts, use `npm.cmd run dev`. Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Visual conventions
Tokens and primitives live in `app/globals.css`; reusable React primitives in `components/ui.tsx` and `components/tabs.tsx`; shell in `components/app-shell.tsx`. Colours are approximate samples from screenshot references. Georgia provides a local serif face, with system sans-serif for body text, avoiding network font dependencies. Final typography should be compared in browser against the references.

The botanical SVG is an original decorative approximation. Screenshot photographs and exact artwork are not available as separate assets. Shared mobile navigation collapses at 760px; page-specific grids have their own breakpoints. Remaining full page designs and API integrations are subsequent work.

## Landing page assets and fidelity

`app/landing.css` scopes the public landing design independently of the reader shell. The landing navigation collapses at 700px. Community card artwork is displayed through CSS windows into `public/images/landing-reference.png`. The book row now uses the public trending API with real covers and accessible cover placeholders. Selecting a book opens an API-backed detail dialog, and saving requires login.

`public/images/reading-nook.png` was created using the built-in image-generation tool, with the supplied landing design as its reference. Prompt: recreate only the wide reading-nook photograph, no text or UI; dark moss sofa on the left, aged books, olive mug, leafy plant, wooden window and distant green hills on the right; golden afternoon light, cocoa shadows, organic Earth & Moss palette, dark left space for HTML headings. It is a recreation, not the original photo. Fonts, logo, and feature icons are approximations pending visual refinement. Browser screenshot verification could not complete because local Chrome encountered graphics-process restrictions; the production build, TypeScript, and route HTTP checks passed.

## Dashboard

`/dashboard` follows `design/dashboard'.png`: quote banner, four journey cards, five book recommendations, current reading, upcoming events, and a book-passing promotion. The greeting, reading counts, library, and recommendations now use the API. Empty recommendations use explicitly labelled popular books. Events, club counts, book passing, and percentage progress show unavailable/planned states instead of sample activity. The quote stays static pending the Daily Reading Quote feature.

The book-cover art is displayed through CSS windows into the supplied `public/images/dashboard-reference.png` (617 × 407), so its resolution is limited. All UI text and controls are HTML. The banner and promotion assets were generated with the built-in image-generation tool:

- `public/images/dashboard-reading-room.png`: prompt — recreate the reference banner as a wide 3:1 photographic vintage reading room; golden sun through a window, moss chair, wooden table, old books, ceramic mug and leafy plants; darker left space for HTML text; no text, borders or UI.
- `public/images/dashboard-book-stack.png`: prompt — isolated transparent vintage watercolor/ink illustration of moss, cocoa and ochre books with aged ivory pages and an olive branch in a small pottery vase; compact corner composition; no text, borders, floor or background.

Generated artwork follows the reference but is not identical. Browser checks at 390px and 1440px verified no page-width overflow, the mobile book rail, event dialog opening/closing, and mobile navigation opening and closing with Escape. Browser screenshots are kept under ignored `.preview/`. No dependencies were added. See the integration document for backend changes and newer browser-to-Django checks.


## My Shelf, Profile, and Settings

`/my-shelf` supports status filters (including dashboard query links), title/author search, sorting, reading-status changes, personal ratings, and confirmed removal. Book links open the full detail page. No percentage progress is invented.

`/profile` edits personal information and saves favourite genres and public/private visibility under Profile preferences. Public profiles accept new follows immediately; private profiles require approval. Basic reader metadata remains discoverable, and existing followers are unchanged. Interests come from the new `GET /api/auth/genres/` endpoint, so deploy the backend change too; the picker reflects the stored Genre rows.

`/settings` supports password changes and logout. Theme and book-description text size persist in this browser, not in the account. Notification controls are marked unavailable until a persistence API exists. Profile images and reading goals are not presented as working features.

Implementation, API examples, privacy semantics, deployment notes, and reproducible tests are documented in [Reader page integration](../backend/docs/READER_PAGES.md). TypeScript and the production build passed. Browser checks against local synthetic API fixtures passed shelf/profile/settings mutations and 390px/768px layouts; separate Django tests verified actual backend persistence and follow behavior.


## Community and book-reader activity

`/community` supports exact-username reader search, following/followers, incoming request approval/decline, sent-request cancellation, follow-back actions, and confirmed unfollow. Public follows are accepted immediately; private follows remain pending until approved. The sidebar uses actual followers rather than fabricated suggested users. Posts/discussions/events remain marked as future features.

Book details now display up to five recent shelf updates with public handles, dates, reader counts, and links into Community. Both public and private profiles are included, as requested. Your own activity links to your Profile. The backend resolves account handles without exposing sign-in emails, and shelf mutations refresh book activity. `page_count` continues to display as Pages.

Redeploy both backend and frontend for the safe activity fields and additive `outgoing_pending` connections field. See [Community API integration](../backend/docs/COMMUNITY.md) for payloads, relationship IDs, privacy behavior, and reproducible tests. Browser checks covered follow/request decisions, error states, book-reader links, and 390px/768px layouts using synthetic local API fixtures.
