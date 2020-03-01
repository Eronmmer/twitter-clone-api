// 404 handler middleware
// app.use((req, res, next) => {
//   res.status(404).send(`${req.url} route not found`);
//   next();
// });

const handleNotFound = router => {
  router.use((req, res, next) => {
    res.status(404).send(`${req.url} route not found`);
    next();
  });
};

const handlerServerError = router => {
  router.use((err, req, res, next) => {
    res.statusCode = 500;
    console.error(err);
    res.send("Internal Server Error!!");
    next(err);
  });
};

// Error handler middleware
// app.get((err, req, res, next) => {
//   res.statusCode = 500;
//   console.error(err);
//   res.send("Internal Server Error!!");
//   next(err);
// });

module.exports = [handleNotFound, handlerServerError];
