# Dr. Mo. Lab — Portable CMS

A dependency-free content system for the Dr. Mo. Lab site. All page content
(hero text, team, publications, updates, contact info, footer) lives in one
file, `content.json`. Edit it visually with `admin.html`, or by hand.

This is *not* WordPress — it produces a plain static `index.html` you can
host anywhere (GitHub Pages, Netlify, a shared host, or as a page inside
another CMS). See `../wordpress-theme/` for the WordPress version, which can
import this same `content.json`.

## Quick start (no installs, no server)

1. Open **`admin.html`** by double-clicking it (works fully offline, in any
   modern browser).
2. It loads the current site content automatically. To edit different
   content later, click **Load content.json** and pick a file.
3. Edit any tab — Hero, Team, Publications, etc. Changes are kept in the
   browser tab only until you export them (nothing is saved automatically).
4. Click **Download content.json** to save your edits back to a file.
5. Click **Generate Website** to download a ready-to-deploy `index.html`.
6. Put that `index.html` next to the `images/` folder and upload both — that's
   the whole site.

## Files

| File                 | Purpose                                                        |
|----------------------|------------------------------------------------------------------|
| `content.json`        | All site content — the single source of truth.                 |
| `admin.html`          | Self-contained visual editor. Open directly in a browser.      |
| `template.html`       | HTML skeleton with `{{tokens}}`, used by the generator.         |
| `template-engine.js`  | The tiny templating engine (no dependencies).                   |
| `styles.css`          | All site CSS (same design as the original).                     |
| `main.js`             | Site interactivity (nav, scroll reveal, publication filters).   |
| `generate.js`         | Node.js command-line version of the "Generate Website" button.  |
| `images/`             | Photos and graphics referenced by `content.json`.               |
| `build-admin.js`      | Rebuilds `admin.html` from `admin-src.html` + the files above. Only needed if you edit the *editor itself*, not for normal content edits. |
| `admin-src.html`      | Source of the admin editor before content gets baked in.        |

## Command-line alternative

If you'd rather script it (e.g. as part of a deploy pipeline):

```bash
node generate.js content.json dist
# -> dist/index.html + dist/images/
```

## Editing content.json directly

It's plain, readable JSON — safe to hand-edit if you prefer a text editor
over the form UI. Key sections:

- `site` — page title, lab name/tagline, logo path
- `hero` — headline, description, buttons (headingHtml/bodyHtml fields accept
  basic HTML like `<em>` and `<br/>`)
- `acronym` — the "What Dr. Mo. stands for" blurb (the D-r-M-o letter reveal
  itself is fixed in `template.html`, since it's tied to the word "Dr. Mo.")
- `updates.featured` / `updates.mini` — lab news cards
- `pi` — the Principal Investigator card
- `team.current` / `team.alumni` — member cards (`linkedinUrl`/`websiteUrl`
  are optional; omit or set to `null`/`""` to hide a link)
- `publications.items` — each has `type` (`journal`/`conference`/
  `dissertation`/`magazine`), which drives both the badge color and the
  sidebar category counts — the counts are computed automatically now, so
  they can't drift out of sync the way they had in the original hand-coded
  page
- `contact` / `footer` — contact card, form options, footer links

## Known content gap carried over from the original file

`daniel-pelumi.jpg` is referenced in `content.json` but was never included in
the images folder you provided — his card will show a broken image until
that photo is added (or the `photo` field is cleared).

## Contact form

The generated static site keeps the same placeholder contact form behavior
as the original file (submitting shows an alert — there's no backend to
send it anywhere from a plain static host). To make it actually send mail,
either:
- use the WordPress version instead (`../wordpress-theme/`), which has a
  real working contact form out of the box, or
- wire the form up to a static-friendly service like
  [Formspree](https://formspree.io) or Netlify Forms, if you're deploying
  `index.html` on its own.

## Regenerating admin.html after editing the editor

If you ever want to change the editor's behavior (add a field, tweak the UI),
edit `admin-src.html`, then run:

```bash
node build-admin.js
```

This bakes the current `content.json` / `template.html` / `styles.css` /
`main.js` into a fresh `admin.html`. Normal day-to-day content editing never
needs this step — only re-run it after changing `admin-src.html` itself.
