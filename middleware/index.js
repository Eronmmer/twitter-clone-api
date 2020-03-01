const {
  handleLogger,
  handleBodyRequestParsing,
  handleCompression,
  handleCors,
  handleHelmet
} = require("./common");

module.exports = [
  handleBodyRequestParsing,
  handleCompression,
  handleCors,
  handleHelmet,
  handleLogger
];
