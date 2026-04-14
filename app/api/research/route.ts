import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

interface ResearchPayload {
  topic: string;
  mode: "basic" | "plan-reflect";
}

function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * POST /api/research
 *
 * Proxies to the managed-agent-poc backend and wraps the synchronous
 * response in an SSE stream with progress events.
 * This demonstrates real SSE/streaming architecture even though
 * the underlying API returns a single response.
 */
export async function POST(request: NextRequest) {
  let payload: ResearchPayload;

  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!payload.topic || typeof payload.topic !== "string") {
    return new Response("Missing or invalid 'topic' field", { status: 400 });
  }

  if (!["basic", "plan-reflect"].includes(payload.mode)) {
    return new Response("Mode must be 'basic' or 'plan-reflect'", {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)));
      };

      try {
        // Phase 1: Thinking
        send("status", { message: "Initializing research agent..." });
        await delay(400);

        send("status", {
          message: `Starting ${payload.mode === "plan-reflect" ? "Plan + Reflect" : "Basic"} research...`,
        });
        await delay(600);

        send("status", { message: "Searching and analyzing sources..." });

        // Phase 2: Call backend
        const controller_ = new AbortController();
        const timeout = setTimeout(() => controller_.abort(), 300_000); // 5 min — agents need 60-180s

        const backendResponse = await fetch(`${BACKEND_URL}/research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: payload.topic,
            mode: payload.mode,
          }),
          signal: controller_.signal,
        });

        clearTimeout(timeout);

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          send("error", {
            message: `Backend error (${backendResponse.status}): ${errorText}`,
          });
          controller.close();
          return;
        }

        const result = await backendResponse.json();
        const report: string = result.report ?? result.result ?? "";

        if (!report) {
          send("error", { message: "Backend returned empty report" });
          controller.close();
          return;
        }

        // Phase 3: Stream the report in paragraph chunks
        send("status", { message: "Compiling research report..." });
        await delay(300);

        const paragraphs = report.split(/\n\n+/);
        for (let i = 0; i < paragraphs.length; i++) {
          const chunk =
            i < paragraphs.length - 1
              ? paragraphs[i] + "\n\n"
              : paragraphs[i];

          send("chunk", { content: chunk });

          // Variable delay based on chunk size for natural feel
          const chunkDelay = Math.min(50 + paragraphs[i].length * 0.5, 200);
          await delay(chunkDelay);
        }

        // Phase 4: Metadata
        send("metadata", {
          words: countWords(report),
          mode: payload.mode,
        });

        send("done", {});
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "AbortError"
            ? "Request timed out (300s) — research agents can take 1-3 minutes"
            : err instanceof Error
              ? err.message
              : "Unknown backend error";

        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
