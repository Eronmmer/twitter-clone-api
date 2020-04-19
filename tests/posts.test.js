const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const databaseName = "twitter-clone-posts-test";
const { dropAllCollections } = require("../utils");
const User = require("../models/User");
const Post = require("../models/Post");

const userOne = {
	name: "Erons",
	email: "eronmmer@gmail.com",
	username: "eronmmer",
	password: "eronmmer@gmail.com",
};
let token;

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
	// login user
	const response = await request.post("/api/auth/login").send({
		email: "eronmmer@gmail.com",
		password: "eronmmer@gmail.com",
	});
	token = response.body.data.token;
});

it("Should return the posts of a user", async () => {
	const response = await request
		.post("/api/posts")
		.set("Authorization", `Bearer ${token}`)
		.send({
			postContent: {
				text: "This is a motherfucking post bitch",
			},
		});
	expect(response.status).toBe(200);
	console.log(JSON.stringify(response.body.data));
});

afterAll(async () => {
	await User.deleteMany();
	await Post.deleteMany();
	await dropAllCollections();
	await mongoose.connection.close();
});
