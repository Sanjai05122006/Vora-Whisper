"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_AUDIO_BYTES, MAX_RECORDING_MINUTES } from "@/lib/constants";
import { TranscriptionError, transcribeAudio } from "@/lib/transcription-client";
import type { RecorderState } from "@/types";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus"
];

type UseAudioRecorderOptions = {
  language: string;
  onTranscript: (payload: { text: string; durationSeconds: number }) => Promise<void> | void;
  onError?: (message: string) => void;
};

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  return MIME_CANDIDATES.find((value) => MediaRecorder.isTypeSupported(value)) ?? "";
}

export function useAudioRecorder({ language, onTranscript, onError }: UseAudioRecorderOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const stopRequestedRef = useRef(false);

  const [status, setStatus] = useState<RecorderState>("idle");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array.from({ length: 24 }, () => 0.18));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearRuntime = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => clearRuntime, [clearRuntime]);

  const handleError = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setStatus("idle");
      onError?.(message);
    },
    [onError]
  );

  const animateWaveform = useCallback(() => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bucketSize = Math.floor(data.length / 24) || 1;
    const nextLevels = Array.from({ length: 24 }, (_, index) => {
      const slice = data.slice(index * bucketSize, (index + 1) * bucketSize);
      const avg = slice.reduce((sum, value) => sum + value, 0) / Math.max(slice.length, 1);
      return Math.max(0.14, avg / 255);
    });

    setLevels(nextLevels);
    rafRef.current = window.requestAnimationFrame(animateWaveform);
  }, []);

  const finalizeRecording = useCallback(async () => {
    const blob = new Blob(chunksRef.current, {
      type: mediaRecorderRef.current?.mimeType || getSupportedMimeType() || "audio/webm"
    });
    chunksRef.current = [];

    clearRuntime();

    if (!blob.size) {
      handleError("No audio was captured. Please try again.");
      return;
    }

    if (blob.size > MAX_AUDIO_BYTES) {
      handleError("Audio exceeds the 25MB upload limit.");
      return;
    }

    setStatus("processing");

    try {
      const result = await transcribeAudio({
        audio: blob,
        language,
        durationSeconds: durationRef.current
      });

      await onTranscript(result);
      setStatus("idle");
      setErrorMessage(null);
    } catch (error) {
      const message =
        error instanceof TranscriptionError
          ? error.message
          : "We could not transcribe that recording. Please try again.";
      handleError(message);
    }
  }, [clearRuntime, handleError, language, onTranscript]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || stopRequestedRef.current) {
      return;
    }

    stopRequestedRef.current = true;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (status === "recording" || status === "processing") {
      return;
    }

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      handleError("This browser does not support microphone recording.");
      return;
    }

    try {
      setErrorMessage(null);
      stopRequestedRef.current = false;
      chunksRef.current = [];
      setLevels(Array.from({ length: 24 }, () => 0.18));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        void finalizeRecording();
      };

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;
      animateWaveform();

      recorder.start();
      startedAtRef.current = Date.now();
      durationRef.current = 0;
      setDurationSeconds(0);
      setStatus("recording");

      timerRef.current = window.setInterval(() => {
        const nextDuration = (Date.now() - startedAtRef.current) / 1000;
        durationRef.current = nextDuration;
        setDurationSeconds(nextDuration);

        if (nextDuration >= MAX_RECORDING_MINUTES * 60) {
          stopRecording();
        }
      }, 120);
    } catch (error) {
      console.error("Microphone start failed", error);
      handleError("Microphone access was blocked. Please allow access and try again.");
      clearRuntime();
    }
  }, [animateWaveform, clearRuntime, finalizeRecording, handleError, status, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (status === "recording") {
      stopRecording();
      return;
    }

    void startRecording();
  }, [startRecording, status, stopRecording]);

  return {
    status,
    durationSeconds,
    levels,
    errorMessage,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
