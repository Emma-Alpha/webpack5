const common = require("./webpack.public.js")
const {
  merge
} = require("webpack-merge")
const path = require("./paths.js")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "[name].[contenthash].bundle.js",
    clean: true,
    path: path.resolveApp("dist")
  },
  module: {
    rules: [{
        test: /\.less$/,
        include: [/[\\/]node_modules[\\/].*antd/],
        use: [{
            loader: MiniCssExtractPlugin.loader,
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
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            }
          },
        ]
      },
      {
        test: /\.less$/,
        include: [path.resolveApp("src")],
        use: [{
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: {
                localIdentName: '[name]__[local]'
              },
              importLoaders: 2,
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
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
      chunkFilename: "[name].[contenthash:8].chunk.css"
    }), // 将css 提取到单独文件中，为每个css的js创建一个css文件，并且支持css和SourceMaps按需加载。
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: {
                removeAll: true
              },
            },
          ],
        },
      }), // 用来压缩css文件的 
    ],
    splitChunks: {
      chunks: 'all',
      // 默认值是20000Byte，表示大于这个大小的引入文件都需要抽离出来
      minSize: 20000,
      // 表示的是大于多少字节的包需要进行二次拆分，拆分为不小于minSize的包
      // 多数情况下，如果设置maxSize的值的时候，minSize和maxSize的值一般是一致的
      maxSize: 20000,
      // 某一个包引入了多少次就需要被抽离出来
      minChunks: 1,

      // cacheGroups的含义是 所有的模块输出，会存放在缓存中，最后一起执行对应的操作
      // 在这个属性里面可以自己自定义的代码分割配置
      // cacheGroups的优先级小于minSize和maxSize，所以当两种冲突的时候，cacheGroup中的配置会默认失效
      cacheGroups: {
        // key可以任意取，在这边只是一个占位符
        // value是一个配置对象
        vendor: {
          // 正则，用以匹配对应的模块路径
          test: /[\\/]node_modules[\\/]/,
          // 输出文件名 输出文件会以 输出文件名-hash值.js的形式输出
          // name: "vender",

          // filename 输出文件名，和name不同的是，filename中可以使用placeholder
          filename: 'vendor_[id].js',
          // 优先级 在这个配置中约定俗称，一般设置为负数
          priority: -10
        },
        default: {
          minChunks: 2,
          filename: "common_[id].js",
          priority: -20
        }
      }
    }
  }
})