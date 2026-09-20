"use client";

import Link from "next/link";
import { usePortfolioTransition } from "./portfolio-transition-provider";

export function SubjectContextNav({ subjectId, label, parentHref = "/research", parentLabel = "Research" }: { subjectId: string; label: string; parentHref?: string; parentLabel?: string }) {
  const transition = usePortfolioTransition();
  return <nav className="subject-context-nav" aria-label="World navigation">
    <Link href="/" aria-label="Back to Universe"><span aria-hidden="true">✧</span> Universe</Link>
    <span aria-hidden="true">/</span>
    <Link href={parentHref} aria-label={`Back to ${parentLabel}`} onNavigate={event => {
      if (transition.exitSubject({ href: parentHref, nodeId: subjectId, label })) event.preventDefault();
    }}><span aria-hidden="true">✧</span> {parentLabel}</Link>
    <span aria-hidden="true">/</span><span aria-current="page">{label}</span>
  </nav>;
}
