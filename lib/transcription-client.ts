import { MAX_AUDIO_BYTES, TRANSCRIBE_RETRY_LIMIT } from "@/lib/constants";
import { sleep } from "@/lib/utils";

export class TranscriptionError extends Error {
  code: string;
  retryAfter?: number;

  constructor(message: string, code = "transcription_failed", retryAfter?: number) {
    super(message);
    this.name = "TranscriptionError";
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

type TranscribeOptions = {
  audio: Blob;
  language?: string;
  durationSeconds: number;
};

export async function transcribeAudio({
  audio,
  language,
  durationSeconds
}: TranscribeOptions): Promise<{ text: string; durationSeconds: number }> {
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new TranscriptionError("Audio exceeds the 25MB upload limit.");
  }

  const fileName = audio.type.includes("mp4") ? "recording.mp4" : "recording.webm";

  for (let attempt = 0; attempt < TRANSCRIBE_RETRY_LIMIT; attempt += 1) {
    const formData = new FormData();
    formData.append("audio", new File([audio], fileName, { type: audio.type || "audio/webm" }));
    formData.append("duration_seconds", durationSeconds.toFixed(2));

    if (language && language !== "auto") {
      formData.append("language", language);
    }

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json().catch(() => ({}))) as {
      text?: string;
      error?: string;
      message?: string;
      retry_after?: number;
      duration_seconds?: number;
    };

    if (response.ok) {
      return {
        text: payload.text ?? "",
        durationSeconds: payload.duration_seconds ?? durationSeconds
      };
    }

    if (response.status === 429) {
      const retryAfter = payload.retry_after ?? Math.pow(2, attempt);

      if (attempt < TRANSCRIBE_RETRY_LIMIT - 1) {
        await sleep(retryAfter * 1000);
        continue;
      }

      throw new TranscriptionError(
        payload.message ?? "Transcription service is busy — please try again in a few seconds.",
        payload.error ?? "rate_limit",
        retryAfter
      );
    }

    throw new TranscriptionError(
      payload.message ?? "We could not transcribe that recording. Please try again.",
      payload.error ?? "transcription_failed"
    );
  }

  throw new TranscriptionError("Transcription service is busy — please try again in a few seconds.");
}
