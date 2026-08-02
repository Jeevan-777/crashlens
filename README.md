# CrashLens

A CLI dev-server watcher for Node/Express/MongoDB projects. It wraps your dev server the way `nodemon` does — but instead of just restarting on file changes, it watches stdout/stderr in real time, matches known error patterns, and prints a clean, plain-English explanation with a suggested fix, plus the actual crashing line of code — instead of a raw stack trace.

## Install

```bash
git clone https://github.com/<your-username>/crashlens.git
cd crashlens
npm install
```

## Usage

```bash
node bin/crashlens.js -- node server.js
node bin/crashlens.js -- npm run dev
node bin/crashlens.js --raw --hang-timeout 3000 -- node server.js
```

- `--raw` — also print the original raw log line alongside the formatted explanation
- `--hang-timeout <ms>` — how long to wait before flagging a request as hung (default: 5000)

To enable hang detection, add the middleware to your Express app:

```js
const crashlensMiddleware = require("crashlens/src/middleware");
app.use(crashlensMiddleware());
```

## What it catches

| Error | Severity |
| Port already in use (`EADDRINUSE`) | critical |
| MongoDB connection failure | critical |
| Missing npm package | critical |
| Missing local file (bad import path) | critical |
| Accessing a property on `undefined` | critical |
| Unhandled promise rejection | warning |
| Mongoose validation error | warning |
| Hanging request (missing `next()` / response) | warning |

Each match prints a boxed, colored explanation with a code snippet of the crashing line and a suggested fix. Press `Ctrl+C` to see a session summary of everything caught.

## Known limitation

Express's default 404 handler ("Cannot GET /route") is written directly to the HTTP response body, not to stdout/stderr — so CrashLens, which only watches process output, can't observe it. This is a structural limitation of watching server output rather than intercepting HTTP responses, not a missing pattern.

## Why rule-based, not an LLM

CrashLens matches errors against a small, hand-written pattern database instead of calling out to an LLM. That keeps it fast, free to run, and fully offline — a regex match is milliseconds, and there's no API cost per crash. The tradeoff is that it only recognizes errors it has a rule for; the pattern list is meant to grow over time.

## v1.1 (planned)

- `--only critical` severity filtering
- `crashlens.config.js` — toggle rule categories, custom hang timeout, ignore paths
- Publish to npm as a global CLI
- Additional rules for other common services (Redis, Postgres)
