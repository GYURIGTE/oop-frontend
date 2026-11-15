# BALIGYA — Seller Workspace (Frontend)

React + TypeScript + Vite front end for **BALIGYA**, a local buy-and-sell
marketplace where people list good finds, chat with buyers/sellers, and arrange
meet-ups. There is no checkout or payment flow — the platform is only about
**chatting and meeting up**.

The UI talks to a separate Laravel JSON API located in a sibling folder:
`../backend-baligya`.

---

## Requirements

- Node.js 20+
- npm 10+
- The Laravel API running (see [`../backend-baligya/README.md`](../backend-baligya/README.md))

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Copy `.env.example` to `.env` and point it at your Laravel server:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

The host/port must match whatever `php artisan serve` is using.

### 3. Start the dev server

```bash
npm run dev
```

Open <http://localhost:5173>.

### Demo account

The backend seeder creates demo users. Every seeded account uses the password
`password`.

| Email                  | Username             |
| ---------------------- | -------------------- |
| `celestine@gmail.com`  | `celestinedegamo`    |
| `joniver@gmail.com`    | `joniverpogoy`       |
| `christian@gmail.com`  | `christiansumalinog` |
| `charles@gmail.com`    | `charlesdinoy`       |
| `joniverd@gmail.com`   | `joniverdinoy`       |

Sign in with either the email **or** the username.

---

## Running frontend + backend together

Open two terminals:

```bash
# Terminal 1 — API
cd ../backend-baligya
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — UI
cd ../frontend-baligya
npm run dev
```

Make sure MySQL is running (e.g. start it from the XAMPP control panel) before
starting Laravel.

---

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR    |
| `npm run build`   | Type-check and build to `dist/`       |
| `npm run preview` | Preview the production build locally  |
| `npm run lint`    | Run ESLint                            |

---

## Project structure

```
src/
  components/      Shared UI (seller shell, auth, brand)
  context/         AuthProvider, ListingsProvider, hooks
  data/            View-model types + option lists
  layouts/         SellerLayout (sidebar + topbar shell)
  lib/
    api.ts         Fetch client, token storage, endpoint methods, ApiError
    adapters.ts    API DTO -> view-model mappers and formatters
    types.ts       API payload/response shapes
  pages/
    auth/          Sign in, sign up, forgot/reset password
    seller/        Dashboard, My Listing, Create/Edit, Market, Messages,
                   Profile, Settings
  styles/          Tailwind entry + global CSS
```

### How data flows

1. `src/lib/api.ts` performs all HTTP calls and stores the Sanctum bearer token
   in `localStorage` (`baligya.token`).
2. `AuthProvider` restores the session from `GET /auth/me` on load and exposes
   `user`, `signIn`, `signUp`, `signOut`.
3. `ListingsProvider` loads the signed-in seller's listings and caches them
   under the owner's id, so a different account never sees stale rows.
4. `src/lib/adapters.ts` maps API DTOs into the view models the components use
   (`SellerListing`, `MarketProduct`, `Conversation`, `ChatMessage`).
5. `RequireAuth` guards every `/seller/*` route.

### Images

Seeded product photos are served by the front end from `public/images/`, so
listing image URLs look like `http://localhost:5173/images/rusimotor.png`.
Photos uploaded through the app are stored by Laravel and served from
`http://127.0.0.1:8000/storage/...`.

---

## Notes

- Chat uses REST plus 5-second polling (`Messages.tsx`); no WebSockets yet.
- Multi-photo listings (up to 8) support add, replace, and remove.
- Draft listings can be saved without publishing.
- Multipart profile/listing updates are sent as `POST` with `_method=PATCH|PUT`
  because PHP does not parse multipart bodies for PATCH/PUT.
