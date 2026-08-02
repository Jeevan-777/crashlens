module.exports = [
  {
    id: "port-in-use",
    test: (line) => /EADDRINUSE/.test(line),
    explain: (line) => ({
      title: "Port already in use",
      explanation: `Something else is already running on this port.`,
      fix: 'Run "lsof -i :PORT" (or "netstat -ano | findstr :PORT" on Windows) to find the process, or change PORT in .env.',
      severity: "critical",
    }),
  },
  {
    id: "mongo-connection-failed",
    test: (line) =>
      /MongooseServerSelectionError|ECONNREFUSED.*mongo/i.test(line),
    explain: () => ({
      title: "MongoDB connection failed",
      explanation: "DB is probably not running, or the URI is wrong.",
      fix: "Check MongoDB is running and MONGO_URI in .env is correct.",
      severity: "critical",
    }),
  },
  {
    id: "module-not-found-package",
    test: (line) => /Cannot find module '([^./][^']*)'/.test(line),
    explain: (line) => {
      const match = line.match(/Cannot find module '([^./][^']*)'/);
      const moduleName = match ? match[1] : "the module";
      return {
        title: "Missing npm package",
        explanation: `"${moduleName}" isn't installed in this project.`,
        fix: `Run "npm install ${moduleName}".`,
        severity: "critical",
      };
    },
  },
  {
    id: "module-not-found-path",
    test: (line) => /Cannot find module '\.{1,2}\/[^']*'/.test(line),
    explain: (line) => {
      const match = line.match(/Cannot find module '([^']*)'/);
      const path = match ? match[1] : "the file";
      return {
        title: "Local file not found",
        explanation: `The path "${path}" doesn't exist relative to the importing file.`,
        fix: "Check for a typo in the path or a missing file extension.",
        severity: "critical",
      };
    },
  },
  {
    id: "undefined-property",
    test: (line) => /Cannot read propert(y|ies) of undefined/.test(line),
    explain: (line) => ({
      title: "Accessing a property on undefined",
      explanation:
        "Something you expected to be an object is undefined — often data that hasn't loaded yet (e.g. an async DB call that hasn't resolved).",
      fix: "Add a null/undefined check before accessing the property, or await the async call properly.",
      severity: "critical",
    }),
  },
  {
    id: "unhandled-rejection",
    test: (line) =>
      /UnhandledPromiseRejection|unhandledRejection|^Error:/i.test(line),
    explain: () => ({
      title: "Unhandled promise rejection",
      explanation: "An async function threw an error that nothing caught.",
      fix: "Wrap the async code in try/catch, or add a .catch() to the promise.",
      severity: "warning",
    }),
  },
  {
    id: "express-route-not-found",
    test: (line) => /Cannot (GET|POST|PUT|DELETE|PATCH) \/\S*/.test(line),
    explain: (line) => {
      const match = line.match(/Cannot (GET|POST|PUT|DELETE|PATCH) (\/\S*)/);
      const method = match ? match[1] : "";
      const route = match ? match[2] : "";
      return {
        title: "Route not found",
        explanation: `No handler is registered for ${method} ${route}.`,
        fix: "Check the route path/method match, and that the router is mounted with app.use().",
        severity: "warning",
      };
    },
  },
  {
    id: "mongoose-validation-error",
    test: (line) => /ValidationError/.test(line),
    explain: (line) => ({
      title: "Mongoose validation failed",
      explanation:
        "A document was saved without a required field, or with a value that fails schema validation.",
      fix: "Check the schema's required fields and the data being sent match.",
      severity: "warning",
    }),
  },
];
