"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MAX_HISTORY_ITEMS } from "@/lib/constants";
import { countWords } from "@/lib/utils";
import type { HistoryEntry, RecordMode, RecorderSource, ThemePreference } from "@/types";

type SettingsState = {
  language: string;
  recordMode: RecordMode;
  autoCopy: boolean;
  theme: ThemePreference;
};

type VoraStore = {
  settings: SettingsState;
  currentTranscript: string;
  hasSeenOnboarding: boolean;
  history: HistoryEntry[];
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: string) => void;
  setRecordMode: (mode: RecordMode) => void;
  setAutoCopy: (value: boolean) => void;
  setCurrentTranscript: (value: string) => void;
  dismissOnboarding: () => void;
  addHistoryEntry: (payload: {
    text: string;
    durationSeconds: number;
    language: string;
    source: RecorderSource;
  }) => void;
  clearHistory: () => void;
};

export const useVoraStore = create<VoraStore>()(
  persist(
    (set) => ({
      settings: {
        language: "auto",
        recordMode: "hold",
        autoCopy: true,
        theme: "light"
      },
      currentTranscript: "",
      hasSeenOnboarding: false,
      history: [],
      setTheme: (theme) =>
        set((state) => ({
          settings: {
            ...state.settings,
            theme
          }
        })),
      setLanguage: (language) =>
        set((state) => ({
          settings: {
            ...state.settings,
            language
          }
        })),
      setRecordMode: (recordMode) =>
        set((state) => ({
          settings: {
            ...state.settings,
            recordMode
          }
        })),
      setAutoCopy: (autoCopy) =>
        set((state) => ({
          settings: {
            ...state.settings,
            autoCopy
          }
        })),
      setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),
      dismissOnboarding: () => set({ hasSeenOnboarding: true }),
      addHistoryEntry: ({ text, durationSeconds, language, source }) =>
        set((state) => {
          const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            text,
            durationSeconds,
            wordCount: countWords(text),
            characterCount: text.length,
            language,
            source
          };

          return {
            history: [entry, ...state.history].slice(0, MAX_HISTORY_ITEMS)
          };
        }),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "vora-whisper-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<VoraStore> | undefined;
        const persistedTheme = typedPersisted?.settings?.theme;
        const safeTheme = persistedTheme === "dark" ? "dark" : "light";

        return {
          ...currentState,
          ...typedPersisted,
          settings: {
            ...currentState.settings,
            ...typedPersisted?.settings,
            theme: safeTheme
          }
        };
      },
      partialize: (state) => ({
        settings: state.settings,
        history: state.history,
        hasSeenOnboarding: state.hasSeenOnboarding,
        currentTranscript: state.currentTranscript
      })
    }
  )
);
