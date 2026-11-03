# E-commerce storefront

## Deploy to Vercel

Deploy this repository as two Vercel projects. Deploy the backend first so you
can use its URL in the frontend project.

### Backend project

1. Import the repository in Vercel and set **Root Directory** to `backend`.
2. Leave the framework/build settings on automatic detection. Vercel detects
   the Express app exported from `src/app.js`; no `vercel.json` is needed.
3. Add these environment variables in **Project Settings → Environment
   Variables** for each environment you deploy:

   | Variable | Value |
   | --- | --- |
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | A new, long random secret |
   | `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
   | `FRONTEND_URL` | `https://e-commerce-livid-iota-45.vercel.app` |

4. Deploy the backend and use its stable project domain,
   `https://e-commerce-ppfl.vercel.app`, for frontend requests.

### Frontend project

1. Import the same repository as another Vercel project and set **Root
   Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build`, output directory
   `dist`, and install command `npm install`.
3. `frontend/vercel.json` proxies `/api/*` requests to the stable backend
   domain. Production frontend requests stay same-origin, avoiding browser CORS.
4. Deploy the frontend to `https://e-commerce-livid-iota-45.vercel.app`. No
   `VITE_API_BASE_URL` variable is needed for production.

If the backend domain changes, update the rewrite destination and redeploy the
frontend. The backend still accepts direct cross-origin requests for other
clients, as configured in its CORS middleware.

### MongoDB and browser settings

- In MongoDB Atlas, configure Network Access for your Vercel backend. Prefer
  Vercel static egress or another restricted egress setup where available;
  avoid opening database access to every IP unless you understand the risk.
  Use a least-privilege database user.
- Frontend API calls are proxied through the frontend Vercel domain, so auth
  cookies are first-party in the browser.
- Rotate any credentials that were previously committed in the repository.
  Set the replacements only in Vercel environment variables; never commit
  `.env` files.

## Local development

Start the backend from `backend` with `npm run dev` and the frontend from
`frontend` with `npm run dev`. Set `MONGODB_URI`, `JWT_SECRET`, and
`IMAGEKIT_PRIVATE_KEY` in the backend process environment. Locally, Vite proxies
`/api` requests to `http://localhost:3000`, so `VITE_API_BASE_URL` can be left
unset.
