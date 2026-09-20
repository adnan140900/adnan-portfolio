"use client";

import Link from "next/link";
import { usePortfolioTransition } from "./portfolio-transition-provider";

interface ClusterReturnLinkProps {
  className?: string;
  nodeId: string;
  label: string;
}

export function ClusterReturnLink({ className, nodeId, label }: ClusterReturnLinkProps) {
  const transition = usePortfolioTransition();

  return (
    <Link
      href="/"
      className={className}
      aria-disabled={transition.isTransitioning}
      onNavigate={(event) => {
        const started = transition.exitCluster({
          href: "/",
          label,
          nodeId,
        });
        if (started) event.preventDefault();
      }}
    >
      ← Return to universe
    </Link>
  );
}
