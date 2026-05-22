export type ThemePreference = "light" | "dark";
export type RecordMode = "hold" | "toggle";
export type RecorderState = "idle" | "recording" | "processing";
export type RecorderSource = "main" | "widget";

export type HistoryEntry = {
  id: string;
  createdAt: string;
  text: string;
  durationSeconds: number;
  wordCount: number;
  characterCount: number;
  language: string;
  source: RecorderSource;
};
