import { expect, test } from "@playwright/test";

// pytn.lol is a blank #242424 placeholder until the real site is designed.
// Blog/projects routes are parked under src/pages/_* and not built; their
// E2E tests live in git history (commit e127bb5) and come back with them.

const BACKGROUND = "rgb(36, 36, 36)"; // #242424

test("home is a blank #242424 page with metadata", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on(
    "console",
    (msg) => msg.type() === "error" && errors.push(msg.text()),
  );

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("pytn.lol");
  await expect(page.locator("body")).toHaveCSS("background-color", BACKGROUND);
  expect(await page.locator("body").innerText()).toBe("");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pytn.lol/",
  );

  await testInfo.attach(`${testInfo.project.name}-home`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  expect(errors).toEqual([]);
});

test("parked routes are not published", async ({ request }) => {
  for (const path of ["/blog/", "/projects/", "/rss.xml"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("unknown pages get the blank 404 page", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).toHaveCSS("background-color", BACKGROUND);
});

test("robots.txt points at the sitemap, and the sitemap exists", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://pytn.lol/sitemap-index.xml");
  expect((await request.get("/sitemap-index.xml")).ok()).toBe(true);
});
