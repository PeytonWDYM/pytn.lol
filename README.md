# pytn.lol

Source for my personal website, [pytn.lol](https://pytn.lol). Static
[Astro](https://astro.build) site, deployed to cPanel shared hosting.

## Writing

- **Post:** add `src/content/blog/<slug>.md` (or `.mdx`). Set `draft: true` to
  keep it out of production while you work on it.
- **Project:** add `src/content/projects/<slug>.md`.

Frontmatter is typed in `src/content.config.ts`, so a bad field fails the build.
Push to `main` and it goes live.

## Pages

Right now pytn.lol is a blank `#242424` placeholder (`src/pages/index.astro`).

The blog and projects routes are built but parked: Astro skips anything in
`src/pages/` starting with `_`. To publish them, rename `_blog/` to `blog/`,
`_projects/` to `projects/`, and `_rss.xml.ts` to `rss.xml.ts`.

## Commands

```sh
pnpm install
pnpm dev        # local dev server (shows drafts)
pnpm check      # types, content schemas, formatting
pnpm build      # static site into dist/
pnpm e2e        # Playwright against the built site; report in output/
```

## Deploy

`.github/workflows/site.yml` checks, builds, and runs E2E on every PR and push.
On `main` it rsyncs that exact build to `public_html` over SSH. It needs:

- Repo variable `DEPLOY_ENABLED=true`
- `production` environment secrets: `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`,
  `DEPLOY_USER`, `DEPLOY_HOST`
