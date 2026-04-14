"use client";

import { useMemo, useCallback } from "react";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard API not available
    }
  }, [content]);

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded border border-zinc-600"
        title="Copy report"
      >
        Copy
      </button>
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
