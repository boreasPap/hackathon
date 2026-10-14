"use client";

import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { IconButton } from "@/components/design-system";
import { formatDateTime } from "../client";
import type { Iteration, IterationItem } from "../types";
import { FavoriteButton, Panel, StatusBadge } from "./bits";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Text copied");
  } catch {
    toast.error("Copy is unavailable in this browser. Select the text manually.");
  }
}

export function ItemView({ item }: { item: IterationItem }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      {item.title ? <span className="text-caption font-semibold text-ink-2">{item.title}</span> : null}
      {item.url && item.mediaType === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.title ?? "Generated image"} className="max-h-80 w-auto self-start rounded-sm object-contain" />
      ) : null}
      {item.url && item.mediaType === "video" ? (
        <video src={item.url} controls playsInline className="max-h-96 self-start rounded-sm" />
      ) : null}
      {item.url && item.mediaType === "audio" ? <audio src={item.url} controls className="w-full" /> : null}
      {item.text ? <p className="font-prose text-body whitespace-pre-line text-ink">{item.text}</p> : null}
      {item.notes ? <p className="text-body-sm text-ink-3">{item.notes}</p> : null}
    </div>
  );
}

export function ItemActions({
  item,
  favorite,
  onToggleFavorite,
}: {
  item: IterationItem;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start gap-0.5">
      {item.text ? (
        <IconButton aria-label="Copy text" onClick={() => copy(item.text!)}>
          <Copy />
        </IconButton>
      ) : null}
      {item.url ? (
        <IconButton asChild aria-label="Open file">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
          </a>
        </IconButton>
      ) : null}
      <FavoriteButton on={favorite} onToggle={onToggleFavorite} label="this result" />
    </div>
  );
}

export function IterationCard({
  iteration,
  isFavorite,
  onToggleFavorite,
}: {
  iteration: Iteration;
  isFavorite: (itemIndex: number) => boolean;
  onToggleFavorite: (itemIndex: number) => void;
}) {
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={iteration.status} labels={{ running: "Generating" }} />
          <span className="text-caption text-ink-3">{formatDateTime(iteration.createdAt)}</span>
        </div>
        <span className="text-caption text-ink-3">{iteration.aiModelId}</span>
      </div>

      {iteration.prompt ? (
        <p className="text-body-sm text-ink-2">
          <span className="text-ink-3">Direction: </span>
          {iteration.prompt}
        </p>
      ) : null}

      {iteration.status === "running" ? (
        <p className="text-body-sm text-ink-3">Waiting for eachlabs. This can take a few minutes; you can leave this page.</p>
      ) : null}

      {iteration.status === "failed" ? (
        <p className="rounded-sm bg-danger-bg px-3 py-2 text-body-sm text-danger">{iteration.error ?? "The run failed."}</p>
      ) : null}

      {iteration.items.length ? (
        <ol className="flex flex-col divide-y divide-line">
          {iteration.items.map((item, i) => (
            <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-5 shrink-0 pt-0.5 text-caption font-num text-ink-3 tabular-nums">{i + 1}</span>
              <ItemView item={item} />
              <ItemActions item={item} favorite={isFavorite(i)} onToggleFavorite={() => onToggleFavorite(i)} />
            </li>
          ))}
        </ol>
      ) : null}

      <details className="group text-body-sm">
        <summary className="cursor-pointer text-ink-3 select-none hover:text-ink-2">Inputs sent to eachlabs</summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-sm bg-muted p-3 font-mono text-code whitespace-pre-wrap text-ink-2">
          {JSON.stringify(iteration.inputs, null, 2)}
        </pre>
      </details>
    </Panel>
  );
}
