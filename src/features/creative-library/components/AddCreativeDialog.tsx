"use client";

import { Film, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Label, Select } from "@/components/design-system";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { api } from "../client";
import type { App } from "../types";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** "HA_MT_V842_vers1_Faceshape_1080-1920.mp4" → "V842_vers1"; otherwise the cleaned file name. */
function suggestId(fileName: string): string {
  const code = /(?:^|_)(V\d+(?:_vers\d+)?)(?:_|\.|$)/i.exec(fileName)?.[1];
  if (code) return code.toUpperCase().replace("_VERS", "_vers");
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .slice(0, 64);
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** A JPEG of the frame at ~1s, used as the card thumbnail. Null if the browser cannot decode the video. */
async function capturePoster(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  const once = (event: string) =>
    new Promise<void>((resolve, reject) => {
      video.addEventListener(event, () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("decode")), { once: true });
      setTimeout(() => reject(new Error("timeout")), 10000);
    });

  try {
    await once("loadeddata");
    video.currentTime = Math.min(1, (video.duration || 0) / 2);
    await once("seeked");
    const scale = Math.min(1, 720 / (video.videoWidth || 720));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
  }
}

export function AddCreativeDialog({ apps, defaultApp }: { apps: App[]; defaultApp: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [app, setApp] = useState(defaultApp);
  const [tags, setTags] = useState("");
  const [hook, setHook] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!video) return;
    const url = URL.createObjectURL(video);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  const reset = () => {
    setVideo(null);
    setPreviewUrl(null);
    setId("");
    setTags("");
    setHook("");
    setError(null);
    setApp(defaultApp);
  };

  const pick = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("video/")) return setError("That file is not a video.");
    if (file.size > MAX_VIDEO_BYTES) return setError("The video is larger than 100 MB, the eachlabs storage limit.");
    setVideo(file);
    if (!id) setId(suggestId(file.name));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return setError("Choose a video file.");
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("id", id.trim());
      form.set("app", app);
      form.set("tags", tags);
      form.set("hook", hook.trim());
      form.set("video", video);
      const poster = await capturePoster(video);
      if (poster) form.set("poster", new File([poster], "poster.jpg", { type: "image/jpeg" }));

      const creative = await api.createCreative(form);
      toast.success(`${creative.id} was added`);
      setOpen(false);
      reset();
      router.push(`/dashboard/creative-library/${encodeURIComponent(creative.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the creative.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        Add creative
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (saving) return;
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="max-w-xl border-line bg-surface font-sans text-ink shadow-modal">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-bomstad text-page-desc font-semibold text-ink">
                Add creative
              </DialogTitle>
              <DialogDescription className="text-body-sm text-ink-3">
                The video is uploaded to eachlabs storage; its link is what the workflows receive.
              </DialogDescription>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              disabled={saving}
              className="flex items-center gap-4 rounded-lg border border-dashed border-line-strong p-4 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border disabled:opacity-40"
            >
              {previewUrl ? (
                <video src={previewUrl} muted playsInline className="h-24 w-14 shrink-0 rounded-xs bg-muted object-cover" />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-muted text-ink-3">
                  <Film className="size-5" />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-body text-ink">{video ? video.name : "Choose or drop a video"}</span>
                <span className="text-caption text-ink-3">
                  {video ? <span className="font-num tabular-nums">{formatSize(video.size)}</span> : "MP4, MOV or WebM, up to 100 MB"}
                </span>
              </span>
            </button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="creative-id">Creative ID</Label>
                <Input id="creative-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="V842" disabled={saving} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="creative-app">App</Label>
                <Select
                  aria-label="App"
                  value={app}
                  onValueChange={setApp}
                  options={apps.map((a) => ({ value: a.id, label: a.name }))}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="creative-tags">Tags</Label>
                <Input
                  id="creative-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Faceshape, Haircolor"
                  disabled={saving}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="creative-hook">Opening text</Label>
                <Input
                  id="creative-hook"
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="How to find a haircut that suits your face shape"
                  disabled={saving}
                />
              </div>
            </div>

            {error ? <p className="rounded-sm bg-danger-bg px-3 py-2 text-body-sm text-danger">{error}</p> : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !video || !id.trim()}>
                {saving ? "Uploading to eachlabs…" : "Add creative"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
