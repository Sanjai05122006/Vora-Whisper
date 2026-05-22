"use client";

import { useEffect, useMemo, useState } from "react";
import { Waveform } from "@/components/waveform";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { SHORTCUT_LABEL } from "@/lib/constants";
import { copyText, formatDuration } from "@/lib/utils";
import { useVoraStore } from "@/stores/use-vora-store";

type WidgetAppProps = {
  embedded: boolean;
};

export function WidgetApp({ embedded }: WidgetAppProps) {
  const { settings, setCurrentTranscript, addHistoryEntry } = useVoraStore();
  const [message, setMessage] = useState("Ready");

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const recorder = useAudioRecorder({
    language: settings.language,
    onTranscript: async ({ text, durationSeconds }) => {
      setCurrentTranscript(text);
      addHistoryEntry({
        text,
        durationSeconds,
        language: settings.language,
        source: "widget"
      });

      if (embedded) {
        window.parent.postMessage(
          {
            source: "vora-whisper",
            type: "VORA_INSERT_TRANSCRIPT",
            text
          },
          "*"
        );
        setMessage("Inserted or copied");
      } else if (settings.autoCopy) {
        const copied = await copyText(text);
        setMessage(copied ? "Copied to clipboard" : "Paste manually");
      } else {
        setMessage("Transcript ready");
      }
    },
    onError: (value) => setMessage(value)
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        recorder.toggleRecording();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [recorder]);

  const panelClassName = useMemo(() => {
    if (embedded) {
      return "h-screen w-screen bg-transparent p-0";
    }

    return "min-h-screen bg-canvas p-6";
  }, [embedded]);

  return (
    <main className={panelClassName}>
      <section
        className={`frost-card overflow-hidden ${
          embedded ? "h-full w-full rounded-[18px] border-0 shadow-none" : "mx-auto max-w-sm"
        }`}
      >
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                Widget
              </p>
              <p className="mt-1 text-body-sm text-muted">{SHORTCUT_LABEL}</p>
            </div>
            {embedded ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.parent.postMessage(
                      { source: "vora-whisper", type: "VORA_WIDGET_PIN" },
                      "*"
                    )
                  }
                  className="rounded-sm border border-border px-2.5 py-2 text-caption text-ink transition hover:bg-canvas-soft"
                >
                  Pin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.parent.postMessage(
                      { source: "vora-whisper", type: "VORA_WIDGET_CLOSE" },
                      "*"
                    )
                  }
                  className="rounded-sm border border-border px-2.5 py-2 text-caption text-ink transition hover:bg-canvas-soft"
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>

          <Waveform levels={recorder.levels} active={recorder.status === "recording"} />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">Time</p>
              <p className="mt-1 font-[var(--font-display)] text-display-sm text-ink">
                {formatDuration(recorder.durationSeconds)}
              </p>
            </div>
            <button
              type="button"
              onClick={recorder.toggleRecording}
              disabled={recorder.status === "processing"}
              className="inline-flex h-16 w-16 items-center justify-center rounded-pill border border-transparent bg-primary text-body-sm font-medium text-on-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {recorder.status === "recording" ? "Stop" : "Rec"}
            </button>
          </div>

          <p className="rounded-sm border border-border bg-canvas-soft px-3 py-2 text-body-sm text-muted">
            {recorder.status === "processing" ? "Processing..." : message}
          </p>

          {!embedded ? (
            <p className="text-body-sm text-muted">
              Use the bookmarklet from the main app to float this recorder over any page and insert text into
              the active field.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
