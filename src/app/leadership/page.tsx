import { PublicWorldPage } from "@/components/public-world-page";
import { getPublicPage } from "@/lib/public-content/page-data";
import { createPageMetadata } from "@/lib/site-metadata";
const page = getPublicPage("/leadership");
export const metadata = createPageMetadata(page.title, page.summary, "/leadership");
export default function Page() { return <PublicWorldPage path="/leadership" />; }
