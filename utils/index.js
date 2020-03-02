const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const con = await mongoose.connect(mongoURI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB Connected!!".rainbow.bold.underline);
  } catch (err) {
    console.error(`${err}`.red.bold.underline);
    process.exit(1);
  }
};

const applyRoutes = (routes, router) => {
  routes.forEach(individualRoute => {
    router.use(individualRoute.endpoint, individualRoute.route);
  });
};

const applyMiddleware = (middleware, router) => {
  middleware.forEach(individualMiddleware => {
    individualMiddleware(router);
  });
};

module.exports = {
  applyRoutes,
  applyMiddleware,
  connectDB
};
