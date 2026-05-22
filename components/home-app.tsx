"use client";

import { useEffect, useMemo, useState } from "react";
import { Waveform } from "@/components/waveform";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { SHORTCUT_LABEL } from "@/lib/constants";
import { WHISPER_LANGUAGES } from "@/lib/languages";
import { copyText, countWords, formatDuration } from "@/lib/utils";
import { useVoraStore } from "@/stores/use-vora-store";

type ToastState = {
  message: string;
  tone: "default" | "danger";
};

const themeLabels = ["light", "dark"] as const;
const recordModes = [
  ["hold", "Hold to record"],
  ["toggle", "Click to toggle"]
] as const;

export function HomeApp() {
  const {
    settings,
    currentTranscript,
    history,
    hasSeenOnboarding,
    setTheme,
    setLanguage,
    setRecordMode,
    setAutoCopy,
    setCurrentTranscript,
    dismissOnboarding,
    addHistoryEntry,
    clearHistory
  } = useVoraStore();

  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (message: string, tone: ToastState["tone"] = "default") => {
    setToast({ message, tone });
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.dataset.theme = settings.theme;
  }, [hydrated, settings.theme]);

  const filteredHistory = useMemo(() => {
    if (!search.trim()) {
      return history;
    }

    const query = search.trim().toLowerCase();
    return history.filter((entry) => entry.text.toLowerCase().includes(query));
  }, [history, search]);

  const recorder = useAudioRecorder({
    language: settings.language,
    onTranscript: async ({ text, durationSeconds }) => {
      setCurrentTranscript(text);
      addHistoryEntry({
        text,
        durationSeconds,
        language: settings.language,
        source: "main"
      });

      if (settings.autoCopy) {
        const copied = await copyText(text);
        showToast(copied ? "Transcript copied to clipboard." : "Clipboard access was blocked.");
      }
    },
    onError: (message) => showToast(message, "danger")
  });

  const transcriptWordCount = countWords(currentTranscript);

  const handlePrimaryPress = () => {
    if (settings.recordMode === "toggle") {
      recorder.toggleRecording();
      return;
    }

    void recorder.startRecording();
  };

  const overlayVisible = hydrated && !hasSeenOnboarding;

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-ink md:px-6 md:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="hero-surface px-6 py-10 md:px-10 md:py-14">
            <div className="max-w-2xl space-y-4">
              <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                Vora-Whisper
              </p>
              <h1 className="font-[var(--font-display)] text-display-lg text-ink md:text-display-xl">
                Welcome. Start speaking.
              </h1>
              <p className="max-w-xl text-body-md text-body">
                A minimal whisper-style recorder for fast transcription. Record, review the text, and
                copy it into whatever you are working on.
              </p>
            </div>
          </div>
        </header>

        <section className="frost-card p-5 md:p-6">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-border pb-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-[var(--font-display)] text-display-sm text-ink">Recorder</p>
                  <p className="mt-1 text-body-sm text-body">
                    {settings.recordMode === "hold"
                      ? "Hold to record, release to transcribe."
                      : "Click once to start, click again to stop."}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start rounded-pill border border-border bg-canvas-soft px-3 py-1.5 text-body-sm text-body">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      recorder.status === "recording"
                        ? "bg-danger"
                        : recorder.status === "processing"
                          ? "bg-border-strong"
                          : "bg-success"
                    }`}
                  />
                  <span>
                    {recorder.status === "recording"
                      ? "Recording"
                      : recorder.status === "processing"
                        ? "Processing"
                        : "Ready"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="block space-y-2">
                    <span className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                      Language
                    </span>
                    <select
                      value={settings.language}
                      onChange={(event) => setLanguage(event.target.value)}
                      className="h-11 w-full rounded-sm border border-border bg-card px-3 text-body-sm text-ink outline-none transition focus:border-border-strong"
                    >
                      {WHISPER_LANGUAGES.map(([code, label]) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-2">
                    <span className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                      Record mode
                    </span>
                    <div className="grid h-11 grid-cols-2 overflow-hidden rounded-sm border border-border bg-card">
                      {recordModes.map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRecordMode(value)}
                          className={`px-3 text-left text-body-sm transition ${
                            settings.recordMode === value
                              ? "bg-canvas-soft-2 text-ink"
                              : "text-body hover:bg-canvas-soft"
                          }`}
                        >
                          {label.replace(" to ", "/")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                      Theme
                    </span>
                    <div className="grid h-11 grid-cols-2 overflow-hidden rounded-sm border border-border bg-card">
                      {themeLabels.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTheme(value)}
                          className={`px-3 text-body-sm capitalize transition ${
                            settings.theme === value
                              ? "bg-canvas-soft-2 text-ink"
                              : "text-body hover:bg-canvas-soft"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex h-11 items-center justify-between rounded-sm border border-border bg-card px-3">
                    <div>
                      <span className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                        Auto-copy
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoCopy}
                      onChange={(event) => setAutoCopy(event.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-canvas-soft px-4 py-3 md:min-w-[190px] md:flex-col md:items-start">
                  <div>
                    <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                      Duration
                    </p>
                    <p className="mt-1 text-display-sm text-ink">{formatDuration(recorder.durationSeconds)}</p>
                  </div>
                  <p className="text-body-sm text-muted">{SHORTCUT_LABEL}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-lg border border-border bg-canvas-soft p-4">
                <div className="flex h-full flex-col items-center justify-between gap-4">
                  <div className="w-full">
                    <Waveform levels={recorder.levels} active={recorder.status === "recording"} />
                  </div>
                  <button
                    type="button"
                    onClick={settings.recordMode === "toggle" ? handlePrimaryPress : undefined}
                    onPointerDown={(event) => {
                      if (settings.recordMode !== "hold") {
                        return;
                      }

                      event.currentTarget.setPointerCapture(event.pointerId);
                      void recorder.startRecording();
                    }}
                    onPointerUp={() => {
                      if (settings.recordMode === "hold") {
                        recorder.stopRecording();
                      }
                    }}
                    onPointerCancel={() => {
                      if (settings.recordMode === "hold") {
                        recorder.stopRecording();
                      }
                    }}
                    onPointerLeave={() => {
                      if (settings.recordMode === "hold") {
                        recorder.stopRecording();
                      }
                    }}
                    disabled={recorder.status === "processing"}
                    className="inline-flex h-14 w-full items-center justify-center rounded-pill border border-transparent bg-primary px-5 text-body-sm font-medium text-on-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {recorder.status === "recording" ? "Stop recording" : "Start transcribing"}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-[var(--font-display)] text-display-sm text-ink">Transcript</p>
                    <p className="mt-1 text-body-sm text-body">Edit before copying if you need to.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!currentTranscript.trim()) {
                          return;
                        }

                        const copied = await copyText(currentTranscript);
                        showToast(copied ? "Transcript copied to clipboard." : "Clipboard access was blocked.");
                      }}
                      className="rounded-sm border border-border bg-card px-3 py-2 text-body-sm text-ink transition hover:bg-canvas-soft"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTranscript("")}
                      className="rounded-sm border border-border bg-card px-3 py-2 text-body-sm text-ink transition hover:bg-canvas-soft"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    value={currentTranscript}
                    onChange={(event) => setCurrentTranscript(event.target.value)}
                    placeholder="Your transcript appears here."
                    className="h-64 w-full resize-none rounded-sm border border-border bg-canvas-soft px-4 py-3 text-body-md text-ink outline-none transition focus:border-border-strong"
                  />
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-body-sm text-muted">
                    <span>{transcriptWordCount} words</span>
                    <span>{currentTranscript.length} characters</span>
                    <span>{settings.language === "auto" ? "Auto-detect" : settings.language.toUpperCase()}</span>
                  </div>
                  {recorder.errorMessage ? (
                    <p className="mt-3 text-body-sm text-danger">{recorder.errorMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="frost-card p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-[var(--font-display)] text-display-sm text-ink">History</p>
              <p className="mt-1 text-body-sm text-body">Recent transcripts from this browser session.</p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search history"
                className="h-11 min-w-[220px] rounded-sm border border-border bg-card px-3 text-body-sm text-ink outline-none transition focus:border-border-strong"
              />
              <button
                type="button"
                onClick={clearHistory}
                className="h-11 rounded-sm border border-border bg-card px-4 text-body-sm text-ink transition hover:bg-canvas-soft"
              >
                Clear history
              </button>
            </div>
          </div>

          <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {filteredHistory.length ? (
              filteredHistory.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={async () => {
                    setCurrentTranscript(entry.text);
                    const copied = await copyText(entry.text);
                    showToast(copied ? "History item copied." : "Clipboard access was blocked.");
                  }}
                  className="w-full rounded-lg border border-border bg-card p-4 text-left transition hover:bg-canvas-soft"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-3 text-body-sm text-muted">
                      <span>{formatDuration(entry.durationSeconds)}</span>
                      <span>{entry.wordCount} words</span>
                      <span>{entry.language === "auto" ? "Auto" : entry.language.toUpperCase()}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-body-md text-ink">{entry.text}</p>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-body-sm text-muted">
                No transcriptions yet.
              </div>
            )}
          </div>
        </section>

      </div>

      {overlayVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4">
          <div className="frost-card max-w-xl animate-floatIn p-8">
            <div className="space-y-5">
              <p className="font-[var(--font-mono)] text-caption uppercase tracking-normal text-muted">
                First-Time Setup
              </p>
              <div className="space-y-3">
                <h2 className="font-[var(--font-display)] text-display-md text-ink">
                  Unlimited voice-to-text. No account needed.
                </h2>
                <p className="text-body-md text-body">
                  Vora-Whisper records in your browser, sends the audio securely to Groq for transcription,
                  then copies the result back to your clipboard. Nothing is stored on the server.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={async () => {
                    dismissOnboarding();
                    await recorder.startRecording();
                  }}
                  className="rounded-pill border border-transparent bg-primary px-5 py-3 text-body-sm font-medium text-on-primary transition hover:opacity-95"
                >
                  Try it now
                </button>
                <button
                  type="button"
                  onClick={dismissOnboarding}
                  className="rounded-sm border border-border px-5 py-3 text-body-sm text-ink transition hover:bg-canvas-soft"
                >
                  Continue without recording
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-sm px-4 py-3 text-body-sm shadow-card ${
            toast.tone === "danger" ? "toast-surface-danger" : "toast-surface"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </main>
  );
}
