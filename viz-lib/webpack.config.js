const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "redash-visualizations.js",
    libraryTarget: "umd",
    assetModuleFilename: 'images/[name][ext]'
  },
  resolve: {
    symlinks: false,
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    fullySpecified: false, // Allow imports without extensions
    alias:{
      './nonIterableSpread': './nonIterableSpread.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "images/",
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: {
              plugins: [new LessPluginAutoPrefix({ browsers: ["last 3 versions"] })],
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false, // Disable the behavior for this rule
        },
      },
    ],
  },
  externals: [
    {
      lodash: "lodash",
      react: "react",
      "react-dom": "react-dom",
    },
    /^antd/i,
  ],
};
