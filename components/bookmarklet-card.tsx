"use client";

import { useEffect, useMemo, useState } from "react";
import { buildBookmarklet } from "@/lib/bookmarklet";
import { copyText } from "@/lib/utils";

type BookmarkletCardProps = {
  onToast: (message: string) => void;
};

export function BookmarkletCard({ onToast }: BookmarkletCardProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const bookmarklet = useMemo(() => {
    return origin ? buildBookmarklet(origin) : "";
  }, [origin]);

  return (
    <section className="frost-card p-6">
      <div className="space-y-3">
        <p className="font-[var(--font-geist-mono)] text-label uppercase tracking-tight text-muted">
          Floating Widget
        </p>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Speak into any web page.</h2>
          <p className="max-w-2xl text-body text-muted">
            Drag the bookmarklet into your bookmarks bar, open any text field, then launch the compact
            recorder overlay. The widget tries direct text insertion first and falls back to clipboard copy.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <a
            href={bookmarklet || "#"}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-ink transition hover:border-ink/25"
          >
            Drag Bookmarklet
          </a>
          <button
            type="button"
            onClick={async () => {
              if (!bookmarklet) {
                return;
              }

              const copied = await copyText(bookmarklet);
              onToast(copied ? "Bookmarklet copied." : "Clipboard access was blocked.");
            }}
            className="rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-ink transition hover:border-ink/25"
          >
            Copy Bookmarklet
          </button>
          <a
            href="/widget"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-ink transition hover:border-ink/25"
          >
            Open Widget URL
          </a>
        </div>
        <div className="rounded-md border border-border bg-canvas/70 p-4">
          <p className="font-[var(--font-geist-mono)] text-label text-muted">Privacy</p>
          <p className="mt-2 text-sm text-muted">
            Audio is sent to Groq for transcription, then discarded. No recordings are stored server-side.
          </p>
        </div>
      </div>
    </section>
  );
}
