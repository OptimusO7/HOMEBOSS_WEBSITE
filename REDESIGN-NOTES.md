# HomeBoss inner-page redesign

New / rewritten files (all in `public/`):

- `about.html`, `blog.html`, `prototype.html`, `studio.html` — rebuilt to match index.html
- `pages.css`, `pages.js` — shared inner-page styles + behaviour (cursor, nav, tilt engine, flip cards, magnetic buttons)
- `studio.css`, `studio.js` — Studio wizard with the isometric 3D floor plan
- `prototype.js` — same registration logic, plus flip-clock countdown and "launched" state

Touched lightly:

- `index.html` — removed the rocket emoji from the launch popup badge (nothing else changed)
- `vercel.json` — added clean `/blog` and `/studio` routes

Things to update yourself:

- `LAUNCH_DATE` at the top of `public/prototype.js` (currently 2026-08-08, which has passed, so the page shows the launched state)
- The launch date in the confirmation email inside `server.js`
- `fynn.jpg` is unused — add that person to the team grid in `about.html` if you want them shown

## Mobile overflow fix (index + inner pages)

- `index.html`: the hero line "Anytime. Anywhere." used a non-breaking space, so it could never wrap on a phone. Now a normal space, with `white-space:nowrap` on `.hero-h1 .stroke` so desktop looks exactly as before.
- `theme.css` / `pages.css`: added a `max-width:760px` block that gives the hero containers a real width (they were shrink-to-fit and grew wider than the screen), scales the headline with the viewport, and lets it wrap.
- `prototype.html`: smaller hero headline on phones, and the launch section clips its entrance animation so it can't push the page sideways.

Checked at 320 / 360 / 390 / 414 / 768 / 1024 / 1440px — no horizontal scroll on any page.
