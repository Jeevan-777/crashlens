const chalk = require("chalk");
const boxen = require("boxen");

const severityColor = {
  critical: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};
const severityIcon = { critical: "[X]", warning: "[!]", info: "[i]" };

function printError(result, opts = {}) {
  const color = severityColor[result.severity] || chalk.white;
  const icon = severityIcon[result.severity] || "-";

  const body =
    `${color.bold(`${icon} ${result.title}`)}\n\n` +
    `${chalk.white(result.explanation)}\n\n` +
    `${chalk.green("[Fix]")} ${result.fix}`;

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
