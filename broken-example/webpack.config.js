/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV == 'production';
const runAnalyze = process.env.ANALYZE == 'true';

const stylesHandler = MiniCssExtractPlugin.loader;

const moduleFederationPlugin = new ModuleFederationPlugin({
  name: 'host',
  filename: 'host.[fullhash].js',
  shared: [
    // required shared modules
    { react: { singleton: true, eager: true, requiredVersion: '18.2.0' } },
    { 'react-dom': { singleton: true, eager: true, requiredVersion: '18.2.0' } },
    // PF modules will break the tree shaking in this exmaple due to marking PF index file
    {
      '@patternfly/react-core': {
        requiredVersion: '4.276.6',
      },
    },
  ],
});

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),

    new MiniCssExtractPlugin(),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    moduleFederationPlugin,
    ...(runAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
