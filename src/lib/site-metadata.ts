import type { Metadata } from "next";

const defaultSiteOrigin = "https://adnan-sk.is-a.dev";

function resolveSiteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL) {
  const configuredOrigin = value?.trim() || defaultSiteOrigin;
  let url: URL;

  try {
    url = new URL(configuredOrigin);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.");
  }

  const isHttp = url.protocol === "http:" || url.protocol === "https:";
  const hasOnlyOrigin = url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;

  if (!isHttp || !hasOnlyOrigin) {
    throw new Error("NEXT_PUBLIC_SITE_URL must contain only an HTTP(S) origin, without credentials, a path, query, or hash.");
  }

  return new URL(url.origin);
}

export const siteMetadataBase = resolveSiteOrigin();

export function createPageMetadata(title: string, description: string, pathname: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
  };
}
