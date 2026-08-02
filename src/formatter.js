const chalk = require("chalk");
const boxen = require("boxen");
const { getCodeFrame } = require("./codeFrame");

const severityColor = {
  critical: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};
const severityIcon = { critical: "[X]", warning: "[!]", info: "[i]" };

function wrapText(text, width) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.join("\n");
}

function printError(result, opts = {}) {
  const color = severityColor[result.severity] || chalk.white;
  const icon = severityIcon[result.severity] || "-";
  const WRAP_WIDTH = 60;

  let body =
    `${color.bold(`${icon} ${result.title}`)}\n\n` +
    `${chalk.white(wrapText(result.explanation, WRAP_WIDTH))}\n\n`;

  const codeFrame = getCodeFrame(result.fullText || result.line);
  if (codeFrame) {
    body +=
      `${chalk.gray(codeFrame.filePath + ":" + codeFrame.lineNo)}\n` +
      `${chalk.cyan(codeFrame.frame)}\n\n`;
  }

  body += `${chalk.green("[Fix]")} ${wrapText(result.fix, WRAP_WIDTH)}`;

  console.log(
    boxen(body, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderColor: result.severity === "critical" ? "red" : "yellow",
      borderStyle: "round",
    }),
  );

  if (opts.showRaw) console.log(chalk.gray(result.line));
}

function printHangWarning(routeLabel, timeoutSeconds) {
  const body =
    `${chalk.yellow.bold(`[!] Request hanging`)}\n\n` +
    `${chalk.white(`${routeLabel} has not responded in ${timeoutSeconds}s.`)}\n\n` +
    `${chalk.green("[Fix]")} Check for a missing next() or res.send()/res.json() in this route's handler chain.`;

  console.log(
    boxen(body, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderColor: "yellow",
      borderStyle: "round",
    }),
  );
}

module.exports = { printError, printHangWarning };
