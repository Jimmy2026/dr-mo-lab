# Dr. Mo. Lab

Website for Dr. Moses Olayemi’s research group at the University of Oklahoma. It has one scrolling page with sections for lab news, people, publications, and contact information.

The site is plain HTML, CSS, and JavaScript. There is no CMS or build step.

## Where things are

- `index.html` contains the navigation, footer, and links to the site files.
- `sections/` contains the six page sections: `hero.js`, `acronym.js`, `updates.js`, `team.js`, `publications.js`, and `contact.js`.
- `css/styles.css` controls the appearance and mobile layout.
- `js/main.js` puts the sections on the page and handles navigation, animations, and publication search.
- `images/` contains the logo, backgrounds, and team photos.

The section files have a `.js` extension, but the content between the backticks is HTML. You can edit that content directly. Leave the backticks and each section’s outer `<section id="...">` tag in place.

## Making changes

**News:** Edit `sections/updates.js`. The larger stories use `update-featured`; the shorter items use `update-mini`. Copy an existing item if you need another one.

**Team:** Edit `sections/team.js`. Current members and alumni are in separate parts of the file. Copy an existing `member-card` into the appropriate group, then change the name, role, project, links, and photo. Put new photos in `images/` and use a path such as `images/person-name.jpg`.

**Publications:** Edit `sections/publications.js`. Copy a `pub-card` and update its title, authors, venue, year, link, `data-text`, and `data-type`. The category numbers near the top of that file are written manually, so update those when you add or remove a publication.

**Contact information:** Edit `sections/contact.js`. If the email address changes, update both the visible address and the `mailto:` link.

For changes to colors, spacing, or fonts, use `css/styles.css`. For navigation or publication search behavior, use `js/main.js`.

## Previewing the site

Open `index.html` in a browser. Save your changes and refresh the page to see them. Keep `index.html`, `sections/`, `css/`, `js/`, and `images/` together in the same folder.

Before publishing, check the page at desktop and phone widths. Test the section links, publication search and filters, photos, and email link.

## Publishing

The Cloudflare Pages site is connected to the GitHub repository. Update the files in your local copy of that repository, commit, and push to its production branch. Cloudflare will deploy the new commit.

Keep `index.html` at the repository’s site root, alongside `sections/`, `css/`, `js/`, and `images/`. Copy the contents of the site folder into the repository, rather than adding the folder as another level above `index.html`.