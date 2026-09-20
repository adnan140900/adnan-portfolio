"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** A small orientation island; approved labels still come from the server. */
export function PrimaryNavigation({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return <nav aria-label="Primary navigation"><ul className="flex flex-wrap items-center gap-1 sm:gap-2">
    {items.map(item => <li key={item.href}><Link
      href={item.href}
      aria-current={pathname === item.href ? "page" : item.href !== "/" && pathname.startsWith(`${item.href}/`) ? "location" : undefined}
      className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[var(--text-secondary)] outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:px-4"
    >{item.label}</Link></li>)}
  </ul></nav>;
}
