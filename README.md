# Dr. Mo. Lab — Cloudflare Pages + Pages CMS

This is the deployable version of the Dr. Mo. Lab website. It uses:

- **Cloudflare Pages** for free hosting at a `*.pages.dev` address.
- **GitHub** to store the site and content.
- **Pages CMS** for a visual web editor.

You do not need WordPress, a database, or a custom domain.

## How publishing works

1. Edit text, people, publications, links, or images at [app.pagescms.org](https://app.pagescms.org/).
2. Select **Save**.
3. Pages CMS saves the change to your GitHub repository.
4. Cloudflare notices the GitHub change, rebuilds the site, and publishes it automatically.

The editable content is in `content.json`. The editor setup is in `.pages.yml`.

## First-time setup

### 1. Put this folder in a GitHub repository

Create a new repository at [github.com/new](https://github.com/new). A public repository is simplest, but Cloudflare Pages can also connect to a private repository.

Unzip this package and upload **the contents of this folder** to the repository. Make sure the hidden file `.pages.yml` is included. On macOS, press **Command + Shift + .** in Finder to show hidden files.

If you already use Git from a terminal, run these commands from this folder after replacing the repository URL:

```bash
git init
git add .
git commit -m "Initial Dr. Mo. Lab site"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

### 2. Connect the repository to Cloudflare Pages

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Open **Workers & Pages** and create a Pages project using **Git integration**.
3. Connect GitHub and select the repository from step 1.
4. Use these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave blank |

5. Select **Save and Deploy**.

Cloudflare will give you a free address similar to:

```text
https://your-project-name.pages.dev
```

No custom domain is required. Every later save from the CMS triggers another deployment.

### 3. Open the CMS

1. Go to [app.pagescms.org](https://app.pagescms.org/).
2. Sign in with GitHub.
3. Install/authorize the Pages CMS GitHub App for this repository.
4. Open the repository and choose the `main` branch.
5. Open **Website Content**, make a change, and select **Save**.

Cloudflare usually starts the new deployment within seconds. Check the **Deployments** tab in Cloudflare if the live site has not changed yet.

## Preview on your computer

Install [Node.js](https://nodejs.org/) version 18 or newer. Open a terminal in this folder and run:

```bash
npm run preview
```

Then visit [http://localhost:4173](http://localhost:4173). Press **Ctrl+C** in the terminal to stop the preview.

The included `admin.html` is the original offline editor. It can still be opened directly, but it does not publish. For normal editing after setup, use Pages CMS.

## Content and image notes

- Upload images through the CMS image fields; they are stored in `images/`.
- Daniel Pelumi's source photo was not included in the original upload, so his card shows the initials **DP**. Upload his photo under **Team → Current Members → Daniel Pelumi → Photo** when it is available.
- HTML is intentionally allowed in fields labeled **HTML** so the existing italic and line-break styling remains intact.
- Use full links beginning with `https://` for external URLs.
- Use section links such as `#team` and `#publications` for buttons that jump within the page.
- Empty optional fields can be left blank.

## Important: contact form behavior

The website is static. The contact form currently opens the visitor's email app using the recipient address in `content.json`; it does not store messages or send mail from Cloudflare. A serverless form handler can be added later if you want submissions to work without opening an email app.

## Troubleshooting

- **Cloudflare build fails:** confirm the build command is `npm run build`, the output directory is `dist`, and the repository includes `package.json`.
- **CMS shows no editable content:** confirm `.pages.yml` is at the repository root and you opened the same branch Cloudflare deploys.
- **A new image is missing:** save the CMS entry, wait for the Cloudflare deployment to finish, then hard-refresh the site.
- **The live site did not update:** open Cloudflare's deployment log and confirm the latest GitHub commit was built successfully.

For the original standalone editor instructions, see `README-PORTABLE.md`.

## Official setup references

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages CMS quick start](https://pagescms.org/docs/quick-start/)
- [Pages CMS configuration](https://pagescms.org/docs/configuration/)
