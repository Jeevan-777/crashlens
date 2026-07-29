const { printHangWarning } = require("./formatter");

const START_RE = /__CRASHLENS_REQ_START__ (\S+) (\S+) (\S+)/;
const END_RE = /__CRASHLENS_REQ_END__ (\S+)/;

class HangDetector {
  constructor({ timeoutMs = 5000 } = {}) {
    this.timeoutMs = timeoutMs;
    this.pending = new Map();
  }

  ingest(line) {
    const start = line.match(START_RE);
    if (start) {
      const [, id, method, route] = start;
      const timer = setTimeout(() => {
        printHangWarning(`${method} ${route}`, this.timeoutMs / 1000);
        this.pending.delete(id);
      }, this.timeoutMs);
      this.pending.set(id, { timer });
      return;
    }

    const end = line.match(END_RE);
    if (end) {
      const entry = this.pending.get(end[1]);
      if (entry) {
        clearTimeout(entry.timer);
        this.pending.delete(end[1]);
      }
    }
  }

  clear() {
    for (const entry of this.pending.values()) clearTimeout(entry.timer);
    this.pending.clear();
  }
}

module.exports = HangDetector;
