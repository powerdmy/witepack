const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function config(_, { mode = "production" }) {
	console.log(`Start ${mode} build...`);
	return {
		mode,
		entry: {
			a: path.resolve("./src/a/index.js"),
			admin: path.resolve("./src/b/index.js"),
		},
		output: {
			path: path.resolve("dist"),
			filename: "js/[name].js",
			publicPath: "/static/",
		},
		resolve: {
			extensions: [".js", ".jsx"],
			fallback: {
				fs: false,
				tls: false,
				net: false,
				path: false,
				zlib: false,
				http: false,
				https: false,
				stream: false,
				crypto: false,
				util: false,
				assert: false,
			},
		},
		plugins: [
			new HtmlWebpackPlugin({
				inject: "body",
				minify: false,
				template: "index.html",
			}),
		],
		module: {
			rules: [
				{
					test: /\.(png|jpe?g|gif|svg|css)(\?.*)?$/,
					type: "asset",
				},
			],
		},
	};
};
