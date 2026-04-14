/**
 * Lightweight markdown-to-HTML converter.
 * Handles headings, bold, italic, code blocks, inline code,
 * unordered/ordered lists, links, blockquotes, and horizontal rules.
 * No external dependencies.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMarkdown(source: string): string {
  const lines = source.split("\n");
  const output: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = "";
  let codeLines: string[] = [];
  let inList: "ul" | "ol" | null = null;

  function closeList() {
    if (inList) {
      output.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
        codeLines = [];
      } else {
        const langClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : "";
        output.push(
          `<div class="code-block"><div class="code-header"><span>${escapeHtml(codeLanguage || "code")}</span></div><pre><code${langClass}>${codeLines.map(escapeHtml).join("\n")}</code></pre></div>`
        );
        inCodeBlock = false;
        codeLanguage = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      closeList();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      output.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      closeList();
      output.push("<hr />");
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      closeList();
      output.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== "ul") {
        closeList();
        inList = "ul";
        output.push("<ul>");
      }
      output.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== "ol") {
        closeList();
        inList = "ol";
        output.push("<ol>");
      }
      output.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    // Paragraph
    closeList();
    output.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();

  // Close unclosed code block
  if (inCodeBlock) {
    output.push(
      `<div class="code-block"><pre><code>${codeLines.map(escapeHtml).join("\n")}</code></pre></div>`
    );
  }

  return output.join("\n");
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);

  // Inline code (before other formatting to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold + italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/_(.+?)_/g, "<em>$1</em>");

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return result;
}
