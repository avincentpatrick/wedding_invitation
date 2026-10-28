# Vince & Jelai wedding invitation

Static invitation page with a Google Sheets RSVP backend. No build step: GitHub Pages serves the files as they are.

- `index.html` – the page
- `assets/config.js` – all wording, dates, venues, programme, FAQ. Edit this to change content.
- `assets/style.css`, `assets/app.js` – styling and behaviour
- `assets/og.png` – link preview image for Messenger and Viber (source in `tools/og.html`)
- `tools/build-preview.py` – builds a single-file preview for sharing
- `docs/PLAN.md` – project plan and architecture

Preview a guest's personalised view locally with `index.html?to=Mr.%20and%20Mrs.%20Santos&seats=2`.
