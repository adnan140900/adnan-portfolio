import Link from "next/link";
import { publicContent } from "@/lib/public-content/bundle";
import { publicRoutes } from "@/lib/public-content/routes";
import { PrimaryNavigation } from "./primary-navigation";

const navigation = [
  { href: "/", label: "Universe" },
  { href: "/about", label: "About" },
  ...publicRoutes.filter(route => route.path !== "/" && route.path !== "/about" && !("parent" in route)).map(route => ({ href: route.path, label: publicContent.graph.nodes.find(node => node.id === route.nodeId)!.label })),
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[rgb(8_11_16_/_0.92)] px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="site-navigation-shell mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Adnan home"
          className="rounded-sm text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
        >
          {publicContent.graph.nodes.find(node => node.id === publicContent.profile.graphNodeId)!.label}
        </Link>

        <PrimaryNavigation items={navigation} />
      </div>
    </header>
  );
}
