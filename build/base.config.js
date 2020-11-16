/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {GenerateSW} = require('workbox-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    polyfill: '@babel/polyfill',
    index: './static/index.js',
    view: './static/view.js',
    faq: './static/faq.js',
    view_account: './static/view-account.js',
    admin: './static/admin/index.js',
  },
  output: {
    filename: '[name]-[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        },
      },
    },
  },
  performance: {
    maxEntrypointSize: 1500000,
    maxAssetSize: 1500000
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: '/font',
                publicPath: '/font/',
            }
        }]
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/images/'
            }
          }
        ]
      },
      {
      test: /\.(mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/'
          }
        }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new HtmlWebpackPlugin({
      template: './static/index.html',
      filename: './index.html',
      chunks: ['index', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './static/view.html',
      filename: './view.html',
      chunks: ['view', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './static/faq.html',
      filename: './faq.html',
      chunks: ['faq', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './static/view-account.html',
      filename: './view-account.html',
      chunks: ['view_account', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: './static/admin/index.html',
      filename: './admin.html',
      chunks: ['admin', 'vendor']
    }),
    new CopyWebpackPlugin({patterns: [
      { from: './static/manifest.json', to: '.' },
      { from: './static/images/favicon.ico', to: '.' },
      { from: './static/404.html', to: '.' },
    ]}),
    new GenerateSW({
      exclude: [
        /\.map$/, /\.png$/, /\.mp3$/, /\.xml$/, /\.ico$/,
        /faq/, /privacy/, /translate/, /404/, /vendors~/, /^locale/,
        /admin/, /view/, /index/, /polyfill/, /precache/, /vendor/
      ],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true
    }),
    new VueLoaderPlugin(),
  ],
}
