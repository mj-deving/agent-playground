# Agent Playground

Interactive chat UI for AI research agents. Connect to a managed-agent-poc backend and run basic or plan-and-reflect research workflows through a streaming real-time interface with conversation history, markdown rendering, and run metadata.

![Screenshot placeholder](docs/screenshot.png)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Fonts:** Inter + Space Grotesk (Google Fonts)
- **State:** useReducer + custom hooks
- **Storage:** localStorage for conversation history
- **Streaming:** Server-Sent Events (SSE) via ReadableStream API

## Architecture

```
Browser (React)
  |
  |  POST /api/research (SSE stream)
  v
Next.js API Route
  |
  |  POST /research (JSON)
  v
managed-agent-poc (localhost:8000)
```

The Next.js API route wraps the synchronous backend response in an SSE stream with progress events, demonstrating real streaming architecture. The frontend consumes events through the Fetch API ReadableStream reader, updating the chat in real-time.

## Running

**Prerequisites:** managed-agent-poc backend running on `http://localhost:8000`

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build && npm start
```

The app runs on `http://localhost:3000` by default.

Set `BACKEND_URL` environment variable to override the backend address.

## Features

- **Dual agent modes:** Basic single-pass research and Plan + Reflect iterative reasoning
- **SSE streaming:** Real-time progress events and chunked report delivery
- **Markdown rendering:** Headings, lists, code blocks, links, blockquotes
- **Conversation history:** Persisted in localStorage with create/select/delete
- **Run metadata:** Word count, elapsed time, and mode displayed per response
- **Backend health monitoring:** Automatic polling with status indicator
- **Responsive design:** Desktop sidebar collapses on mobile
- **Copy reports:** One-click copy of agent output
- **Dark theme:** #0a0a0f background with Electric Blue accents
- **Error handling:** Backend offline, timeout, and cancellation states

## File Structure

```
app/
  layout.tsx           Root layout with fonts and metadata
  page.tsx             Main playground page
  globals.css          Tailwind + markdown + animation styles
  api/
    research/route.ts  SSE streaming proxy to backend
    health/route.ts    Backend health check endpoint
components/
  AgentSelector.tsx    Mode toggle (Basic / Plan+Reflect)
  ChatInput.tsx        Text input with send/cancel
  ChatMessage.tsx      Message bubble with avatar and metadata
  MarkdownRenderer.tsx Lightweight markdown-to-HTML converter
  MetadataSidebar.tsx  History list and run stats
  ThinkingIndicator.tsx Animated dots during agent processing
hooks/
  useResearchAgent.ts  SSE lifecycle, state reducer, localStorage
lib/
  types.ts             TypeScript type definitions
  markdown.ts          Zero-dependency markdown parser
  storage.ts           localStorage wrapper
```
