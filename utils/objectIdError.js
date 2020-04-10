const objectIdError = (res, err, msg) => {
	if (err.kind === "ObjectId") {
		return res.status(404).json({
			errors: [
				{
					msg,
					status: "404",
				},
			],
		});
	}
};

module.exports = objectIdError;
