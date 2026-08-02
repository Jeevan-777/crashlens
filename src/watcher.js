const { spawn, exec } = require("child_process");
const chokidar = require("chokidar");
const { matchError } = require("./rules");
const { printError } = require("./formatter");
const HangDetector = require("./hangDetector");

class Watcher {
  constructor({ command, args, cwd, watchPaths, hangTimeoutMs, showRaw }) {
    this.command = command;
    this.args = args;
    this.cwd = cwd;
    this.watchPaths = watchPaths;
    this.showRaw = showRaw;
    this.hangDetector = new HangDetector({ timeoutMs: hangTimeoutMs });
    this.session = { critical: 0, warning: 0, info: 0 };
    this.restartTimer = null;
  }

  start() {
    this.child = spawn(this.command, this.args, { cwd: this.cwd, shell: true });
    this.child.stdout.on("data", (d) =>
      this._handleOutput(d.toString(), false),
    );
    this.child.stderr.on("data", (d) => this._handleOutput(d.toString(), true));
    this._watchFiles();
    this._handleSignals();
  }

  _handleOutput(text, isStderr) {
    process[isStderr ? "stderr" : "stdout"].write(text);

    text.split("\n").forEach((line) => this.hangDetector.ingest(line));

    const result = matchError(text);
    if (result) {
      this.session[result.severity] = (this.session[result.severity] || 0) + 1;
      printError(result, { showRaw: this.showRaw });
    }
  }

  _watchFiles() {
    chokidar
      .watch(this.watchPaths, {
        ignored: /node_modules|\.git/,
        ignoreInitial: true,
      })
      .on("change", () => this._restart());
  }

  _restart() {
    clearTimeout(this.restartTimer);
    this.restartTimer = setTimeout(() => {
      this.hangDetector.clear();
      this._killChild(() => this.start());
    }, 150);
  }

  _killChild(callback) {
    if (!this.child || this.child.killed) return callback();
    if (process.platform === "win32") {
      exec(`taskkill /pid ${this.child.pid} /T /F`, () => callback());
    } else {
      this.child.kill();
      callback();
    }
  }

  _handleSignals() {
    process.on("SIGINT", () => {
      console.log("\n--- CrashLens session summary ---");
      console.log(
        `Critical: ${this.session.critical}  Warning: ${this.session.warning}  Info: ${this.session.info}`,
      );
      if (this.child) this.child.kill();
      process.exit(0);
    });
  }
}

module.exports = Watcher;
