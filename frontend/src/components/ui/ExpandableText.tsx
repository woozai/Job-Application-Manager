import { useState } from "react";

interface ExpandableTextProps {
  text: string | null | undefined;
  maxLength?: number;
}

export function ExpandableText({ text, maxLength = 180 }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedText = text?.trim() ?? "";

  if (normalizedText.length === 0) {
    return <>Not set</>;
  }

  if (normalizedText.length <= maxLength) {
    return <span>{normalizedText}</span>;
  }

  const shortText = `${normalizedText.slice(0, maxLength).trimEnd()}...`;

  return (
    <div className="expandable-text">
      <p className="expandable-text__content">{isExpanded ? normalizedText : shortText}</p>
      <button
        className="expandable-text__button"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        {isExpanded ? "Show less" : "Show full text"}
      </button>
    </div>
  );
}
