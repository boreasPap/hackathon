import Link from "next/link";
import { Compass } from "lucide-react";

/**
 * The landing card of the dashboard (/dashboard/welcome). It renders inside
 * the shell, so "the menu on the left" is the sidebar the user is looking at.
 * In the quickstart that menu starts empty.
 */
export default function WelcomeCard({ name }: { name?: string | null }) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <div className="flex min-h-[70vh] items-center justify-center font-bomstad">
      <div className="w-full max-w-xl rounded-xl border border-line bg-surface p-10 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-muted">
          <Compass className="size-7 text-accent-text" />
        </div>
        <h1 className="mt-5 text-page-title text-ink">Welcome{firstName ? `, ${firstName}` : ""} 👋</h1>
        <p className="mt-2 text-page-desc text-ink-3">
          This is an empty Papcorns dashboard. The menu on the left has no pages yet: tell Claude what you
          want to build and your first page will show up there.
        </p>
        <p className="mt-4 text-body-sm text-ink-3">
          The building blocks you can use are in the{" "}
          <Link href="/design-system" className="text-accent-text underline-offset-2 hover:underline">
            component gallery
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
