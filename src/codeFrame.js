const fs = require("fs");
const path = require("path");

const STACK_LINE_RE = /\(?([^\s()]+\.js):(\d+):(\d+)\)?/;
const MAX_LINE_LEN = 54;

function getCodeFrame(text, { contextLines = 2 } = {}) {
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(STACK_LINE_RE);
    if (!match) continue;

    const [, filePath, lineNoStr] = match;

    if (filePath.includes("node_modules") || filePath.startsWith("node:")) {
      continue;
    }

    const lineNo = parseInt(lineNoStr, 10);

    let source;
    try {
      source = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const sourceLines = source.split(/\r?\n/);
    const start = Math.max(1, lineNo - contextLines);
    const end = Math.min(sourceLines.length, lineNo + contextLines);
    const gutterWidth = String(end).length;

    const frameLines = [];
    for (let i = start; i <= end; i++) {
      const isTarget = i === lineNo;
      const marker = isTarget ? ">" : " ";
      const lineNum = String(i).padStart(gutterWidth, " ");
      let content = (sourceLines[i - 1] ?? "").replace(/\r$/, "");
      if (content.length > MAX_LINE_LEN)
        content = content.slice(0, MAX_LINE_LEN) + "...";
      frameLines.push(`${marker} ${lineNum} | ${content}`);
    }

    return {
      filePath: path.relative(process.cwd(), filePath),
      lineNo,
      frame: frameLines.join("\n"),
    };
  }

  return null;
}

module.exports = { getCodeFrame };
