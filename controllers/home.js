exports.topTweets = (req, res, next) => {
	try {
		res.send("top home bitch");
	} catch (err) {
		next(err);
	}
};

exports.latestTweets = (req, res, next) => {
	try {
		res.send("latest home bitch");
	} catch (err) {
		next(err);
	}
};
