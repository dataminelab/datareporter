/* eslint-disable */
const webpack = require("webpack");
const { IgnorePlugin } = webpack;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const path = require("path");
const { CheckerPlugin } = require('awesome-typescript-loader');
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

function optionalRequire(module, defaultReturn = undefined) {
  try {
    require.resolve(module);
  } catch (e) {
    if (e && e.code === "MODULE_NOT_FOUND") {
      // Module was not found, return default value if any
      return defaultReturn;
    }
    throw e;
  }
  return require(module);
}

// Load optionally configuration object (see scripts/README)
const CONFIG = optionalRequire("../scripts/config", {});

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;
const isHotReloadingEnabled =
  isDevelopment && process.env.HOT_RELOAD === "true";

const redashBackend = process.env.REDASH_BACKEND || "http://localhost:5000";
const turniloBackend = process.env.TURNILO_BACKEND || "http://localhost:3000";
const baseHref = CONFIG.baseHref || "/";
const staticPath = CONFIG.staticPath || "/static/";
const htmlTitle = CONFIG.title || "Data Reporter";

const basePath = path.join(__dirname);
const appPath = path.join(__dirname, "app");

const extensionsRelativePath =
  process.env.EXTENSIONS_DIRECTORY || path.join("app", "extensions");
const extensionPath = path.join(__dirname, extensionsRelativePath);

// Function to apply configuration overrides (see scripts/README)
function maybeApplyOverrides(config) {
  const overridesLocation = process.env.REDASH_WEBPACK_OVERRIDES || "./scripts/webpack/overrides";
  const applyOverrides = optionalRequire(overridesLocation);
  if (!applyOverrides) {
    return config;
  }
  console.info("Custom overrides found. Applying them...");
  const newConfig = applyOverrides(config);
  console.info("Custom overrides applied successfully.");
  return newConfig;
}

const babelLoader = {
  loader: require.resolve("babel-loader"),
  options: {
    presets: [
      "@babel/preset-react",
      [
        "@babel/preset-env",
        {
          modules: false,
        },
      ],
    ],
    plugins: [
      ...(isHotReloadingEnabled ? ["react-refresh/babel"] : []),
      "@babel/plugin-proposal-optional-chaining",
    ],
  },
};


const config = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: [
      "./app/index.js",
      "./app/assets/less/main.less",
      "./app/assets/less/ant.less"
    ],
    server: ["./app/assets/less/server.less"]
  },
  output: {
    path: path.join(basePath, "./dist"),
    filename: isProduction ? "[name].[chunkhash].js" : "[name].js",
    publicPath: staticPath
  },
  node: {
    fs: "empty",
    path: "empty"
  },
  resolve: {
    symlinks: false,
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": appPath,
      extensions: extensionPath
    }
  },
  plugins: [
    new CheckerPlugin(),
    new WebpackBuildNotifierPlugin({ title: "Data Reporter" }),
    // bundle only default `moment` locale (`en`)
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new HtmlWebpackPlugin({
      template: "./app/index.html",
      filename: "index.html",
      excludeChunks: ["server"],
      release: process.env.BUILD_VERSION || "dev",
      staticPath,
      baseHref,
      title: htmlTitle
    }),
    new HtmlWebpackPlugin({
      template: "./app/multi_org.html",
      filename: "multi_org.html",
      excludeChunks: ["server"]
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css"
    }),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: ""
    }),
    new IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new CopyWebpackPlugin([
      { from: "app/assets/robots.txt" },
      { from: "app/assets/manifest.json" },
      { from: "app/unsupported.html" },
      { from: "app/unsupportedRedirect.js" },
      { from: "app/assets/css/*.css", to: "styles/", flatten: true },
      { from: "app/assets/fonts", to: "fonts/" }
    ]),
    isHotReloadingEnabled && new ReactRefreshWebpackPlugin({ overlay: false })
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: chunk => {
        return chunk.name != "server";
      }
    }
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        use: ["source-map-loader"],
        exclude: [
          /node_modules\/mutationobserver-shim/,
        ],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        use: ["source-map-loader"],
        exclude: [
          /node_modules\/mutationobserver-shim/,
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: {
          and: [/node_modules/],
          not: [
            /react-syntax-highlighter/ // Include react-syntax-highlighter for transpiling
          ]
        },
        use: [
          babelLoader
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: {
          and: [/node_modules/],
          not: [
            /react-syntax-highlighter/ // Include react-syntax-highlighter for transpiling
          ]
        },
        use: [
          babelLoader,
          {
            loader: 'awesome-typescript-loader?{configFileName: "tsconfig.json"}',
            options: {
              configFile: "tsconfig.json"
            }
          }
        ]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/, /index\.html/, /multi_org\.html/],
        use: [
          {
            loader: "raw-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader",
            options: {
              plugins: [
                new LessPluginAutoPrefix({ browsers: ["last 3 versions"] })
              ],
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              context: path.resolve(appPath, "./assets/images/"),
              outputPath: "images/",
              name: "[path][name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(svg)(\?.*)?$/,
        exclude: /app\/components\/TurniloComponent/,
        use: [
          {
            loader: "file-loader",
            options: {
              context: path.resolve(appPath, "./assets/images/"),
              outputPath: "images/",
              name: "[path][name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: ["svg-inline-loader"],
        include: /app\/components\/TurniloComponent/,
      },
      {
        test: /\.geo\.json$/,
        type: "javascript/auto",
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "data/",
              name: "[hash:7].[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "fonts/[name].[hash:7].[ext]"
            }
          }
        ]
      }
    ]
  },
  devtool: isProduction ? "source-map" : "cheap-eval-module-source-map",
  stats: {
    children: false,
    modules: false,
    chunkModules: false
  },
  watchOptions: {
    ignored: /\.sw.$/
  },
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if(error?.message === "ResizeObserver loop completed with undelivered notifications.")
          {
             console.error(error)
             return false;
          }
          return true;
        },
      },
    },
    devMiddleware: {
      index: "/static/index.html",
      publicPath: staticPath,
      stats: {
        modules: false,
        chunkModules: false
      },
    },
    historyApiFallback: {
      index: "/static/index.html",
      rewrites: [{ from: /./, to: "/static/index.html" }]
    },
    proxy: [
      {
        context: [
          "/login",
          "/logout",
          "/invite",
          "/setup",
          "/status.json",
          "/api",
          "/oauth"
        ],
        target: redashBackend + "/",
        changeOrigin: false,
        secure: false
      },
      {
        context: [
          '/plywood',
          '/config-turnilo'
        ],
        target: turniloBackend + "/",
        changeOrigin: true,
        secure: false
      },
      {
        context: path => {
          // CSS/JS for server-rendered pages should be served from backend
          return /^\/static\/[a-z]+\.[0-9a-fA-F]+\.(css|js)$/.test(path);
        },
        target: redashBackend + "/",
        changeOrigin: true,
        secure: false
      }
    ],
    hot: isHotReloadingEnabled
  },
  performance: {
    hints: false
  }
};

if (process.env.DEV_SERVER_HOST) {
  config.devServer.host = process.env.DEV_SERVER_HOST;
}

if (process.env.BUNDLE_ANALYZER) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = maybeApplyOverrides(config);
