# Vora-Whisper

> Unlimited voice-to-text transcription powered by Groq Whisper API — fast, accurate, and completely free.

---

## Overview

Vora-Whisper is a lightweight SaaS transcription app that lets users speak naturally and instantly convert speech into text using Groq’s `whisper-large-v3` model.

No installs.  
No API keys.  
No weekly usage caps.  
Just open the app, record, and start dictating.

The product is designed for:
- Developers dictating AI prompts
- Knowledge workers writing notes/emails/docs
- Students creating lecture notes
- Accessibility-focused users who prefer speaking over typing

---

# Key Features

- Unlimited free transcription
- Groq Whisper integration (`whisper-large-v3`)
- Sub-2 second transcription latency
- Zero setup experience
- Auto-copy to clipboard
- Session history using localStorage
- Multi-language support
- Floating transcription widget
- Keyboard shortcuts
- Secure server-side API handling
- No authentication required

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Transcription | Groq Whisper API |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Audio Capture | MediaRecorder API |

---

# Architecture

```txt
User Speech
    ↓
MediaRecorder API
    ↓
POST /api/transcribe
    ↓
Next.js API Route
    ↓
Groq Whisper API
    ↓
Transcribed Text
    ↓
Clipboard + UI Output
```

---

# Core User Flow

```txt
Open App
   ↓
Grant Microphone Access
   ↓
Start Recording
   ↓
Speak Naturally
   ↓
Stop Recording
   ↓
Processing...
   ↓
Instant Transcription
   ↓
Auto-Copied to Clipboard
```

---

# Project Structure

```txt
app/
├── api/
│   └── transcribe/
├── widget/
├── settings/
├── history/
├── components/
├── hooks/
├── store/
├── lib/
└── styles/
```

---

# Environment Variables

Create a `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key
```

---

# Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/vora-whisper.git
cd vora-whisper
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

Application runs at:

```txt
http://localhost:3000
```

---

# API Route

## POST `/api/transcribe`

### Request

```txt
multipart/form-data
```

| Field | Type |
|---|---|
| audio | Blob (WebM/Opus) |
| language | string (optional) |

### Response

```json
{
  "text": "Hello world",
  "duration_seconds": 4.2
}
```

### Error Responses

```json
{
  "error": "rate_limit"
}
```

```json
{
  "error": "transcription_failed"
}
```

---

# Security

- Groq API key never exposed to client
- Audio streamed directly to Groq
- No server-side audio storage
- HTTPS enforced via Vercel
- Request rate limiting supported

---

# Browser Support

| Browser | Support |
|---|---|
| Chrome | ✅ |
| Edge | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Mobile Chrome | ✅ |

---

# Product Goals

- Zero weekly limits
- Zero setup friction
- Fast transcription experience
- Reliable voice-to-text workflow
- Broad accessibility support

---

# Future Enhancements

- Real-time streaming transcription
- Mobile apps
- Speaker diarization
- Translation support
- Team collaboration
- Public developer API

---

# Contributing

```bash
# create branch
git checkout -b feature/amazing-feature

# commit changes
git commit -m "feat: add amazing feature"

# push branch
git push origin feature/amazing-feature
```

---

# License

MIT License

---

# Acknowledgements

- Groq for ultra-fast Whisper inference
- Vercel for hosting infrastructure
- OpenAI for the original Whisper research

---

# Vision

Vora-Whisper aims to make voice input as effortless and universal as typing — instant, accurate, and accessible to everyone.