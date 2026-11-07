import { getCollection, type CollectionEntry } from "astro:content";
import type { Entry } from "~/components/EntryList.astro";

// Single source of truth for which entries are public, their order, and their URLs.
// Every page, the RSS feed, and the home page read through these.

export type Post = CollectionEntry<"blog">;
export type Project = CollectionEntry<"projects">;

export const postHref = (post: Post) => `/blog/${post.id}/`;
export const projectHref = (project: Project) => `/projects/${project.id}/`;

export const postEntry = (post: Post): Entry => ({
  href: postHref(post),
  title: post.data.title,
  description: post.data.description,
  date: post.data.pubDate,
});

export const projectEntry = (project: Project): Entry => ({
  href: projectHref(project),
  title: project.data.title,
  description: project.data.description,
  date: project.data.date,
});

/** Blog posts, newest first. Drafts are only included in dev. */
export async function getPosts() {
  const posts = await getCollection(
    "blog",
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** Projects, newest first. */
export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
