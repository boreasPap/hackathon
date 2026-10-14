import { notFound } from "next/navigation";
import { PageHeader } from "@/components/design-system";

// Stand-ins for the real dashboard's pages, so the menu matches it.
const PLACEHOLDERS: Record<string, string> = {
  competitors: "Competitors",
  "sdk/overview": "SDK",
  localization: "Localization",
  "creative/download-videos-audio": "Download Videos & Audio",
  "creative/creative-storage": "Creative Storage",
  "creative/post-contents": "Post Contents",
  "creative/weekly-tracker": "Weekly Tracker",
  "creative/new-generation": "New Generation",
  "creative/creative-analysis": "Creative Analysis",
  "mobile-farm/devices": "Mobile Farm",
};

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const title = PLACEHOLDERS[slug.join("/")];
  if (!title) notFound();

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader title={title} description="This page lives in the real dashboard and is not part of this prototype." />
    </div>
  );
}
