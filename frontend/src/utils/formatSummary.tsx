import React from "react";

export const SummaryDisplay = ({ summary }: { summary: string }) => {
  if (!summary) return null;

  // Process the summary to find and format XXXX sections
  const sections = [];
  let currentIndex = 0;
  const regex = /XXXX\s*([^X]+?)\s*XXXX/g;
  let match;

  while ((match = regex.exec(summary)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      const textBefore = summary.substring(currentIndex, match.index).trim();
      if (textBefore) {
        sections.push({ type: "text", content: textBefore });
      }
    }

    // Add the matched header
    sections.push({ type: "header", content: match[1].trim() });

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < summary.length) {
    const textAfter = summary.substring(currentIndex).trim();
    if (textAfter) {
      sections.push({ type: "text", content: textAfter });
    }
  }

  // If no XXXX markers found, treat entire summary as text
  if (sections.length === 0) {
    sections.push({ type: "text", content: summary });
  }

  return (
    <div className="text-foreground leading-relaxed">
      {sections.map((section, index) => {
        if (section.type === "header") {
          return (
            <p
              key={index}
              className={`font-bold text-lg ${index === 0 ? "" : "mt-4"}`}
            >
              {section.content}
            </p>
          );
        }

        // Regular text - split by paragraphs
        const paragraphs = section.content
          .split(/\n\n+/)
          .filter((p) => p.trim());
        return (
          <React.Fragment key={index}>
            {paragraphs.map((paragraph, pIdx) => (
              <p key={pIdx} className="whitespace-pre-wrap">
                {paragraph.trim()}
              </p>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Function to clean summary for audio playback (remove XXXX markers)
export const cleanSummaryForAudio = (summary: string): string => {
  return summary.replace(/XXXX\s*([^X]+?)\s*XXXX/g, "$1");
};
