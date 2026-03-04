import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "data", "questions.json");

const RAW_URL =
  "/questions/questions1.md";

// Known sections to include (match by prefix to handle "Core React (500+)")
const KNOWN_SECTIONS = [
  "Core React",
  "React Router",
  "React Internationalization",
  "React Testing",
  "React Redux",
  "React Native",
  "React Hooks",
  "Miscellaneous",
];

// Strip back-to-top links like **[⬆ Back to Top](#table-of-contents)**
const BACK_TO_TOP_RE = /\*\*\[.*?Back to Top.*?\]\(.*?\)\*\*/gi;
// Strip HTML comment blocks
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
// Match <details><summary>...</summary>CONTENT</details>
const DETAILS_CONTENT_RE = /<\/summary>([\s\S]*?)<\/details>/i;
const DETAILS_BLOCK_RE = /<details[\s\S]*?<\/details>/gi;

function extractSection(block) {
  const firstLine = block.split("\n")[0].trim();
  return KNOWN_SECTIONS.find((s) => firstLine.startsWith(s)) ?? null;
}

function parseAnswer(rawAnswer) {
  let text = rawAnswer
    .replace(BACK_TO_TOP_RE, "")
    .replace(HTML_COMMENT_RE, "")
    .trim();

  // If there's a <details> block, extract its inner content
  const detailsMatch = text.match(DETAILS_CONTENT_RE);
  if (detailsMatch) {
    const inlinePart = text.replace(DETAILS_BLOCK_RE, "").trim();
    const detailsContent = detailsMatch[1].trim();
    // Combine inline text (if any) with the details content
    text = inlinePart ? `${inlinePart}\n\n${detailsContent}` : detailsContent;
  }

  return text.trim();
}

function isCodingExercise(answer) {
  const hasCodeBlock = /```(jsx?|javascript|tsx?|typescript)/i.test(answer);
  const hasFunctionality =
    /\b(function|const\s+\w+\s*=|class\s+\w+|return\s|=>\s*\{)/m.test(answer);
  return hasCodeBlock && hasFunctionality;
}

async function main() {
  console.log("Fetching README questions...");
  const res = await fetch(RAW_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const raw = await res.text();

  console.log(`Fetched ${(raw.length / 1024).toFixed(0)} KB`);

  // Split into H2 sections (## Heading)
  // The README starts with a preamble before the first ## so we slice(1)
  const sectionBlocks = raw.split(/^## /m).slice(1);

  const questions = [];
  let globalId = 1;

  for (const block of sectionBlocks) {
    const sectionName = extractSection(block);
    if (!sectionName) continue;

    // Normalise the section name to the canonical form
    const canonicalSection = KNOWN_SECTIONS.find((s) =>
      block.split("\n")[0].trim().startsWith(s)
    );

    const lines = block.split("\n");

    let currentQuestion = null;
    let answerLines = [];

    function flushQuestion() {
      if (!currentQuestion) return;
      const answer = parseAnswer(answerLines.join("\n"));
      questions.push({
        id: globalId++,
        section: canonicalSection,
        question: currentQuestion,
        answer,
        isCodingExercise: isCodingExercise(answer),
      });
      currentQuestion = null;
      answerLines = [];
    }

    for (const line of lines) {
      // Detect question lines. The repo uses: "1.  ### What is React?"
      // Also handle: "#### 1. What is React?" or "### 1. What is React?"
      const questionMatch =
        line.match(/^\d+[\.\)]\s+#{1,4}\s+(.+)$/) ||
        line.match(/^#{2,4}\s+\d+[\.\)]\s+(?:###\s+)?(.+)$/);
      if (questionMatch) {
        flushQuestion();
        currentQuestion = questionMatch[1]
          .replace(/\*\*/g, "")
          .replace(/<[^>]+>/g, "")
          .trim();
        continue;
      }

      if (currentQuestion) {
        answerLines.push(line);
      }
    }
    flushQuestion();
  }

  if (questions.length === 0) {
    // Fallback: try the simpler split approach if the structured parse got 0
    console.warn(
      "Structured parse found 0 questions — trying fallback parser..."
    );
    await fallbackParse(raw, questions, globalId);
  }

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(questions, null, 2), "utf-8");

  const codingCount = questions.filter((q) => q.isCodingExercise).length;
  console.log(
    `Done. Wrote ${questions.length} questions (${codingCount} coding exercises) → data/questions.json`
  );

  // Print section breakdown
  const bySection = {};
  for (const q of questions) {
    bySection[q.section] = (bySection[q.section] ?? 0) + 1;
  }
  console.log("\nSection breakdown:");
  for (const [section, count] of Object.entries(bySection)) {
    console.log(`  ${section}: ${count}`);
  }
}

async function fallbackParse(raw, questions, startId) {
  let globalId = startId;

  // Try a purely regex-based approach as fallback
  const sectionBlocks = raw.split(/^## /m).slice(1);

  for (const block of sectionBlocks) {
    const sectionName = extractSection(block);
    if (!sectionName) continue;

    // Match every pattern like: number. ### Question text ... answer until next number.
    const qRegex = /\d+[\.\)]\s+(?:#{1,3}\s+)?([^\n]+)\n([\s\S]*?)(?=\n\d+[\.\)]\s+(?:#{1,3}\s+)?|\s*$)/g;
    let match;
    while ((match = qRegex.exec(block)) !== null) {
      const questionText = match[1]
        .replace(/\*\*/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/^#+\s*/, "")
        .trim();
      if (!questionText || questionText.length < 5) continue;

      const answer = parseAnswer(match[2] ?? "");

      questions.push({
        id: globalId++,
        section: sectionName,
        question: questionText,
        answer,
        isCodingExercise: isCodingExercise(answer),
      });
    }
  }
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
