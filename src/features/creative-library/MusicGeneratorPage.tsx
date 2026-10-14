"use client";

import { PageHeader } from "@/components/design-system";
import { HAIR_APP } from "./apps";
import { MusicGenerator } from "./Generators";
import type { SampleVideo } from "./music-studio/MusicStudio";
import { Breadcrumbs } from "./parts";
import { HOME_PATH, appHref, categoryHref } from "./paths";
import { APP_NAME, CATEGORIES, getCategory } from "./sample-data";

export function MusicGeneratorPage({ category, videos }: { category?: string; videos: SampleVideo[] }) {
  const picked = getCategory(category ?? "");
  const categories = picked ? [picked.id, ...CATEGORIES.map((c) => c.id).filter((id) => id !== picked.id)] : CATEGORIES.map((c) => c.id);

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: HOME_PATH },
            { label: APP_NAME, href: appHref(HAIR_APP) },
            ...(picked ? [{ label: picked.name, href: categoryHref(HAIR_APP, picked.id) }] : []),
            { label: "Music Generator" },
          ]}
        />
        <PageHeader title="Music Generator" description="Generate music directions to try under your next creative." />
      </div>
      <MusicGenerator categories={categories} full videos={videos} />
    </div>
  );
}
