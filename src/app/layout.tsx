import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PortfolioTransitionProvider } from "@/features/transitions/portfolio-transition-provider";
import "./globals.css";
import { publicContent } from "@/lib/public-content/bundle";
import { portfolioGraph } from "@/lib/graph/portfolio-graph";
import { KnowledgeField } from "@/features/kinetic/knowledge-field";
import { siteMetadataBase } from "@/lib/site-metadata";
import { ExperienceProfileProvider } from "@/features/experience/experience-profile-provider";

export const metadata: Metadata = {
  metadataBase: siteMetadataBase,
  title: {
    default: publicContent.profile.name,
    template: `%s · ${publicContent.profile.name}`,
  },
  description: publicContent.profile.introduction.text,
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col bg-[var(--background)] text-[var(--text-primary)] antialiased">
        <ExperienceProfileProvider>
          <PortfolioTransitionProvider>
            <a className="skip-link" href="#main-content">
              Skip to main content
            </a>
            <SiteHeader />
            <KnowledgeField graph={portfolioGraph} />
            {children}
            <SiteFooter />
          </PortfolioTransitionProvider>
        </ExperienceProfileProvider>
        <Analytics />
      </body>
    </html>
  );
}
