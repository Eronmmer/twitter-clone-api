const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const databaseName = "twitter-clone-auth-test";
const { dropAllCollections } = require("../utils");
const User = require("../models/User");

const userOne = {
	name: "Erons",
	email: "eronmmer@gmail.com",
	username: "eronmmer",
	password: "eronmmer@gmail.com",
};

beforeAll(async () => {
	const url = `mongodb://127.0.0.1:27017/${databaseName}`;
	await mongoose.connect(url, {
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	// register user
	await request.post("/api/auth/register").send(userOne);
});

describe("Testing the auth route.", () => {
	it("Should return the details of a user after logging in along with a status code of 200", async () => {
		const response = await request.post("/api/auth/login").send({
			email: "eronmmer@gmail.com",
			password: "eronmmer@gmail.com",
		});
		expect(response.status).toBe(200);
		expect(response.body.data.token).toBeTruthy();
		console.log(response.body.data.token);
	});
});

afterAll(async () => {
	await User.deleteMany();
	await dropAllCollections();
	await mongoose.connection.close();
});
