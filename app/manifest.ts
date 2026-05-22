import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vora-Whisper",
    short_name: "Vora",
    description: "Unlimited free voice-to-text powered by Groq Whisper.",
    start_url: "/",
    display: "standalone",
    background_color: "#F1F3F5",
    theme_color: "#0F1419",
    icons: []
  };
}
