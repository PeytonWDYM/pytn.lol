import { expect, test, type Page } from "@playwright/test";

// End-to-end checks against the built site. The crawl doubles as the
// repeatable artifact: one full-page screenshot per page, per device,
// attached to the HTML report in output/playwright-report.

/** Same-origin links on the current page, normalized to pathnames. */
async function internalLinks(page: Page) {
  const hrefs = await page
    .locator("a[href]")
    .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
  const origin = new URL(page.url()).origin;
  return hrefs
    .map((href) => new URL(href))
    .filter((url) => url.origin === origin)
    .map((url) => url.pathname);
}

test("every reachable page renders with no broken links or console errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on(
    "console",
    (msg) => msg.type() === "error" && errors.push(msg.text()),
  );

  const queue = ["/"];
  const seen = new Set(queue);

  for (let path = queue.shift(); path; path = queue.shift()) {
    // Feeds and other non-HTML files only need to exist.
    if (!path.endsWith("/")) {
      const response = await page.request.get(path);
      expect(response.status(), `${path} is broken`).toBe(200);
      continue;
    }

    const response = await page.goto(path);
    expect(response?.status(), `${path} is broken`).toBe(200);
    await expect(
      page.locator("h1"),
      `${path} needs exactly one h1`,
    ).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();

    await testInfo.attach(`${testInfo.project.name}${path}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    for (const link of await internalLinks(page)) {
      if (!seen.has(link)) {
        seen.add(link);
        queue.push(link);
      }
    }
  }

  // Home, blog index, at least one post, projects index, at least one project.
  expect(seen).toContain("/blog/");
  expect(seen).toContain("/projects/");
  expect([...seen].some((p) => /^\/blog\/.+\/$/.test(p))).toBe(true);
  expect([...seen].some((p) => /^\/projects\/.+\/$/.test(p))).toBe(true);
  expect(errors).toEqual([]);
});

test("home links to the latest post, and the post renders its content", async ({
  page,
}) => {
  await page.goto("/");
  const firstPost = page
    .locator("section", { hasText: "latest posts" })
    .locator(".entry-list a")
    .first();
  const title = await firstPost.textContent();
  await firstPost.click();

  await expect(page).toHaveURL(/\/blog\/.+\/$/);
  await expect(page.locator("h1")).toHaveText(title ?? "");
  await expect(page.locator(".prose")).not.toBeEmpty();
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText("blog");
});

test("project pages link out to the project", async ({ page }) => {
  await page.goto("/projects/");
  await page.locator(".entry-list a").first().click();
  await expect(page).toHaveURL(/\/projects\/.+\/$/);
  await expect(page.locator(".entry-links a").first()).toHaveAttribute(
    "href",
    /^https:\/\//,
  );
});

test("pages carry canonical and social metadata", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pytn.lol/blog/",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "blog · pytn.lol",
  );
  await expect(
    page.locator('link[type="application/rss+xml"]'),
  ).toHaveAttribute("href", "https://pytn.lol/rss.xml");
});

test("RSS feed lists posts with absolute links", async ({ request }) => {
  const response = await request.get("/rss.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain("<rss");
  expect(xml).toMatch(
    /<item>[\s\S]*<link>https:\/\/pytn\.lol\/blog\/.+\/<\/link>/,
  );
});

test("robots.txt points at the sitemap, and the sitemap exists", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://pytn.lol/sitemap-index.xml");
  expect((await request.get("/sitemap-index.xml")).ok()).toBe(true);
});

test("unknown pages get the 404 page", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("404");
});
