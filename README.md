# Stella Hwang personal website

A small, dependency-free static website hosted on Cloudflare Pages. HTML pages work without JavaScript. The only JavaScript controls the optional color theme.

## Edit content (Markdown)

All text lives in `content/` as Markdown files with front matter:

- Pages: `content/home.md`, `content/writing.md`, `content/resume.md`, `content/contact.md`, `content/404.md`
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

A `<br>` inside a page's `#` heading splits it into a dark first line and a grey second line (`# Hi, I’m Stella.<br>A full-stack engineer…`). On the home page the `#` heading is the headline, the shelf drawing under it (`scripts/shelf.mjs`) links to each section, the paragraphs under it are the introduction, and each `- **Topic** question` line under "Currently thinking about" becomes a tile. On pages, a link to a `.pdf` becomes a download button (its "title" is the saved file name).

## Edit design

- Shared header and navigation: `src/template.html` and `scripts/build.mjs`
- Styles: `src/assets/style.css`
- Markdown renderer: `scripts/markdown.mjs` (no dependencies)
- Sample resume PDFs: `src/resumes/`
- PDF authoring source: `scripts/resumes.py` (requires ReportLab)

## Build and check

Requires Node.js 22 or newer. No npm installation required.

```
npm run build
npm test
npm run preview
```

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

This project uses Pages direct upload. It does not require a Worker config, D1, or paid services. The existing `blue-disk-9749` Worker and `inseon.is-a.dev` DNS are not modified.

## Before using this as a finished professional site

Work entries, project ideas, writing, and PDF resumes are visibly labeled as samples. Replace them with confirmed content and real resume PDFs. Add your public contact links in `content/contact.md`. The deployment currently sends `noindex, nofollow` and disallows crawling in robots.txt while sample content is present; remove both once ready. Update SITE_URL when connecting a custom domain.

No analytics or guestbook are included. Email subscribers are stored by Buttondown, not on this site.
