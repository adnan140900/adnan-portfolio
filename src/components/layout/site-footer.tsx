import { publicContent } from "@/lib/public-content/bundle";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] px-4 py-5 text-sm text-[var(--text-muted)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <p>{publicContent.graph.nodes.find(node => node.id === publicContent.profile.graphNodeId)!.label}</p>
        <nav aria-label="Contact" className="flex flex-wrap gap-5">{publicContent.profile.links.map(link => <a key={link.url} href={link.url}>{link.label}</a>)}</nav>
      </div>
    </footer>
  );
}
