import { Fragment, type ReactNode, useMemo, useState } from "react";

interface MarkdownTextProps {
  collapsedHeight?: number;
  markdown: string | null | undefined;
}

interface Block {
  kind: "paragraph" | "unordered-list" | "ordered-list" | "blockquote" | "code" | "heading";
  lines: string[];
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const inlinePattern =
  /(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const matchedText = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${matchedText}-${matchIndex}`}
          className="markdown-text__link"
          href={match[3]}
          rel="noreferrer noopener"
          target="_blank"
        >
          {match[2]}
        </a>,
      );
    } else if (match[5]) {
      nodes.push(
        <code key={`${matchedText}-${matchIndex}`} className="markdown-text__code">
          {match[5]}
        </code>,
      );
    } else if (match[7]) {
      nodes.push(<strong key={`${matchedText}-${matchIndex}`}>{match[7]}</strong>);
    } else if (match[9]) {
      nodes.push(<em key={`${matchedText}-${matchIndex}`}>{match[9]}</em>);
    }

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let currentParagraph: string[] = [];
  let currentList: Block | null = null;
  let currentCode: string[] | null = null;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      blocks.push({ kind: "paragraph", lines: [...currentParagraph] });
      currentParagraph = [];
    }
  }

  function flushList() {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  }

  function flushCode() {
    if (currentCode) {
      blocks.push({ kind: "code", lines: [...currentCode] });
      currentCode = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === "```") {
      flushParagraph();
      flushList();
      if (currentCode) {
        flushCode();
      } else {
        currentCode = [];
      }
      continue;
    }

    if (currentCode) {
      currentCode.push(rawLine);
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!currentList || currentList.kind !== "unordered-list") {
        flushList();
        currentList = { kind: "unordered-list", lines: [] };
      }
      currentList.lines.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || currentList.kind !== "ordered-list") {
        flushList();
        currentList = { kind: "ordered-list", lines: [] };
      }
      currentList.lines.push(orderedMatch[1]);
      continue;
    }

    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "blockquote", lines: [blockquoteMatch[1]] });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        lines: [headingMatch[2]],
      });
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();

  return blocks;
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, index) => {
    const key = `${block.kind}-${index}`;

    if (block.kind === "unordered-list") {
      return (
        <ul key={key} className="markdown-text__list">
          {block.lines.map((line, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(line)}</li>
          ))}
        </ul>
      );
    }

    if (block.kind === "ordered-list") {
      return (
        <ol key={key} className="markdown-text__list">
          {block.lines.map((line, itemIndex) => (
            <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(line)}</li>
          ))}
        </ol>
      );
    }

    if (block.kind === "blockquote") {
      return (
        <blockquote key={key} className="markdown-text__blockquote">
          {renderInlineMarkdown(block.lines.join(" "))}
        </blockquote>
      );
    }

    if (block.kind === "heading") {
      const HeadingTag = `h${block.level ?? 3}` as const;
      return (
        <HeadingTag key={key} className={`markdown-text__heading markdown-text__heading--${block.level ?? 3}`}>
          {renderInlineMarkdown(block.lines.join(" "))}
        </HeadingTag>
      );
    }

    if (block.kind === "code") {
      return (
        <pre key={key} className="markdown-text__pre">
          <code>{block.lines.join("\n")}</code>
        </pre>
      );
    }

    return (
      <p key={key} className="markdown-text__paragraph">
        {block.lines.map((line, lineIndex) => (
          <Fragment key={`${key}-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInlineMarkdown(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

export function MarkdownText({ collapsedHeight = 220, markdown }: MarkdownTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedMarkdown = markdown?.trim() ?? "";
  const blocks = useMemo(() => parseMarkdown(normalizedMarkdown), [normalizedMarkdown]);

  if (normalizedMarkdown.length === 0) {
    return <>Not set</>;
  }

  const shouldCollapse = normalizedMarkdown.length > 320;

  return (
    <div className="markdown-text">
      <div
        className={`markdown-text__content ${!isExpanded && shouldCollapse ? "markdown-text__content--collapsed" : ""}`}
        style={!isExpanded && shouldCollapse ? { maxHeight: `${collapsedHeight}px` } : undefined}
      >
        {renderBlocks(blocks)}
      </div>
      {shouldCollapse ? (
        <button
          className="markdown-text__button"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "Show less" : "Show full text"}
        </button>
      ) : null}
    </div>
  );
}
