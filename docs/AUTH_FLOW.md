# Authentication pages

Implemented in `frontend_1`, using the existing Django authentication endpoints. The original frontend is unchanged. See [Backend integration](BACKEND_INTEGRATION.md) for current data flow, setup, tests, and backend changes.

## Routes and behaviour

- `/login`: username and password, show/hide password, pending and error states. Successful token response is stored in session storage and navigation continues to `/dashboard`.
- `/signup`: username, email, password, and confirmation. Requires matching passwords, at least eight password characters, and a username without `@`. Successful signup opens `/verify-otp`.
- `/verify-otp`: editable email and six-digit code. The submitted signup email is remembered in session storage; passwords are never persisted. Successful verification returns to `/login?verified=true`, because the backend does not issue tokens on verification.
- Guest browsing remains available at `/discover`. No social-login providers, remember-me promise, or non-working password reset link is displayed.

The backend has password reset endpoints, but reset pages remain future work. Authenticated-user redirects, protected personal-page navigation, refresh, logout, and real dashboard data are now integrated. Events, club counts, percentage progress, and daily quote rotation remain unimplemented.

## Existing backend contract

Source of truth: `backend/Azaniah/authentication/views.py`, `serializers.py`, and `urls.py`.

| Operation | Existing route | Request fields | Success |
| --- | --- | --- | --- |
| Sign up | `POST /api/auth/signup/` | `Username`, `Email`, `Password`, `Confirm_Password` | 200; code is sent asynchronously; cached signup expires after 600 seconds |
| Verify | `POST /api/auth/verify-otp/` | `Email`, `OTP` | 201; account created, login still required |
| Log in | `POST /api/auth/login/` | `Username`, `Password` | 200; `access`, `refresh`, and `username` |

The signup response currently returns the literal `"email"` in its `Email` field. The client intentionally preserves the submitted email instead of treating that field as the verification address. No resend endpoint was found; the verification screen offers starting signup again instead of inventing one.

`NEXT_PUBLIC_API_BASE_URL` defaults to `http://127.0.0.1:8000`; `.env.example` documents it. Configure it before building for another backend. The browser must be allowed by backend CORS settings. Requests use a 20-second timeout, handle non-JSON failures, and show an error rather than claiming success when the service cannot be reached.

Session storage uses the existing client convention: `bookapp.access`, `bookapp.refresh`, `bookapp.username`. Pending verification email uses `cradle.signup-email`. Authenticated requests retry once after a shared token refresh. Invalid refresh credentials clear the session; transient service failures do not. Logout clears the local session even if its server request fails.

## Design

Split layout with a photographic reading corner, warm ivory forms, moss action buttons, serif headings, and subtle botanical decoration. Mobile stacks a compact image header above the form. No new dependencies were installed.

`public/images/auth-reading-corner.png` was generated using the built-in image-generation tool. Prompt: portrait editorial reading nook with moss velvet chair, linen throw, dark wood bookshelves, open book and ceramic cup on a side table, olive plant, tall arched window, golden garden light, ivory plaster and cocoa wood, rich shadows for separate HTML text; no people, text, logo, or UI.

## Verification and limits

Production build and TypeScript passed. Browser checks at 1440px and 390px verified the three pages render without page-width overflow, required empty fields block submission, password visibility works, mismatched signup passwords show an error without submitting, and the OTP field requires six digits. Screenshots are under ignored `.preview/`.

Subsequent integration checks ran these pages against the actual Django application on an isolated SQLite fixture database. Signup, incorrect/correct OTP, login, profile loading, token refresh, and logout passed. Email delivery was captured locally; real Gmail delivery remains unverified. No normal database accounts were created. Reproduction instructions and all verification limits are in [Backend integration](BACKEND_INTEGRATION.md).
