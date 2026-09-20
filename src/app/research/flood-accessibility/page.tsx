import { PublicWorldPage } from "@/components/public-world-page";
import { getPublicPage } from "@/lib/public-content/page-data";
import { createPageMetadata } from "@/lib/site-metadata";
const page = getPublicPage("/research/flood-accessibility");
export const metadata = createPageMetadata(page.title, page.summary, "/research/flood-accessibility");
export default function Page() { return <PublicWorldPage path="/research/flood-accessibility" />; }
