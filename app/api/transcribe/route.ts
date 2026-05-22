import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { MAX_AUDIO_BYTES, MAX_RECORDING_MINUTES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const routeLimiter = createRateLimiter("transcribe-route", 30, 60_000);

export async function POST(request: NextRequest) {
  if (!groq) {
    return NextResponse.json(
      {
        error: "transcription_failed",
        message: "Server is missing GROQ_API_KEY."
      },
      { status: 500 }
    );
  }

  const ip = getClientIp(request.headers);
  const limitState = routeLimiter.check(ip);

  if (!limitState.allowed) {
    console.warn("Server route limit hit", { ip, retryAfter: limitState.retryAfter });
    return NextResponse.json(
      {
        error: "rate_limit",
        retry_after: limitState.retryAfter,
        message: "Transcription service is busy — please try again in a few seconds."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitState.retryAfter)
        }
      }
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio");
    const languageValue = formData.get("language");
    const durationValue = formData.get("duration_seconds");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error: "transcription_failed",
          message: "Audio file is required."
        },
        { status: 400 }
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        {
          error: "transcription_failed",
          message: "Audio exceeds the 25MB upload limit."
        },
        { status: 413 }
      );
    }

    const durationSeconds = Number(durationValue ?? 0);

    if (durationSeconds > MAX_RECORDING_MINUTES * 60) {
      return NextResponse.json(
        {
          error: "transcription_failed",
          message: `Recordings are limited to ${MAX_RECORDING_MINUTES} minutes.`
        },
        { status: 400 }
      );
    }

    const language =
      typeof languageValue === "string" && languageValue !== "auto" ? languageValue : undefined;
    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    const groqFile = new File([audioBuffer], audio.name || "recording.webm", {
      type: audio.type || "audio/webm"
    });

    const transcription = await groq.audio.transcriptions.create({
      file: groqFile,
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0,
      ...(language ? { language } : {})
    });

    return NextResponse.json({
      text: transcription.text ?? "",
      duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : 0
    });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? error.status : null;
    const retryAfter =
      typeof error === "object" && error && "headers" in error
        ? Number((error.headers as Headers | undefined)?.get("retry-after") ?? 3)
        : 3;

    if (status === 429) {
      console.warn("Groq rate limit hit", { ip, retryAfter });
      return NextResponse.json(
        {
          error: "rate_limit",
          retry_after: retryAfter,
          message: "Transcription service is busy — please try again in a few seconds."
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter)
          }
        }
      );
    }

    console.error("Transcription request failed", error);

    return NextResponse.json(
      {
        error: "transcription_failed",
        message: "We could not transcribe that recording. Please try again."
      },
      { status: 500 }
    );
  }
}
