const mongoose = require("mongoose");

async function dropAllCollections () {
	const collections = Object.keys(mongoose.connection.collections);
	for (const collectionName of collections) {
		const collection = mongoose.connection.collections[collectionName];
		try {
			await collection.drop();
			await collection.deleteMany();
		} catch (error) {
			// This error happens when you try to drop a collection that's already dropped. Happens infrequently.
			// Safe to ignore.
			if (error.message === "ns not found") return;

			// This error happens when you use it.todo.
			// Safe to ignore.
			if (error.message.includes("a background operation is currently running"))
				return;

			console.log(error.message);
		}
	}
}

module.exports = dropAllCollections;
