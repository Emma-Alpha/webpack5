const path = require("./paths.js")
const babelOptions = require("./babel.config.js")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  output: {
    assetModuleFilename: "images/[hash][ext]",    // 将png,jpg,jpeg,gif等资源文件存放到images下。
  },
  entry: [
    path.resolveApp("./src/index.js")
  ],
  resolve: {
    extensions: [".jsx", ".js", ".json"] // 无需后缀即可完成导入
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolveApp("src")],
      exclude: [path.resolveApp("node_modules")],
      use: [{
        loader: "babel-loader",
        options: babelOptions
      }]
    },
    {
      test:  /\.(png|jpg|jpeg|gif)$/,
      type: "asset/resource",
    }
  ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new WebpackBar(), // 进度条
    new HtmlWebpackPlugin({
      title: "webpack5演示demo",
      mountRoot: "root",
      template: path.resolveApp("./src/index.html"),
      filename: "index.html",
      inject: 'body', // 所有javascript 资源都是加载到body底部
      htmlContent: '<%- __html__ %>',
      initialData: 'window.__INITIAL_STATE__ = <%- __state__ %>',
      hash: true, // 为静态资源生成hash值
      minify: { // 压缩HTML文件
        removeComments: false, // 移除HTML中的注释
        collapseWhitespace: false, // 删除空白符与换行符
      },
    })
  ]
}