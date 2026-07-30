#!/usr/bin/env node

const Watcher = require("../src/watcher");

// Usage:
// crashlens -- node server.js
// crashlens --hang-timeout 3000 -- npm run dev
// crashlens --raw -- node server.js

const args = process.argv.slice(2);
const sepIndex = args.indexOf("--");

const command = args[sepIndex + 1] || "node";
const commandArgs = args.slice(sepIndex + 2);

const hangTimeoutFlagIndex = args.indexOf("--hang-timeout");
const hangTimeoutMs =
  hangTimeoutFlagIndex !== -1
    ? parseInt(args[hangTimeoutFlagIndex + 1], 10)
    : 5000;

const watcher = new Watcher({
  command,
  args: commandArgs,
  cwd: process.cwd(),
  watchPaths: ["."],
  hangTimeoutMs,
  showRaw: args.includes("--raw"),
});

watcher.start();
