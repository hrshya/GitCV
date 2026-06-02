import type { ReactNode } from "react";

type MarkdownHtmlBlock = {
  align?: "center" | "left" | "right" | "justify";
  content: string;
  tag: "div" | "h1" | "h2" | "h3" | "p";
};

type ResumeMarkdownPreviewProps = {
  markdown: string;
};

export function ResumeMarkdownPreview({ markdown }: ResumeMarkdownPreviewProps) {
  return <>{renderMarkdownPreview(markdown)}</>;
}

function renderMarkdownPreview(markdown: string) {
  const elements: ReactNode[] = [];
  const listItems: string[] = [];

  function flushList(key: string) {
    if (listItems.length === 0) {
      return;
    }

    elements.push(
      <ul key={key}>
        {listItems.splice(0).map((item, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
  }

  markdown.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList(`list-${index}`);
      return;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList(`list-${index}`);
      const level = headingMatch[1].length as 1 | 2 | 3;
      const headingBody = headingMatch[2].trim();
      const htmlBlock = parseHtmlBlock(headingBody);
      const content = htmlBlock?.content || headingBody;
      const className = htmlBlock?.align ? `markdown-align-${htmlBlock.align}` : undefined;

      elements.push(renderHeading(level, content, index, className));
      return;
    }

    const htmlBlock = parseHtmlBlock(line);
    if (htmlBlock) {
      flushList(`list-${index}`);

      if (htmlBlock.tag === "h1") {
        elements.push(renderHeading(1, htmlBlock.content, index, htmlBlock.align ? `markdown-align-${htmlBlock.align}` : undefined));
        return;
      }

      if (htmlBlock.tag === "h2") {
        elements.push(renderHeading(2, htmlBlock.content, index, htmlBlock.align ? `markdown-align-${htmlBlock.align}` : undefined));
        return;
      }

      if (htmlBlock.tag === "h3") {
        elements.push(renderHeading(3, htmlBlock.content, index, htmlBlock.align ? `markdown-align-${htmlBlock.align}` : undefined));
        return;
      }

      elements.push(
        <p className={htmlBlock.align ? `markdown-align-${htmlBlock.align}` : undefined} key={index}>
          {renderInlineMarkdown(htmlBlock.content)}
        </p>
      );
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      listItems.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }

    flushList(`list-${index}`);
    elements.push(<p key={index}>{renderInlineMarkdown(line)}</p>);
  });

  flushList("list-final");

  return elements.length > 0 ? elements : <p>The preview will appear here.</p>;
}

function renderHeading(level: 1 | 2 | 3, content: string, key: number, className?: string) {
  const splitContent = splitRightAlignedContent(content);
  const headingContent = splitContent ? (
    <>
      <span>{renderInlineMarkdown(splitContent.left)}</span>
      <span className="markdown-right">{renderInlineMarkdown(splitContent.right)}</span>
    </>
  ) : (
    renderInlineMarkdown(content)
  );
  const mergedClassName = [className, splitContent ? "markdown-line-with-right" : ""].filter(Boolean).join(" ") || undefined;

  if (level === 1) {
    return (
      <h1 className={mergedClassName} key={key}>
        {headingContent}
      </h1>
    );
  }

  if (level === 2) {
    return (
      <h2 className={mergedClassName} key={key}>
        {headingContent}
      </h2>
    );
  }

  return (
    <h3 className={mergedClassName} key={key}>
      {headingContent}
    </h3>
  );
}

function renderInlineMarkdown(text: string) {
  return normalizeInlineHtml(text).split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function splitRightAlignedContent(text: string): { left: string; right: string } | null {
  const rightSpanMatch = text.match(/^(.*?)<span[^>]*(?:class=["'][^"']*\bright\b[^"']*["']|style=["'][^"']*(?:float\s*:\s*right|text-align\s*:\s*right)[^"']*["'])[^>]*>([\s\S]*?)<\/span>\s*$/i);

  if (!rightSpanMatch) {
    return null;
  }

  return {
    left: rightSpanMatch[1].trim(),
    right: rightSpanMatch[2].trim(),
  };
}

function parseHtmlBlock(line: string): MarkdownHtmlBlock | null {
  const match = line.match(/^<(p|div|h1|h2|h3)([^>]*)>([\s\S]*)<\/\1>$/i);

  if (!match) {
    return null;
  }

  const tag = match[1].toLowerCase() as MarkdownHtmlBlock["tag"];
  const attributes = match[2] || "";
  const alignMatch = attributes.match(/\balign=["']?(center|left|right|justify)["']?/i);
  const styleAlignMatch = attributes.match(/text-align\s*:\s*(center|left|right|justify)/i);
  const align = (alignMatch?.[1] || styleAlignMatch?.[1])?.toLowerCase() as
    | MarkdownHtmlBlock["align"]
    | undefined;

  return {
    align,
    content: match[3].trim(),
    tag,
  };
}

function normalizeInlineHtml(text: string) {
  return decodeHtmlEntities(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong|b)>/gi, "**")
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<(em|i)>/gi, "")
    .replace(/<\/(em|i)>/gi, "")
    .replace(/<\/?[^>]+>/g, "");
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}
