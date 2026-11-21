# Stella Hwang personal website

A small static website with a dependency-free production build, hosted on Cloudflare Pages. HTML pages work without JavaScript. Production JavaScript controls the optional color theme. A separate localhost development server adds visual editing and autosave.

## Edit in your browser (localhost)

Install the development tools once, then start the local editor:

```sh
npm install
npm run dev
```

Open http://localhost:4173 and click **Edit page**. Edit the document directly, select text to apply bold or italic, choose headings or lists, and use **Link** (or Cmd/Ctrl+K) to insert or edit a link. Undo and redo work through the toolbar and normal keyboard shortcuts. Rich text pasted from another document keeps basic formatting.

Changes save automatically to the corresponding Markdown file in `content/` **0.5 seconds after you stop typing**. Change **Autosave after** to use another delay (0.1 to 60 seconds); your browser remembers it. The status shows when the file is saved. **Done** waits for pending saves and returns to the normal page layout.

The editor changes the page's text, not the shared navigation, portrait, generated post lists, or page metadata. While editing, content appears as a document; **Done** restores the page's regular layout. Existing images, tables, captions, and expandable sections are preserved. Source formatting can be normalized into equivalent Markdown or HTML after an edit. Opening and closing an untouched document leaves its source unchanged.

If another tab or a file editor changed the source, saving stops with a conflict message. **Download your edits** before reloading, then reconcile them with the updated file. Failed saves retain your text and offer **Retry save**. Leaving with unsaved changes triggers a browser warning.

The development server binds to your computer only. Editing tools and save endpoints are absent from `npm run preview` and the deployed static site. Saving locally does not deploy or send newsletters. To use another port: `PORT=4174 npm run dev`.

## Edit content (Markdown)

All text lives in `content/` as Markdown files with front matter:

- Pages: `content/home.md`, `content/writing.md`, `content/contact.md`, `content/404.md`
- Posts: `content/writing/<slug>.md`, or a folder `content/writing/<slug>/index.md` with its images next to it

A post starts with:

```
---
title: How to give a good presentation
date: 2026-11-09
description: One sentence for search results, RSS and the newsletter.
summary: Optional short line shown under the title in lists.
draft: true        # optional, leaves the post out of the build
sample: true       # optional, never emails the post
---
```

The file or folder name is the URL (`/writing/<slug>/`), so use lowercase letters, numbers and dashes. Lists on the home and Writing pages, the RSS feed and newsletter drafts all come from these files: adding a file is enough.

From Notion: export the page as Markdown & CSV, rename the exported `.md` to `index.md` inside a folder named after the slug, keep the image folder beside it, and add the front matter above. Relative image paths are published under the post's URL. A lone image line becomes a figure; its "title" is the caption: `![Alt text](/assets/slide.jpg "Caption")`. Raw HTML such as `<details>` works; leave a blank line after `<summary>` so the Markdown inside is still parsed.

A `<br>` inside a page's `#` heading splits it into a dark first line and a grey second line (`# Hi, I’m Stella.<br>A full-stack engineer…`). On the home page the `#` heading is the headline, the paragraphs under it are the introduction, and each `- **Topic** question` line under "Currently thinking about" becomes a tile. On pages, a link to a `.pdf` becomes a download button (its "title" is the saved file name).

## Edit design

- Shared header and navigation: `src/template.html` and `scripts/build.mjs`
- Styles: `src/assets/style.css`
- Markdown renderer: `scripts/markdown.mjs` (no dependencies)
- Resume: one PDF at `src/resumes/stella-hwang.pdf` (git-ignored), shown as the Resume icon link in the sidebar. Made from `targeted-resumes/` below

## Build and check

Requires Node.js 22 or newer. The static build needs no npm installation. Browser editing and the full test suite require `npm install`.

```
npm run build
npm test
npm run preview
```

For the full browser editing check (requires Google Chrome): `npm run test:editor`. It uses a disposable copy of the site so your content stays untouched.

The preview is at http://localhost:4173.

## Deploy

Authenticate with Cloudflare (`npx wrangler@4.152.0 login`), then:

```
npm run deploy
```

This builds the site, uploads `dist/` to Cloudflare Pages, and then creates a Buttondown email draft for each new post.

## Newsletter

- Visitors subscribe through the form on Writing pages. Subscribers are stored in Buttondown (`buttondown.com/inseon`).
- To add a post, add its Markdown file in `content/writing/`.
- After deploy, `scripts/newsletter.mjs` creates a draft for each post that is live and not yet in `newsletter-drafts.json`. Drafts are never sent automatically. Review and send them at https://buttondown.com/emails.
- Posts with `sample: true` are never emailed.
- The API key is read from the macOS keychain entry `buttondown-api-key` (or `BUTTONDOWN_API_KEY`). Without it the step is skipped.

This project uses Pages direct upload. It does not require a Worker config, D1, or paid services. The site is served at https://stella.is-a.dev (a CNAME to `stella-hwang-personal.pages.dev`, registered in is-a-dev/register). is-a.dev is on the Public Suffix List, so the custom domain is added to the Pages project through the Cloudflare API, not the dashboard.

## Before using this as a finished professional site

Work entries, project ideas, and writing are visibly labeled as samples. Replace them with confirmed content. Add your public contact links in `content/contact.md`. Crawlers are allowed and every page gets link-preview tags (`og:*`, `twitter:card`, canonical) from its front matter `title` and `description` at build time. The preview image is the front matter `image` (optional `image_alt`), else a post's first image, else the portrait; the build fails if a title, description or image is missing. SITE_URL defaults to https://stella.is-a.dev; change it if the domain changes, since preview URLs are absolute.

No analytics or guestbook are included. Email subscribers are stored by Buttondown, not on this site.

## Targeted resumes (Typst, private)

`targeted-resumes/` is git-ignored because it holds contact details. It needs [Typst](https://typst.app) (`brew install typst`).

- `data.yaml`: every job, project, school and skill, with bullets tagged (`infra`, `ai`, `backend`, `frontend`, `impact`, ...). Use `**bold**` for emphasis.
- `targets/<company>.yaml`: what one resume shows. Copy `example-ai-infra.yaml`; choose entries (`experience`, `projects`), what to `emphasize`, `max_bullets` per entry, and `skills_first`.
- `npm run resume` lists targets, `npm run resume -- <company>` builds `targeted-resumes/out/Stella-Hwang-<company>.pdf`, `--all` builds all, `--watch` rebuilds on save.
- Building `default` also copies it to `src/resumes/stella-hwang.pdf`, the file the site's Resume link downloads.
