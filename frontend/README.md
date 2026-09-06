# Harvest Ledger

Build a web app frontend for a "Smart Farmer Procurement & Queue Management System" 

connecting to an existing Spring Boot REST API at http://localhost:8080/api.

=== DESIGN DIRECTION ===

Aesthetic: "Field & Ledger" — where agrarian warmth meets civic-infrastructure precision. 

Think of a well-run cooperative's back office crossed with a modern fintech dashboard: 

trustworthy, calm, data-dense but never cluttered. NOT playful, NOT cartoonish, NOT a 

generic purple-gradient SaaS template. Avoid rounded blob illustrations, emoji-as-icons, 

and glassmorphism.

COLOR PALETTE (use exactly these, don't substitute generic Tailwind defaults):

- Primary (deep forest green): #1B4332 — headers, primary buttons, active nav

- Primary hover/accent: #2D6A4F

- Secondary (warm harvest amber): #C9843C — CTAs, highlights, "Called" status

- Background (warm ivory, not stark white): #FAF7F0

- Surface/card background: #FFFFFF with a very faint warm tint

- Border/divider: #E5DDD0 (warm gray, not cold gray)

- Text primary: #1C1917 (near-black, warm undertone)

- Text secondary/muted: #78716C

- Status colors: Waiting = #A8A29E (neutral gray), Called = #C9843C (amber, pulsing), 

  In Progress = #2563EB (blue), Completed = #1B4332 (deep green), Cancelled = #B91C1C (red)

TYPOGRAPHY:

- Headings: "Fraunces" (serif, use the softer/rounded variable-width cut) — gives an 

  institutional, trustworthy feel without being stiff like Times. Use for page titles 

  and section headers only.

- Body/UI text: "Inter" — everywhere else (forms, tables, buttons, nav).

- Token numbers and IDs: "JetBrains Mono" or "IBM Plex Mono" — monospaced, so token 

  numbers align visually and feel "official," like a receipt or ledger entry.

LAYOUT & COMPONENT STYLE:

- Border radius: 8px on cards/inputs, 6px on buttons/badges — not fully rounded (avoid 

  the trendy 20px+ "pill everything" look), not sharp either.

- Shadows: very subtle, warm-tinted (not pure black) — e.g. a soft 

  0 2px 8px rgba(28,25,23,0.06) on cards, slightly deeper on hover.

- Spacing: generous whitespace, 24px+ gutters between major sections, don't cram.

- Cards have a 1px warm border (#E5DDD0) rather than relying purely on shadow.

- Status badges: pill-shaped, colored background at 15% opacity with full-opacity text 

  and a small dot indicator, not solid-filled loud badges.

- Data tables: zebra striping using the ivory background tone, sticky header row, 

  right-align all numeric columns (quantities, prices, totals).

- Use subtle top-accent-border (2-3px, primary color) on active nav items instead of 

  full background fills.

ICONOGRAPHY: Use Lucide icons (already available), outlined style, consistent 20px size, 

color-matched to text-secondary except where indicating status.

MOTION: Minimal and purposeful — 150-200ms ease transitions on hover/focus states only. 

No bouncy spring animations, no page-load fade-ins competing for attention. Exception: 

the Live Queue Board's "Called" token should have a slow, subtle pulse (not blinking) 

on its background color to draw the eye without being obnoxious.

=== AUTH ===

Login and Register pages, centered card on the ivory background, generous padding, 

Fraunces heading ("Welcome back" / "Create your account"), Inter for form labels/inputs.

Register form: role selector (Farmer / Staff / Admin) as a segmented control (not a 

dropdown) — if Farmer is selected, reveal additional fields (full name, Aadhar number, 

village, district, bank account, IFSC) with a smooth height-expand transition.

POST /api/auth/login with { username, password } → store JWT → attach as 

"Authorization: Bearer <token>" on every request.

POST /api/auth/register with all fields.

Redirect by role after login: Farmer → Farmer Dashboard, Staff → Staff Dashboard, 

Admin → Admin Panel.

=== SCREENS ===

1. FARMER DASHBOARD

   - Top: farmer's profile summary in a card (GET /api/farmers/me) — name, village, 

     district in a clean info-row layout, not a boring label:value list.

   - "Generate Token" as the primary action — a prominent card with center dropdown 

     (GET /api/centers), crop type dropdown (GET /api/crop-types), quantity input, 

     amber CTA button. On submit (POST /api/queue/token), show the resulting token 

     in a large "ticket stub" style card — token number in monospace, large, with a 

     dashed-border ticket aesthetic (like a real queue ticket).

   - Below: their token's live status, auto-polling every 5s.

2. LIVE QUEUE DISPLAY BOARD (public, no auth, meant for a TV/monitor at the center)

   - Full-bleed dark-on-ivory or deep-green background for high visibility from a 

     distance. Center selector at top (small, unobtrusive).

   - Massive typography for the "Now Serving" token (the one with status=Called) — 

     this should dominate the screen, monospace font, 120px+ font size, with the 

     subtle pulse animation described above.

   - Below it, a "Waiting" list — smaller, in a grid, showing upcoming token numbers 

     in order.

   - Poll GET /api/queue/status/{centerId} every 5 seconds.

   - No navigation chrome, no clutter — this is a display screen, not an app page.

3. STAFF DASHBOARD

   - Center selector, current queue list (status endpoint) in a clean table: token 

     number (mono), farmer name, crop, quantity, status badge.

   - Large "Call Next" button (POST /api/queue/call-next/{centerId}) — primary green, 

     prominent, top of the queue panel.

   - "Record Procurement" form for the currently-called token: actual quantity, 

     quality grade (as a segmented control: A / B / C), price per unit → 

     POST /api/procurement, show computed total in a highlighted result card.

   - "Mark Complete" button (POST /api/queue/{tokenId}/complete).

4. ADMIN PANEL

   - Sidebar nav (Centers / Crop Types), not tabs — this feels more like a proper 

     back-office tool.

   - Centers: table + "Add Center" form (name, location, capacity, operating hours) 

     via /api/centers.

   - Crop Types: table + "Add Crop Type" form (name, category, unit, base price, 

     MSP price) via /api/crop-types. Show MSP vs base price as two columns so the 

     comparison is visually obvious.

=== NAVIGATION ===

Top navbar: deep green background, app name in Fraunces (white text), role-based nav 

links in Inter, small avatar/initials circle + logout on the right. Keep it slim 

(56-64px height) — this is a working tool, not a marketing site.

=== STATES ===

- Loading: skeleton screens matching each layout's shape (not spinners) in a muted 

  ivory/gray shimmer.

- Empty states: e.g. "No farmers in queue yet" with a simple line-icon illustration, 

  not a big cartoon graphic.

- Errors: inline, calm red text near the relevant field/action — no intrusive modal 

  popups for validation errors.

Use environment variables for the API base URL so I can change it later when deploying.



## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
