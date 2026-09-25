function crashlensMiddleware() {
  return function (req, res, next) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      `__CRASHLENS_REQ_START__ ${id} ${req.method} ${req.originalUrl}`,
    );
    res.on("finish", () => console.log(`__CRASHLENS_REQ_END__ ${id}`));
    next();
  };
}

module.exports = crashlensMiddleware;
