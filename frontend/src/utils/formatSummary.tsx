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
  const seen = new Set<string>();

  // FIRST: Remove XXXX section headers and anything after them in a line
  // This prevents "Recommendations XXXX Other liver function tests..." from being parsed as a test name
  let cleanedSummary = summary.replace(/[^\n]*XXXX[^\n]*/gi, "");

  // Split by common separators to handle multiple tests in one sentence
  const normalizedSummary = cleanedSummary
    .replace(/\s+and\s+/gi, ", ")
    .replace(/,\s*with\s+/gi, ", ");

  // PRIMARY PATTERN 1: "Test Name is VALUE UNIT (normal: RANGE)"
  const pattern1 = /([A-Za-z\s()]+?)\s+is\s+([\d.,]+)\s+([a-zA-Z/%°µ\-/()]+?)\s*\(normal:\s*([^)]+)\)/gi;

  let match1;
  while ((match1 = pattern1.exec(normalizedSummary)) !== null) {
    let testName = match1[1].trim();
    testName = testName.replace(/^(and|,|\s)+/, "").trim();
    testName = testName.replace(/\s*\([^)]*\)/g, "").trim();
    // Filter out common section words that shouldn't be part of test names
    if (testName.toLowerCase().includes("recommendations") || testName.toLowerCase().includes("findings")) {
      continue;
    }

    const value = match1[2];
    const unit = match1[3].trim();
    const normalRange = match1[4].trim();

    const key = testName.toLowerCase();
    if (testName && value && unit && normalRange && !seen.has(key) && testName.length > 2) {
      biomarkers.push({ name: testName, value, unit, normalRange });
      seen.add(key);
      console.log(`✓ Parsed: ${testName} = ${value} ${unit}`);
    }
  }

  console.log(`📊 Total biomarkers parsed: ${biomarkers.length}`);

  // FALLBACK PATTERN 2: "Test Name at VALUE UNIT (normal: RANGE)"
  if (biomarkers.length < 5) {
    const pattern2 = /([A-Za-z\s()]+?)\s+at\s+([\d.,]+)\s+([a-zA-Z/%°µ\-/()]+?)\s*\(normal:\s*([^)]+)\)/gi;

    let match2;
    while ((match2 = pattern2.exec(normalizedSummary)) !== null) {
      let testName = match2[1].trim();
      testName = testName.replace(/^(and|,|\s)+/, "").trim();
      testName = testName.replace(/\s*\([^)]*\)/g, "").trim();
      // Filter out common section words
      if (testName.toLowerCase().includes("recommendations") || testName.toLowerCase().includes("findings")) {
        continue;
      }

      const value = match2[2];
      const unit = match2[3].trim();
      const normalRange = match2[4].trim();

      const key = testName.toLowerCase();
      if (testName && value && unit && normalRange && !seen.has(key) && testName.length > 2) {
        biomarkers.push({ name: testName, value, unit, normalRange });
        seen.add(key);
        console.log(`✓ Parsed (at format): ${testName} = ${value} ${unit}`);
      }
    }
  }

  // FALLBACK PATTERN 3: Original pattern for compatibility
  if (biomarkers.length < 5) {
    const pattern3 = /([A-Za-z\s,()]+?)\s+is\s+([a-z\s]*?)?([\d.,]+)\s+([a-zA-Z/%°µ]+),\s*[^(]*\(([^)]+)\)/gi;

    let match3;
    while ((match3 = pattern3.exec(normalizedSummary)) !== null) {
      let testName = match3[1].trim();
      testName = testName.replace(/^(and|,|\s)+/, "").trim();
      testName = testName.replace(/\s*\([^)]*\)/g, "").trim();
      // Filter out common section words
      if (testName.toLowerCase().includes("recommendations") || testName.toLowerCase().includes("findings")) {
        continue;
      }

      const value = match3[3];
      const unit = match3[4];
      const normalRange = match3[5];

      const key = testName.toLowerCase();
      if (testName && value && unit && normalRange && !seen.has(key) && testName.length > 2) {
        biomarkers.push({ name: testName, value, unit, normalRange });
        seen.add(key);
      }
    }
  }

  return biomarkers;
};
