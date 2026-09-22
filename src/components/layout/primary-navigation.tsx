"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** A small orientation island; approved labels still come from the server. */
export function PrimaryNavigation({ items }: { items: { href: string; label: string; shortLabel?: string }[] }) {
  const pathname = usePathname();
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    navigationRef.current?.querySelector<HTMLElement>('[data-navigation-active="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
  }, [pathname]);
  return <nav ref={navigationRef} className="primary-navigation" aria-label="Primary navigation"><ul className="flex flex-wrap items-center gap-1 sm:gap-2">
    {items.map((item, index) => {
      const current = pathname === item.href;
      const within = item.href !== "/" && pathname.startsWith(`${item.href}/`);
      return <li key={item.href} data-navigation-active={current || within}><Link
      href={item.href}
      aria-current={current ? "page" : within ? "location" : undefined}
      aria-label={item.label}
      className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--text-secondary)] outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:px-4"
    ><span className="navigation-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="navigation-label" aria-hidden="true">{item.shortLabel ?? item.label}</span></Link></li>;
    })}
  </ul></nav>;
}
