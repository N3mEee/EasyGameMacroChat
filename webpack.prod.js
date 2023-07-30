const path = require("path");
const Dotenv = require("dotenv-webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    mode: "production",
    entry: "./src/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: "assets/[hash][ext][query]",
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new htmlWebpackPlugin({
            title: "EasyGameMacro Chat",
            filename: "index.html",
            template: "src/template.html",
        }),
        new Dotenv({ systemvars: true }),
    ],
};
