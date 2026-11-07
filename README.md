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

| Path                 | Source                               |
| -------------------- | ------------------------------------ |
| `/`                  | `src/pages/index.astro`              |
| `/blog/`             | `src/pages/blog/index.astro`         |
| `/blog/<slug>/`      | `src/pages/blog/[...slug].astro`     |
| `/projects/`         | `src/pages/projects/index.astro`     |
| `/projects/<slug>/`  | `src/pages/projects/[...slug].astro` |
| `/rss.xml`           | `src/pages/rss.xml.ts`               |
| `/robots.txt`        | `src/pages/robots.txt.ts`            |
| `/sitemap-index.xml` | `@astrojs/sitemap`                   |
| 404                  | `src/pages/404.astro`                |

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
