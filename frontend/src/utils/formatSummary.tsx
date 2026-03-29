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

        // Regular text - split by paragraphs and lines
        const paragraphs = section.content
          .split(/\n\n+/)
          .filter((p) => p.trim());
        return (
          <React.Fragment key={index}>
            {paragraphs.map((paragraph, pIdx) => {
              // Check if this paragraph is a "Report Date:" line
              if (paragraph.trim().startsWith("Report Date:")) {
                return (
                  <p
                    key={pIdx}
                    className="text-sm text-muted-foreground mt-2 mb-4 font-medium"
                  >
                    {paragraph.trim()}
                  </p>
                );
              }

              return (
                <p key={pIdx} className="whitespace-pre-wrap">
                  {paragraph.trim()}
                </p>
              );
            })}
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

// Function to extract biomarkers from summary text
export interface ParsedBiomarker {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
}

export const parseBiomarkersFromSummary = (summary: string): ParsedBiomarker[] => {
  const biomarkers: ParsedBiomarker[] = [];

  // Pattern 1: "Test Name (alternative) is VALUE UNIT, which is ... (RANGE)"
  // E.g., "Blood Sugar (Glucose, Random) is 105 mg/dL, which is within the normal range (70-140 mg/dL)."
  const pattern1 = /([A-Za-z\s,()]+?)\s+is\s+([\d.]+)\s+([a-zA-Z/°µ°]+),\s*which\s+is[^(]*\(([^)]+)\)/gi;

  let match1;
  while ((match1 = pattern1.exec(summary)) !== null) {
    let testName = match1[1].trim();
    // Clean up test name - remove extra parentheses and clean it
    testName = testName.replace(/\s*\([^)]*\)/g, "").trim();

    const value = match1[2];
    const unit = match1[3];
    const normalRange = match1[4];

    if (testName && value && unit && normalRange) {
      biomarkers.push({ name: testName, value, unit, normalRange });
    }
  }

  // Pattern 2: "Test Name is VALUE UNIT (normal range: RANGE)"
  // E.g., "Urea is 22.80 mg/dL (normal range: 15-36 mg/dL)"
  const pattern2 = /([A-Za-z\s]+?)\s+is\s+([\d.]+)\s+([a-zA-Z/°µ°]+)\s*\(normal\s+range:\s*([^)]+)\)/gi;

  let match2;
  while ((match2 = pattern2.exec(summary)) !== null) {
    const testName = match2[1].trim();
    const value = match2[2];
    const unit = match2[3];
    const normalRange = match2[4];

    // Check if this biomarker is already added
    if (
      testName &&
      value &&
      unit &&
      normalRange &&
      !biomarkers.some((b) => b.name.toLowerCase() === testName.toLowerCase())
    ) {
      biomarkers.push({ name: testName, value, unit, normalRange });
    }
  }

  return biomarkers;
};
