import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

const themeBootstrap = `
  (function () {
    try {
      var stored = window.localStorage.getItem("vora-whisper-store");
      var theme = stored ? JSON.parse(stored).state?.settings?.theme : "light";
      var root = document.documentElement;
      root.dataset.theme = theme === "dark" ? "dark" : "light";
    } catch (error) {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const metadata: Metadata = {
  title: "Vora-Whisper",
  description: "Unlimited free voice-to-text powered by Groq Whisper."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="font-[var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
