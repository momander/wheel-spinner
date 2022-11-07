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
const AsyncCssPlugin = require("async-css-plugin");
const {GenerateSW} = require('workbox-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  devtool: 'source-map',
  target: ['web', 'es5'],
  entry: {
    polyfill: '@babel/polyfill',
    index: './static/index.js',
    shared_wheel: './static/index.js',
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
        test: /\.(png|jpg|jpeg|gif|ico)$/,
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
    new AsyncCssPlugin(),
    new HtmlWebpackPlugin({
      template: './static/shared_wheel.html',
      filename: './shared-wheel.html',
      chunks: ['index', 'vendor']
    }),
    new CopyWebpackPlugin({patterns: [
      { from: './static/third_party', to: 'third_party' },
      { from: './static/manifest.json', to: '.' },
      { from: './static/images/favicon.ico', to: '.' }
    ]}),
    new GenerateSW({
      exclude: [
        /\.map$/, /\.png$/, /\.jpg$/, /\.mp3$/, /\.xml$/, /\.ico$/,
        /faq/, /privacy/, /translate/, /404/, /vendors~/, /^locale/,
        /admin/, /index/, /classroom/, /tutorials/, /polyfill/, /precache/,
        /vendor/, /view/, /e628cc/, /shared/, /carousel/, /notFound/, /export/,
        /firebase/, /howler/, /translations/, /vibrant/, /workbox/
      ],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true
    }),
    new VueLoaderPlugin(),
  ],
}
