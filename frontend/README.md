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
   | `FRONTEND_URL` | Exact frontend origin, such as `https://your-store.vercel.app` |

4. Deploy and copy the backend deployment URL.

### Frontend project

1. Import the same repository as another Vercel project and set **Root
   Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build`, output directory
   `dist`, and install command `npm install`.
3. Add `VITE_API_BASE_URL` with the backend URL from the previous step, without
   a trailing slash. For example: `https://your-api.vercel.app`.
4. Deploy or redeploy the frontend after setting this variable.

Vite embeds `VITE_*` variables during the build, so changing the backend URL
requires a new frontend deployment. Set `FRONTEND_URL` to the exact frontend
origin for each environment; the backend accepts comma-separated origins if
you need more than one.

### MongoDB and browser settings

- In MongoDB Atlas, configure Network Access for your Vercel backend. Prefer
  Vercel static egress or another restricted egress setup where available;
  avoid opening database access to every IP unless you understand the risk.
  Use a least-privilege database user.
- Since separate Vercel domains are cross-site, the backend sets its auth
  cookie with `SameSite=None; Secure` in production and allows credentialed
  CORS requests only from `FRONTEND_URL`. For the most reliable browser cookie
  behavior, attach frontend and backend custom domains under the same site
  (for example, `shop.example.com` and `api.example.com`), then update both
  environment variables and redeploy.
- Rotate any credentials that were previously committed in the repository.
  Set the replacements only in Vercel environment variables; never commit
  `.env` files.

## Local development

Start the backend from `backend` with `npm run dev` and the frontend from
`frontend` with `npm run dev`. Set `MONGODB_URI`, `JWT_SECRET`, and
`IMAGEKIT_PRIVATE_KEY` in the backend process environment. Locally, Vite proxies
`/api` requests to `http://localhost:3000`, so `VITE_API_BASE_URL` can be left
unset.
