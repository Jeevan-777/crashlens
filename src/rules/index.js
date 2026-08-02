const patterns = require("./patterns");

function matchError(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    for (const rule of patterns) {
      if (rule.test(line)) {
        return { id: rule.id, line, fullText: text, ...rule.explain(line) };
      }
    }
  }
  return null;
}

module.exports = { matchError, patterns };
