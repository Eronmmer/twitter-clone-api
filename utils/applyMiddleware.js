const applyMiddleware = (middleware, router) => {
	middleware.forEach(individualMiddleware => {
		individualMiddleware(router);
	});
};

module.exports = applyMiddleware;
