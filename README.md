## 🏡 Flex Reviews Dashboard

### A modern full-stack review management system built for the **Flex Living Developer Assessment**

**Project:** Flex Reviews Dashboard  
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Node.js API Routes  
**Author:** **Chiedozie Ezidiegwu**  
**Assessment:** Flex Living — Developer Practical Assessment

The **Flex Reviews Dashboard** is a mini Property Management System (PMS) designed to streamline how Flex Living managers review, analyze, normalize, and approve guest feedback.  

This solution includes:

- **Review Normalization** — Converts raw Hostaway-style review data into clean, structured, per-property groups.  
- **Manager Dashboard** — A modern, intuitive UI for filtering, sorting, inspecting, and approving guest reviews.  
- **Public Property Review Pages** — Approved reviews automatically appear on dynamic property detail pages, styled closely to the Flex Living website.  
- **Mocked Hostaway API Integration** — Includes a fallback dataset replicating the real Hostaway response structure.  
- **Optional Google Reviews Exploration** — Aligned with the task’s stretch goals.

This project demonstrates clean architecture, production-ready component design, server/client route integration, and strong UI/UX practices suitable for real-world Flex Living applications.

***

## Project summary
- A manager-facing Reviews Dashboard for Flex Living that:

- ingests and normalizes Hostaway review JSON (mocked / sandboxed),

- groups reviews per property,

- allows managers to approve which reviews will appear on public property pages,

- exposes a public property page that displays approved reviews only,

- includes fallback mock data and small server APIs to persist approvals.

- This repo implements a production-ready, TypeScript-first solution using the Next.js App Router and Tailwind CSS.

