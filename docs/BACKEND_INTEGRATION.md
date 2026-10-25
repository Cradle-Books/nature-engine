# Backend integration: landing, dashboard, and authentication

The five pages now use the existing Django API. No dependencies were added. The original `frontend/` is unchanged. The only application change in the backend is an explicit `JWTAuthentication` declaration on `RecommendationView`, matching the other private book views; focused regression tests accompany it. Pre-existing backend changes were left intact.

## What is connected

| Page or control | API behaviour |
| --- | --- |
| Public landing book selection | `GET /api/books/trending/`; actual titles, authors, and covers with loading/error/empty states |
| Book card | `GET /api/books/book/{id}/`; real detail dialog, including page count when available |
| Signup | `POST /api/auth/signup/` with `Username`, `Email`, `Password`, `Confirm_Password` |
| Email verification | `POST /api/auth/verify-otp/` with `Email`, `OTP`; success returns to login |
| Login | `POST /api/auth/login/`; stores access/refresh tokens and opens the requested local page or dashboard |
| Dashboard greeting and statistics | `GET /api/books/profile/` |
| Current reading | `GET /api/books/library/fetch/`; first currently-reading entry in the returned library |
| Personal recommendations | `GET /api/books/recommendations/`; an empty result uses public trending with a different heading |
| Save a book | `POST /api/books/library/`; adds it to Want to Read and refreshes dashboard state |
| Reading status / Mark finished | `PATCH /api/books/library/update/{entry_id}/`; refreshed counts and shelves reflect the saved result |
| Expired access token | `POST /api/auth/token/refresh/`; one shared refresh for concurrent requests, then retry once |
| Logout | `POST /api/auth/logout/`; browser credentials and query data are cleared even when remote logout fails |

Recommendations and trending deliberately return fewer fields than full book details. Missing ratings and genres are omitted rather than fabricated. The full detail dialog retains `page_count` as `pageCount`.

## Navigation and sessions

- Signed-out visitors see `/`. Signed-in visitors opening `/`, `/login`, `/signup`, or `/verify-otp` are directed to `/dashboard` (or a validated local `next` destination).
- `/dashboard`, `/my-shelf`, `/profile`, `/settings`, and `/messages` require a validated session. Guests are directed to login with the requested destination preserved.
- Guest book browsing remains accessible. Saving requires login.
- Session validation uses the profile endpoint, not the mere presence of a token. A temporary service failure retains credentials and offers retry; invalid refresh credentials clear the session.
- Query data is cleared on identity changes and logout so another reader cannot inherit the previous reader's cached dashboard.
- Frontend guards control navigation; backend JWT authentication and ownership checks remain the security boundary. No private dashboard data is fetched into public server-rendered HTML.
- Session storage retains the existing `bookapp.access`, `bookapp.refresh`, and `bookapp.username` convention. Passwords are not persisted.

The backend currently does not enable SimpleJWT's blacklist app. Its logout endpoint accepts a token and the frontend discards it, but this alone does not revoke an already issued JWT on the server. Enabling token blacklisting is separate backend configuration/migration work, not part of this integration.

## Deliberately unavailable features

Events, club counts, book passing, percentage progress, and daily quote rotation have no backing endpoints. The dashboard shows planned/coming-soon states instead of sample activity or invented percentages; its existing quote remains static. The original design fixtures remain in source for reference but are not used by the integrated dashboard.

Discover Books, full My Shelf, and other destination pages still need their complete screens. The implemented book dialog supports API-backed details and shelf actions within the landing/dashboard scope. **Continue Reading** opens book information; Cradle does not provide an ebook reader.

## Run against your backend

1. Start the existing Django application, normally on `http://127.0.0.1:8000`.
2. In `frontend_1`, copy `.env.example` to `.env.local` if a different API URL is needed. Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin, with no `/api` suffix. It defaults to `http://127.0.0.1:8000`.
3. Run `npm run dev` and open the printed Local URL. Restart Next after changing environment variables; production builds embed public environment values at build time.
4. Ensure backend `CORS_ALLOWED_ORIGINS` includes the frontend origin. The existing defaults cover localhost/127.0.0.1 on port 3000; a different port must be configured explicitly.
5. Register, verify the code sent by the backend, then log in. Existing account credentials also work. The backend's Gmail configuration is required for real email delivery.

## Verification performed

The browser ran the actual frontend against the actual Django views, serializers, JWT implementation, and ORM on a separate local SQLite fixture database. Only mail delivery was captured locally; the normal database, real accounts, Gmail credentials, and external book providers were not used. Test books already contained complete details, so book-provider requests were unnecessary.

Passed checks:

- Public trending and guest book details, including 320-page fixture metadata.
- Guest dashboard guard and invalid credentials without a stored session.
- Signup, incorrect OTP, correct OTP, verified-login navigation, and login.
- Submitted signup email retained despite the backend response's literal `Email: "email"` field.
- New-account zero counts and explicitly labelled popular-book fallback.
- Authenticated username, recommendation save, updated shelf totals, and marking a book finished.
- Logout clears both tokens and cached account data, then returns home.
- Expired access refreshes successfully; two concurrent requests share one refresh.
- Invalid refresh clears credentials and redirects to login.
- HTML API failure, retry recovery, and a transient profile failure that preserves the session.
- Failed remote logout clears device credentials and displays an accurate notice.
- Desktop (1440px) and mobile (390px) render without page-width overflow.
- Four focused Django tests cover JWT recommendations, unauthenticated rejection, page-count/status/count consistency, and denial of changes to another reader's shelf.
- Postman request assertions checked the real isolated Django public trending response and unauthenticated recommendations rejection. The latter assertion passed; Postman still returned exit code 1 because the HTTP response was the expected 401.

The Postman simulation was prepared from local source contracts, but it could not start: the CLI lacked permission to access its local `~/.postman/` dataset files. The CLI was signed out; no remote mock was searched, published, or deployed. Its unverified artifacts remain under `postman/` for a future run. The passing browser checks above used real Django, not those mocks. Failure responses were injected only through the isolated runner's local test controls, without replacing the frontend's fetch client.

Real Gmail delivery and deployment-specific CORS, TLS, shared OTP cache, and production credentials still need environment verification.

## Reproduce the checks locally

From the repository root, start the isolated backend:

```powershell
.venv\Scripts\python.exe frontend_1\scripts\integration_backend.py
```

In a separate terminal, from `frontend_1`:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:4900'
$env:CRADLE_NEXT_DIST_DIR = '.preview/next'
npm.cmd run dev -- --port 3103
```

The optional build-directory override keeps test output separate from an existing development server. Do not set these test variables for normal development.

Start a local Chrome instance with remote debugging on port 9227 and a dedicated `.preview/integration-browser` user-data directory. Then, from `frontend_1`, using Node 22 or newer for its built-in WebSocket:

```powershell
node scripts/check-integration.cjs
node scripts/check-failures.cjs
node scripts/check-refresh.cjs
```

The isolated runner's mailbox, expiry, metrics, and failure-control paths exist only inside that runner. They are not Django project routes and must never be deployed. Its SQLite files and screenshots live in ignored `.preview/`. Restart it for a clean fixture database. Stop all test processes when finished.

Optional Postman simulation, when local dataset permissions permit:

```powershell
postman simulation run postman/simulations/cradle.sim.yaml --port 4900 --no-history --output ndjson
```

The simulation and isolated Django runner both use port 4900; run one at a time. Use the Django runner for the supplied browser regression scripts, which rely on its local test controls.
