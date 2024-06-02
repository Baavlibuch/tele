const path = require("path");

module.exports = {
  entry: "./app.js",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "webpack.bundle.js",
  },
};
