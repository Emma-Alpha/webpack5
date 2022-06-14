const common = require("./webpack.public.js")
const {
  merge
} = require("webpack-merge")
const path = require("./paths.js")

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    clean: true,
    path: path.resolveApp("dist"),
    publicPath: "/"
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    compress: true, // 开启服务器gzip压缩
    open: false,
    historyApiFallback: true, // 提供页面来替代404响应
    hot: "only", // 构建失败的情况下启动热模块替代而不是刷新页面
  },
  module: {
    rules: [{
        test: /\.less$/,
        include: [/[\\/]node_modules[\\/].*antd/],
        use: [{
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              lessOptions: {
                javascriptEnabled: true,
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        include: [path.resolveApp("src")],
        use: [{
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            }
          },
        ]
      }
    ],
  }
})