## Live demo
[View Project](https://flex-reviews-dashboard-three.vercel.app/)
___

## Quick start (local)
1. Clone and install:
``` bash
git clone https://github.com/<you>/flex-reviews-dashboard.git
cd flex-reviews-dashboard
npm install
```

2. Create recommended files/folders (if not present):
```
public/mock/hostaway-reviews.json        # Hostaway mock payload (example provided)
app/data/approved-reviews.json           # approvals store (initially: [])
```

3. First, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
# open http://localhost:3000
```

4. Build (for a production check):
```
npm run build
```

## Environment variables
Add these to .env.local for local dev or to Vercel project settings as Environment Variables.
Required (from assessment doc):
```
HOSTAWAY_ACCOUNT_ID=hostaway-account-id
HOSTAWAY_API_KEY=hostaway-api-key
```
Optional (useful):
```
NEXT_PUBLIC_BASE_URL=https://your-deploy-url.vercel.app
HOSTAWAY_SANDBOX_URL=https://sandbox.hostaway.io/api/v1/reviews   # if you get a real sandbox endpoint
```
*Note: The code prefers HOSTAWAY envs and falls back to public/mock/hostaway-reviews.json when sandbox is not available.*
___
## Project structure (key files)
```
app/
  layout.tsx
  page.tsx
  dashboard/
    page.tsx                        # Manager Dashboard (client component)
    properties/
      page.tsx                      # Properties index (list)
      [id]/page.tsx                 # Dynamic property page (server)
  api/
    reviews/
      hostaway/route.ts             # GET normalized reviews (server)
      approvals/route.ts            # GET/POST approvals persisted to file (server)
app/components/
  AppHeader.tsx
  PageHeader.tsx
  Footer.tsx
  ApproveToggle.tsx                # client toggle button
  ReviewDetailsModal.tsx
  PropertyLayout.tsx               # server component that renders property page
data/
  approved-reviews.json            # approvals storage (initial commit: [])
lib/
  reviews.ts                       # helper to load approved reviews
public/
  mock/hostaway-reviews.json       # hostaway example payload (section 7)
  property-placeholder.jpg
next.config.ts
```
***

## Key features & UX
- Normalization: The server route /api/reviews/hostaway normalizes Hostaway JSON into grouped per-property structures with computed average ratings (if rating is null).

- Manager Dashboard: interactive table with search, filters (status, min rating), sort (newest/oldest/highest/lowest), pagination, approvals toggles, and details modal.

- Approvals: managers can approve reviews; approvals persisted to app/data/approved-reviews.json.

- Property Page: /dashboard/properties/[id] (server) + public-like property layout that shows only approved reviews for that property.

- Fallback Mocking: If Hostaway sandbox or API fails, client & server routes fall back to public/mock/hostaway-reviews.json.

## API endpoints (local / server)
All API routes are under the Next.js App Router (app/api/...) and return JSON.

### GET /api/reviews/hostaway
- Returns normalized listing groups:
```
{ "data": [ { "listingId": "...", "listingName": "...", "averageRating": 4.5, "counts": 3, "reviews": [ ... ] } ] }
```

### POST /api/reviews/approvals
- Body: { "id": "<reviewId>", "approved": true }
- Persists approval to app/data/approved-reviews.json and returns updated approvals.
***

## Data formats
Hostaway mock public/mock/hostaway-reviews.json
Matches assessment section 7:
```
{
  "status": "success",
  "result": [
    {
      "id": 7453,
      "type": "host-to-guest",
      "status": "published",
      "rating": null,
      "publicReview": "Shane and family are wonderful! ...",
      "reviewCategory": [
        { "category": "cleanliness", "rating": 10 },
        { "category": "communication", "rating": 10 },
        { "category": "respect_house_rules", "rating": 10 }
      ],
      "submittedAt": "2020-08-21 22:45:14",
      "guestName": "Shane Finkelstein",
      "listingName": "2B N1 A - 29 Shoreditch Heights"
    }
  ]
}
```

### Approvals storage app/data/approved-reviews.json
Initial shape used by server:
```
[]
```

Each element is a property group:
```
[
  {
    "listingId": "12345",
    "listingName": "Flex Soho Apartment",
    "averageRating": 4.7,
    "counts": 12,
    "reviews": [
      { "id": "RVW-001", "guestName": "...", "publicReview": "...", "rating": 8, "categories": [...], "submittedAt": "..." }
    ]
  }
]
```
___

## Images & next.config.ts
- Remote images must be whitelisted in next.config.ts using images.remotePatterns. Example hosts added: lsmvmmgkpbyqhthzdexc.supabase.co, theflex.global, media.istockphoto.com, images.unsplash.com.

- Alternatively use local images under public/ (e.g. public/property-placeholder.jpg) to avoid remote config.
***

## Tests & manual checks (recommended)
1. Start dev server:
```
npm run dev
```
2. Check API endpoints:
- http://localhost:3000/api/reviews/hostaway

- http://localhost:3000/api/reviews/approvals (GET)

3. Open UI pages:

- http://localhost:3000/dashboard — list & approve reviews

- http://localhost:3000/dashboard/properties — list properties

- http://localhost:3000/dashboard/properties/<listingId> — property details (approved reviews only)

4. Toggle approval and confirm persisted value in app/data/approved-reviews.json or via /api/reviews/approvals.
___

## Deployment (Vercel recommended)
1. Push your repo to GitHub (you already pushed).

2. Import project in Vercel:

- Framework: Next.js

- Root directory: ./

- Build command: npm run build (default)

3. Add environment variables (Vercel project settings):

- HOSTAWAY_ACCOUNT_ID = 61148

- HOSTAWAY_API_KEY = f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152

- Optionally add NEXT_PUBLIC_BASE_URL after your first deploy.

4. Deploy, then test live endpoints:

- https://your-deploy-url/api/reviews/hostaway

- https://your-deploy-url/dashboard

*Important: On serverless hosts (Vercel), local file writes are ephemeral. For persistent approvals across restarts you must swap file storage for a remote DB (Supabase, Postgres, etc.). For this assessment, file storage is acceptable but note this limitation in your submission.*
***

## Known caveats & decisions

- Approvals persistence: implemented with file-based storage for simplicity and assessment speed; mention this in the documentation and request to add a remote DB if long-term persistence is required.

- Image domains: remote images require next.config whitelist. Where possible we use public/ images.

- Hostaway sandbox: the assessment includes keys but not an explicit sandbox URL — the code attempts sandbox only when given a HOSTAWAY_SANDBOX_URL or uses mock JSON by default.

- Client/server boundaries: UI is split into server components for page rendering and client components for interactive controls (approve toggle, modal) to avoid hydration issues.
___
## What I implemented (short checklist)
 - GET /api/reviews/hostaway — normalization & fallback

 - GET|POST /api/reviews/approvals — persist approvals

 - Manager Dashboard (search, filters, sorting, pagination)

 - Approve toggle + optimistic update

 - Review Details modal

 - Property details page showing approved reviews only

 - Typescript types, no any in main paths

 - README + deployment instructions (this file)
___

## License
MIT — see LICENSE in the repo.

## Developer

👨‍💻 Built with ❤️ by **Chiedozie Ezidiegwu** — Frontend / Full-Stack Engineer.  
LinkedIn: [Chiedozie Ezidiegwu](https://linkedin.com/in/chiedozie-ezidiegwu-9859a5167/)  
Email: **chiedozieezidiegwu@gmail.com**  
GitHub: [chiedozie07/flex-reviews-dashboard](https://github.com/chiedozie07/flex-reviews-dashboard)

**About this submission:**  
This repository contains my solution for the **Flex Living — Developer Practical Assessment (Reviews Dashboard)**.  
It includes full review normalization, manager approval workflow, property detail pages with approved reviews only, and a fully interactive dashboard built with modern UI/UX best practices.

**Tech & tools used:**  
Next.js (App Router), TypeScript, Tailwind CSS, Node.js API routes, Vercel (deployment), and optional Supabase integration for persistent approvals.

Feel free to reach out for a walkthrough, demo, or discussion about extending the system (analytics, reporting, Supabase storage, etc.).  
Thanks for reading! 🎉