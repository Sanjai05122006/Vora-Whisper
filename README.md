<div align="center">

<img src="https://img.shields.io/badge/Vora-Whisper-8B5CF6?style=for-the-badge&logoColor=white" alt="Vora Whisper" />

# Vora Whisper

**Unlimited voice-to-text transcription — fast, accurate, and completely free.**

No installs. No API keys. No usage caps. Just speak.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/Groq-Whisper-F55036?style=flat-square&logoColor=white)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Browser Support](#browser-support)
- [Security](#security)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Overview

**Vora Whisper** is a lightweight SaaS transcription app that converts speech to text instantly using Groq's `whisper-large-v3` model — one of the fastest Whisper inference engines available.

Built for people who think faster than they type. Open the app, hit record, and your words become text in under 2 seconds.

**Who it's for:**

| User | Use Case |
|------|----------|
| Developers | Dictating prompts, notes, and documentation |
| Knowledge workers | Composing emails, memos, and reports by voice |
| Students | Capturing lecture notes hands-free |
| Accessibility users | Replacing keyboard input entirely |

---

## Features

- **Unlimited free transcription** — no weekly caps or paywalls
- **Sub-2 second latency** — powered by Groq's ultra-fast inference
- **Zero setup** — no account, no API key, no install required
- **Auto-copy to clipboard** — transcribed text is ready to paste immediately
- **Session history** — previous transcriptions persisted via localStorage
- **Multi-language support** — transcribe in any language Whisper supports
- **Floating widget** — accessible transcription overlay on any workflow
- **Keyboard shortcuts** — hands-free start/stop recording
- **Secure server-side API handling** — your audio never touches third-party clients

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Transcription | Groq Whisper API (`whisper-large-v3`) |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Audio Capture | MediaRecorder API |

---

## Architecture

```
User Speech
     │
     ▼
MediaRecorder API        ← Captures audio in WebM/Opus format
     │
     ▼
POST /api/transcribe     ← Secure Next.js API route
     │
     ▼
Groq Whisper API         ← whisper-large-v3 inference
     │
     ▼
Transcribed Text
     │
     ▼
Clipboard + UI Output    ← Auto-copied and rendered instantly
```

The API key never leaves the server. Audio is streamed directly to Groq and no audio is stored at any point.

---

## Project Structure

```
app/
├── api/
│   └── transcribe/       # POST endpoint — Groq API relay
├── widget/               # Floating transcription overlay
├── settings/             # User preferences
├── history/              # localStorage session history
├── components/           # Shared UI components
├── hooks/                # Custom React hooks (recording, clipboard)
├── store/                # Zustand state management
├── lib/                  # Utility functions
└── styles/               # Global styles
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjai05122006/Vora-Whisper.git
cd Vora-Whisper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
```

> **Getting a Groq API key:** Sign up at [console.groq.com](https://console.groq.com), create a new API key, and paste it above. It's free.

### 4. Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for Whisper inference |

---

## API Reference

### `POST /api/transcribe`

Accepts audio data and returns a transcription.

**Request**

```
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio` | `Blob` (WebM/Opus) | ✅ | Raw audio recording |
| `language` | `string` | ❌ | ISO 639-1 language code (e.g. `en`, `fr`) |

**Success Response** `200`

```json
{
  "text": "Hello world",
  "duration_seconds": 4.2
}
```

**Error Responses**

| Status | Body | Cause |
|--------|------|-------|
| `429` | `{ "error": "rate_limit" }` | Groq API rate limit hit |
| `500` | `{ "error": "transcription_failed" }` | Groq processing error |

---

## Browser Support

| Browser | Support |
|---------|---------|
| ![Chrome](https://img.shields.io/badge/-Chrome-4285F4?logo=google-chrome&logoColor=white&style=flat-square) Chrome | ✅ |
| ![Edge](https://img.shields.io/badge/-Edge-0078D7?logo=microsoft-edge&logoColor=white&style=flat-square) Edge | ✅ |
| ![Firefox](https://img.shields.io/badge/-Firefox-FF7139?logo=firefox-browser&logoColor=white&style=flat-square) Firefox | ✅ |
| ![Safari](https://img.shields.io/badge/-Safari-006CFF?logo=safari&logoColor=white&style=flat-square) Safari | ✅ |
| ![Mobile Chrome](https://img.shields.io/badge/-Mobile%20Chrome-4285F4?logo=google-chrome&logoColor=white&style=flat-square) Mobile Chrome | ✅ |

---

## Security

| Measure | Detail |
|---------|--------|
| **Server-side API key** | `GROQ_API_KEY` is never exposed to the client |
| **No audio storage** | Audio is streamed to Groq and immediately discarded |
| **HTTPS enforced** | All traffic encrypted via Vercel's TLS |
| **Rate limiting** | Supported at the API route level |
| **No authentication** | No user data collected or stored server-side |

---

## Future Enhancements

- Real-time streaming transcription
- Mobile apps (iOS / Android)
- Speaker diarization
- Translation support
- Team collaboration features
- Public developer API

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: describe your change"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request with a clear description of the change

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

Found a bug or have a suggestion? [Open an issue](https://github.com/Sanjai05122006/Vora-Whisper/issues).

---

## Acknowledgements

- [Groq](https://groq.com/) — for ultra-fast Whisper inference
- [Vercel](https://vercel.com/) — for seamless hosting and deployment
- [OpenAI](https://openai.com/research/whisper) — for the original Whisper research

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

---

*Voice input should be as effortless as typing — instant, accurate, and accessible to everyone.*

If Vora Whisper saved you some keystrokes, give it a ⭐

[![GitHub stars](https://img.shields.io/github/stars/Sanjai05122006/Vora-Whisper?style=social)](https://github.com/Sanjai05122006/Vora-Whisper/stargazers)

<br/>

Made with ❤️ by **[Sanjai](https://github.com/Sanjai05122006)**

</div>
