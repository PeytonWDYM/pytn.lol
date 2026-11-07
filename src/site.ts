// Site-wide identity, used by the layout, meta tags, and RSS feed.
export const SITE = {
  title: "pytn.lol",
  description: "Posts and projects.",
  author: "Peyton",
} as const;

export const NAV = [
  { href: "/", label: "home" },
  { href: "/blog/", label: "blog" },
  { href: "/projects/", label: "projects" },
] as const;
