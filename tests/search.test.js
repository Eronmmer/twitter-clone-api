const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const databaseName = "twitter-clone-search-test";
const { dropAllCollections } = require("../utils");

beforeAll(async () => {
	const url = `mongodb://127.0.0.1:27017/${databaseName}`;
	await mongoose.connect(url, {
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

it("Should return search results for tweets matching passed words or an empty array and a status code of 200", async () => {
	const response = await request.get("/api/search/kapaichumarimarichupaku");
	expect(response.status).toBe(200);
});

it("Should return search result of a user with either user's profile or empty array and a status code of 200", async () => {
	const response = await request.get("/api/search/erons?type=user");
	expect(response.status).toBe(200);
});

it("Should return search result for tweets from a user.", async () => {
	const response = await request.get("/api/search/zanku?from=zlatan");
	expect(response.status).toBe(200);
});

afterAll(async () => {
	await dropAllCollections();
	await mongoose.connection.close();
});
