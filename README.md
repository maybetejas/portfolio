# Portfolio

Lightweight static portfolio built with Astro. It outputs static files, uses no database, and is ready for future Markdown blog posts.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Pages

- `/`
- `/about/`
- `/projects/`
- `/experience/`
- `/tech-stack/`
- `/contact/`

## Blog Posts

Add Markdown files to `src/content/blog/`.

```md
---
title: "Post title"
description: "Short summary for SEO and cards."
publishDate: 2026-06-17
tags: ["portfolio", "notes"]
draft: false
---

Write the post here.
```

Published posts will appear at `/blog/` and `/blog/post-file-name/`.
