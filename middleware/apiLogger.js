// logger.js
const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log({
      method: req.method,
      url: req.originalUrl,
    });
  });

  next();
};

module.exports = apiLogger;