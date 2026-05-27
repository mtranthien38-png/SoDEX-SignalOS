# Vercel emergency fix

If `/api/status` returns HTML, Vercel is serving `public/index.html` instead of the serverless function.

Fix:

1. Delete `vercel.json` completely.
2. Commit and push.
3. Redeploy on Vercel without cache.
4. Test `/api/ping`, then `/api/status`.

Vercel automatically turns root `api/*.js` files into serverless functions. No rewrite is required for this app.
