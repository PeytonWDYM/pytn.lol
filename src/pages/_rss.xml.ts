import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts, postHref } from "~/lib/content";
import { SITE } from "~/site";

// Blog feed at /rss.xml.
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: postHref(post),
    })),
  });
};
