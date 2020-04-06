const applyRoutes = (routes, router) => {
	routes.forEach(individualRoute => {
		router.use(individualRoute.endpoint, individualRoute.route);
	});
};

module.exports = applyRoutes;
