/* eslint-disable */

module.exports = (env, options) => {
  const Path = require('path');
  const FileSystem = require('fs');
  const Webpack = require('webpack');
  const JsonImporter = require('node-sass-json-importer');
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const StyleLintPlugin = require('stylelint-webpack-plugin');
  const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
  const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
  const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
  const WorkerPlugin = require('worker-plugin');
  const TerserPlugin = require('terser-webpack-plugin');
  const CopyPlugin = require('copy-webpack-plugin');
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
  const isProd = options.mode === 'production';
  const isDevServer = options.devServer;
  const isWatching = options.watch;
  const AppType = options.appType;
  const AnalyseBundle = options.AnalyseBundle;
  const isBoilerplate = AppType === 'boilerplate';
  const isExpress = AppType === 'express';
  const isStatic = AppType === 'static';
  const isWp = AppType === 'wp';
  const preserveDist = options.preserveDist;
  const DistDirPath = Path.resolve(__dirname, '../../dist');
  const RootDirPath = isWp ? Path.resolve(__dirname, '../..') : Path.resolve(__dirname, '../../..');
  const SrcDirPath = Path.resolve(__dirname, '..');
  const DevServerPort = require('./../utils/get-server-port')();
  const tsConfigPath = Path.join(SrcDirPath, 'tsconfig.json');
  const PrincipalPurge = require('./../utils/purge');

  let pugPartialsDirPath;
  let pugStylesheetsPath;
  let pugScriptsPath;
  const publicPath = isBoilerplate || isStatic ? '/static/dist/' : '/';

  if (isBoilerplate || isStatic) {
    pugPartialsDirPath = Path.join(RootDirPath, 'site/partials');
    pugStylesheetsPath = Path.join(pugPartialsDirPath, 'head/styles-hashed.pug');
    pugScriptsPath = Path.join(pugPartialsDirPath, 'scripts-hashed.pug');
  }

  // Configure svgo
  const svgoPlugins = [
    {
      removeViewBox: false,
    },
    {
      removeDimensions: false,
    },
    {
      collapseGroups: true,
    },
    {
      cleanupIDs: true,
    },
    {
      convertPathData: false,
    },
  ];

  // create empty pug partials so that build doesn't fail the first time it runs
  if (pugStylesheetsPath && !FileSystem.existsSync(pugStylesheetsPath)) {
    if (isBoilerplate || isStatic) {
      FileSystem.writeFile(pugStylesheetsPath, '', (err) => {
        if (err) throw err;

        console.log(`${pugStylesheetsPath} was succesfully created`);

        if (!FileSystem.existsSync(pugScriptsPath)) {
          FileSystem.writeFile(pugScriptsPath, '', (err) => {
            if (err) throw err;

            console.log(`${pugScriptsPath} was succesfully created`);
          });
        }
      });
    }
  }

  // configure plugins
  function initPlugins() {
    let pluginsDef = [
      new Webpack.ProvidePlugin({}),
      new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new FixStyleOnlyEntriesPlugin({ ignore: isDevServer ? 'webpack-hot-middleware' : undefined }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contentHash].css',
      }),
      new CopyPlugin({
        patterns: [
          {
            from: Path.join(SrcDirPath, 'images/vectors/inline'),
            to: Path.join(DistDirPath, 'images/vectors/inline'),
          },
          {
            from: Path.join(SrcDirPath, 'images/favicons/*'),
            to: Path.join(DistDirPath, 'images/favicons'),
            context: 'images/favicons',
            globOptions: {
              ignore: ['*.pug'],
            },
          },
        ],
      }),
      new WorkerPlugin({
        globalObject: isDevServer ? 'self' : false,
      }),
    ];

    if (AnalyseBundle) {
      pluginsDef.push(new BundleAnalyzerPlugin());
    }

    if (!preserveDist && !isDevServer && !isWatching) {
      const cleanPatterns = [
        DistDirPath + '/**/*',
        '!' + DistDirPath + '/css',
        '!' + DistDirPath + '/css/critical-*',
      ];

      pluginsDef.push(
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: cleanPatterns,
          verbose: true,
        })
      );

      pluginsDef.push(
        new StyleLintPlugin({
          configFile: Path.resolve(__dirname, '.stylelintrc.json'),
          context: Path.join(SrcDirPath, 'stylesheets'),
          files: '**/*.scss',
          syntax: 'scss',
          emitWarning: !isProd,
        })
      );
    }

    // Configure HTML injection

    const htmlTemplatesConfig = [
      {
        alwaysWriteToDisk: true,
        cache: false,
        inject: false,
      },
    ];

    const htmlWebpackDef = [];

    htmlTemplatesConfig.forEach((item) => {
      const htmlConfigDef = [];
      const htmlConfig = item;

      switch (AppType) {
        case 'boilerplate':
        case 'static':
          htmlConfigDef.push({
            ...htmlConfig,
            ...{
              template: Path.join(RootDirPath, '/site/index.pug'),
              filename: Path.join(RootDirPath, '/index.html'),
              inject: true,
            },
          });

          break;
        case 'wp':
          htmlConfigDef.push({
            ...htmlConfig,
            ...{
              template: Path.join(RootDirPath, '/header.php'),
              filename: Path.join(RootDirPath, '/header-hashed.php'),
            },
          });

          htmlConfigDef.push({
            ...htmlConfig,
            ...{
              template: Path.join(RootDirPath, '/footer.php'),
              filename: Path.join(RootDirPath, '/footer-hashed.php'),
            },
          });

          break;
        case 'express':
          htmlConfigDef.push({
            ...htmlConfig,
            ...{
              template: Path.join(RootDirPath, '/site/partials/head/styles.pug'),
              filename: Path.join(RootDirPath, '/site/partials/head/styles-hashed.pug'),
            },
          });

          htmlConfigDef.push({
            ...htmlConfig,
            ...{
              template: Path.join(RootDirPath, '/site/partials/scripts.pug'),
              filename: Path.join(RootDirPath, '/site/partials/scripts-hashed.pug'),
            },
          });
          break;
      }

      htmlConfigDef.forEach((conf) => {
        htmlWebpackDef.push(new HtmlWebpackPlugin(conf));
      });
    });

    pluginsDef = pluginsDef.concat(htmlWebpackDef);

    if (isDevServer) {
      pluginsDef.push(new Webpack.HotModuleReplacementPlugin());
    }

    pluginsDef.push(new HtmlWebpackHarddiskPlugin());

    // @see https://github.com/thegc/html-webpack-inline-svg-plugin#getting-to-your-svgs
    pluginsDef.push(
      new HtmlWebpackInlineSVGPlugin({
        runPreEmit: isDevServer,
      })
    );

    if (isProd && (isStatic || isBoilerplate)) {
      pluginsDef.push(
        new PrincipalPurge({
          content: [Path.join(RootDirPath, '*.html')],
          css: [Path.join(DistDirPath, 'css/*')],
        })
      );
    }

    return pluginsDef;
  }

  // define entry points
  const entryBuildDef = ['./index.ts', './stylesheets/main.scss'];

  // configure
  if (isDevServer && isExpress) {
    entryBuildDef.push('webpack-hot-middleware/client?reload=true');
  }

  //Add event source polyfill for webpack hot middleware work on IE
  if (isDevServer) {
    entryBuildDef.unshift('./utils/event-source-polyfill.js');
  }

  // configure optimization
  const optimizationConfig = {
    splitChunks: {
      chunks: 'async',
    },
  };
  if (isProd) {
    optimizationConfig.minimizer = [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        },
      }),
    ];
  }

  // Configure last css/scss loader
  let cssLastLoaderConfig = {
    loader: 'style-loader',
  };

  cssLastLoaderConfig = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      sourceMap: !isProd,
      publicPath: '../',
      esModule: true,
      hmr: !isProd,
    },
  };

  const watchOptionsIgnored = [
    Path.join(RootDirPath, '.hg'),
    Path.join(RootDirPath, '.git'),
    Path.join(RootDirPath, 'node_modules'),
    Path.join(RootDirPath, 'errors'),
    Path.join(RootDirPath, 'helpers'),
    Path.join(RootDirPath, 'middleware'),
    Path.join(RootDirPath, 'translations'),
    Path.join(RootDirPath, '*.js'),
  ];

  if (!isStatic && !isBoilerplate) {
    watchOptionsIgnored.push(Path.join(RootDirPath, 'site'));
  }

  // Configure webpack
  return {
    mode: options.mode,
    context: SrcDirPath,
    entry: {
      build: entryBuildDef,
    },
    output: {
      path: DistDirPath,
      publicPath: publicPath,
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js',
    },
    stats: isProd ? 'minimal' : 'normal',
    devtool: isProd ? false : 'source-map',
    devServer: {
      contentBase: isExpress ? false : RootDirPath,
      port: DevServerPort,
      compress: true,
      inline: true,
      hotOnly: true,
      writeToDisk: isBoilerplate || isStatic,
    },
    watchOptions: {
      ignored: watchOptionsIgnored,
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: 'pug-loader',
        },
        {
          test: /modernizrrc\.js$/,
          loader: 'webpack-modernizr-loader',
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            configFile: tsConfigPath,
          },
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {
            failOnWarning: false,
            failOnError: true,
            configFile: Path.resolve(__dirname, '.eslintrc.json'),
          },
        },
        {
          test: /\.scss$/,
          use: [
            cssLastLoaderConfig,
            {
              loader: 'css-loader',
              options: {
                sourceMap: isProd ? false : true,
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: isProd ? false : true,
                config: {
                  path: Path.resolve(__dirname, 'postcss.config.js'),
                },
              },
            },
            {
              loader: 'resolve-url-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isProd ? false : true,
                sassOptions: {
                  importer: JsonImporter(),
                  precision: 8,
                  comments: false,
                  outputStyle: 'expanded',
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            cssLastLoaderConfig,
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: isProd ? false : true,
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.(png|gif|jpe?g|woff|woff2|eot|ttf|svg)$/,
          exclude: Path.join(SrcDirPath, 'images', 'vectors/inline'),
          use: [
            {
              loader: 'url-loader',
              options: {
                name: '[path][name]-[hash].[ext]',
                limit: 8192,
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          include: Path.join(SrcDirPath, 'images', 'vectors/inline'),
          use: [
            {
              loader: 'url-loader',
              options: {
                name: '[path][name].[ext]',
                limit: 1,
                publicPath: isDevServer ? './static/dist' : './',
              },
            },
            {
              loader: 'svgo-loader',
              options: {
                plugins: svgoPlugins,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        modernizr$: Path.resolve(__dirname, 'modernizrrc.js'),
        src: SrcDirPath,
        app: RootDirPath,
      },
      plugins: [new TsconfigPathsPlugin({ configFile: tsConfigPath })],
    },
    optimization: optimizationConfig,
    plugins: initPlugins(),
    node: {
      fs: 'empty',
    },
  };
};
