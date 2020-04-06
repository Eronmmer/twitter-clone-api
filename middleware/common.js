const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const handleLogger = router => {
	router.use(morgan("combined"));
};

const handleBodyRequestParsing = router => {
	router.use(express.json());
	router.use(express.urlencoded({ extended: false }));
};

const handleCors = router => {
	router.use(cors({ credentials: true, origin: true }));
};

const handleCompression = router => {
	router.use(compression());
};

const handleHelmet = router => {
	router.use(helmet());
};

module.exports = {
	handleLogger,
	handleBodyRequestParsing,
	handleCompression,
	handleCors,
	handleHelmet
};
