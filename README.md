# Cradle ? frontend_1

Independent Next.js frontend. Visual direction comes from the root `design/` images, not the existing frontend. The original `frontend/` is untouched. Backend integration uses the existing Django architecture; see `docs/BACKEND_INTEGRATION.md` for the small JWT authentication fix and validation.

## Scope
The public landing page is at `/`, based on `design/landing-page.png`. The design board's surrounding palette, typography notes, and brand presentation are intentionally excluded from the website. The shared foundation preview stays at `/foundations`. `/dashboard` implements the reader home design with authenticated API data. `/login`, `/signup`, and `/verify-otp` have complete form designs and request handlers for the existing backend. Other reader destinations remain placeholders. The actual frontend-to-Django flow has been checked on an isolated fixture database. Real Gmail delivery and deployment configuration remain environment checks.

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
