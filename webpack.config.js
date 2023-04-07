const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
	const isProduction = argv.mode === "production";
	const config = {
		entry: {
			main: "./src/js/index.js",
		},
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "js/[name].[contenthash].js",
			clean: true,
		},
		devtool: isProduction ? "source-map" : "inline-source-map",
		devServer: {
			static: {
				directory: path.join(__dirname, "dist"),
			},
			compress: true,
			port: 9000,
			hot: true,
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						},
					},
				},
				{
					test: /\.s?css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: "css/[name].[contenthash].css",
			}),
			new HtmlWebpackPlugin({
				template: "./src/index.html",
				minify: isProduction
					? {
							collapseWhitespace: true,
							removeComments: true,
							removeRedundantAttributes: true,
							removeScriptTypeAttributes: true,
							removeStyleLinkTypeAttributes: true,
							useShortDoctype: true,
					  }
					: false,
			}),
		],
		optimization: {
			minimize: isProduction,
			minimizer: [new CssMinimizerPlugin()],
		},
	};

	return config;
};
