const path = require("path");
const HtmlWPP = require("html-webpack-plugin");

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader" // Agregar postcss-loader para procesar Tailwind CSS
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|jpg)$/i,
                type: 'asset/resource' // Trata los archivos como recursos estáticos
            },
        ]
    },
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    devServer: {
        port: 4000
    },
    plugins: [
        new HtmlWPP({
            template: path.resolve(__dirname, "public", "index.html")
        })
    ]
};