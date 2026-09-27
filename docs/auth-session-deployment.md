# Auth session deployment

## Production browser route

The installed iOS PWA must call the API through the frontend origin:

```text
https://edutrack-fe.vercel.app/api/auth/*
  -> Next.js rewrite
https://edutrack-be.onrender.com/api/auth/*
```

The browser-facing auth path must remain `/api/auth/*`. Login, OTP verification
and refresh responses set a host-only refresh cookie with `Path=/api/auth`; the
cookie has no explicit `Domain`. When Vercel proxies the response, the browser
therefore stores the cookie for `edutrack-fe.vercel.app` and sends it to the
same-origin `/api/auth/refresh` request after the PWA is reopened.

Other `/api/*` calls can continue going directly to Render with the bearer access
token. Keeping uploads and PDF responses off the Vercel auth proxy avoids an
unnecessary proxy hop and preserves their current behavior.

Calling Render directly from the Vercel page makes the refresh cookie third-party.
iOS Safari and standalone PWAs may block or discard that cookie even when it uses
`SameSite=None; Secure`, so direct cross-site calls are not a reliable persistence
mechanism.

The auth rewrite must forward `Set-Cookie` unchanged and use the exact backend API
path. Browser auth requests should use `credentials: "include"`.

## Render environment

Use these values in production:

```env
NODE_ENV=production
FRONTEND_URL=https://edutrack-fe.vercel.app
JWT_REFRESH_COOKIE_NAME=edutrack_refresh_token
JWT_REFRESH_COOKIE_SECURE=true
JWT_REFRESH_COOKIE_SAME_SITE=none
JWT_REFRESH_EXPIRATION=7d
```

`JWT_REFRESH_COOKIE_SAME_SITE=none` keeps direct clients compatible during the
proxy rollout. After every deployed client uses the same-origin proxy, `lax` is a
stricter valid setting. `Secure` must stay enabled in production.

After switching an existing installation from the Render URL to the Vercel proxy,
the user may need to log in once. That first login creates the refresh cookie on
the frontend host; later PWA launches can restore the session from it.

## Verification

1. Log in from the installed PWA.
2. In the login response, verify `Set-Cookie` includes `HttpOnly`, `Secure`,
   `SameSite=None`, `Path=/api/auth`, and an `Expires` value.
3. Close the PWA completely, reopen it, and verify `POST /api/auth/refresh`
   returns `200` through the Vercel `/api` route.
4. Verify logout clears the cookie with the same path, secure and SameSite
   attributes.
