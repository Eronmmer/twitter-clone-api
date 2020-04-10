const posts = require("./posts");
const users = require("./users");
const auth = require("./auth");
const home = require("./home");
const engage = require("./engage");
const search = require("./search");

module.exports = [
	{ endpoint: "/api/posts", route: posts },
	{ endpoint: "/api/users", route: users },
	{ endpoint: "/api/auth", route: auth },
	{ endpoint: "/api/home", route: home },
	{ endpoint: "/api/engage", route: engage },
	{ endpoint: "/api/search", route: search },
];
