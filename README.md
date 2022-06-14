[TOC]

### 一、概念

从本质上讲，**webpack**是现代 JavaScript 应用程序的*静态模块打包器。*当 webpack 处理您的应用程序时，它会在内部从一个或多个*入口点*构建一个[依赖关系图](https://webpack.js.org/concepts/dependency-graph/)，然后将您项目所需的每个模块组合成一个或多个*bundles*，这些 bundles 是用于提供内容的静态资产。

### 二、入口

在某个文件中创建名为webpack5的文件夹, 然后执行package.json初始化命令（全程回车）

```shell
mkdir webpack5 && cd webpack5
```

```shell
yarn init
```

创建名为config的文件夹（用于存放webpack5的配置文件）

```shell
mkdir config
```

主要存放三个文件: webpack 公共资源部分，webpack dev开发环境部分, webpack build 打包环境部分

```shell
cd config
```

```shell
# 创建webpack 公共资源部分
touch webpack.public.js
# webpack dev开发环境部分
touch webpack.development.js
#  webpack build 打包环境部分
touch webpack.product.js
```

创建webpack入口文件, 入口文件存放到根目录的src里面。而src目录不存在，需要我们创建

```shell
cd .. && mkdir src
```

```shell
cd src && touch index.js
```

完成以上创建文件以及文件夹准备工作之后，需要安装webpack。(以下附上当前代码的目录结构, node_modules和 yarn-error.log可以忽略)

![image-20220613152118805](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220613152118805.png)

### 三、安装

回到项目的根目录，我们需要安装webpack以及webpack-cli

```shell
cd ..
```

```shell
yarn add webpack webpack-cli -D
```

出现以下截图即代表安装成功

![image-20220613152052628](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220613152052628.png)

### 四、使用React+JavaScript React

```shell
yarn add react react-dom -D
```

安装成功后，目前项目是无法识别的React语法jsx的内容，因此需要在webpack.public.js中添加匹配规则，告诉webpack遇到这个文件我们应该使用什么解析器去解读这类文件，webpack5中使用babel-loader是可以完成的，但本次文档中使用esbuild-loader来进行编译。（具体原因：esbuild-loader是使用go进行编译的，而babel-loader是调用JavasScript进行编译的，从语言的角度上来说，Go是比JavaScript快的，因此esbuild-loader编译出来的速度是比babel-loader快）[esbuild-loader的详细介绍点击这里](https://github.com/privatenumber/esbuild-loader)

```shell
yarn add esbuild-loader -D
```

在config文件夹中新创建一个paths.js文件(用于封装路径方法)

```shell
cd config && touch paths.js
```

paths.js的内容

```javascript
const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  resolveApp
}
```

添加webpack入口文件

编写webpack.public.js 文件

```javascript
const path = require("./paths.js")


module.exports = {
    entry: [
        path.resolveApp("src/index.js")
    ]
}
```

编写webpack输出文件，而开发环境中是需要追求构建效率，因此需要缓存策略来加快；而线上却需要更新完后，用户能够立马看到效果。因此需要contenthash来进行区分。

针对线上和开发环境中可能出现的两种不同情况来考虑，我们需要通过合并公共部分，然后定义不同的规则来实现，因此webpack-merge很符合我们的需求。[webpack-merge的详细说明](https://github.com/survivejs/webpack-merge)

```shell
yarn add webpack-merge -D
```

修改webpack.development.js的内容

```javascript
const common = require("./webpack.public.js")
const {merge} = require("webpack-merge")
const path = require("./paths.js")

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].bundle.js",
        clean: true,
        path: path.resolveApp("dist")
    }
})
```

修改webpack.product.js

```shell
const common = require("./webpack.public.js")
const {merge} = require("webpack-merge")
const path = require("./paths.js")

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "[name].[contenthash].bundle.js",
        clean: true,
        path: path.resolveApp("dist")
    }
})
```

编写Webpack 匹配jsx,js的规则，由于开发环境和生成环境无需做区分，因此在webpack.public.js中进行编写

```javascript
const path = require("./paths.js")


module.exports = {
  entry: [
    path.resolveApp("src/index.js")
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolveApp("src")],
      exclude: [path.resolveApp("node_modules")],
      user: [
        {
          loader: "babel-loader"
        }
      ]
    }]
  }
}
```

细心的朋友可能会发现，代码中是没有使用esbuild-loader,而是使用了babel-loader。这次更替的原因是babel-loader可以支持很多很好用的插件，比如问号表达式，antd按需导入css等等。esbuild-loader目前是没有支持以上的插件，因此需要使用babel-loader

```shell
yarn add babel-loader -D
```

在config文件夹下创建babel.config.js文件

```shell
touch babel.config.js
```

babel.config.js文件的内容

```javascript
module.exports = {
  presets: [
    ["@babel/preset-env", {                                       // 配置packages.json的browserlist针对指定浏览器版本做适配
      useBuiltIns: false,
      modules: false
    }],
    "@babel/preset-react"                                         // 将React代码转换成es5
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", {                          // 转译代码
      "corejs": 3
    }],
    "@babel/plugin-proposal-nullish-coalescing-operator",         // 问号??的用法
    "@babel/plugin-proposal-optional-chaining",                   // 问号?.的用法
    ["@babel/plugin-proposal-decorators", {
      legacy: true
    }],                                                           // 解析装饰器 dva中的@connect
    ["@babel/plugin-proposal-class-properties", {
      legacy: true
    }],                                                           // 转换类中某些属性 ** 注意：@babel/plugin-proposal-decorators 和 @babel/plugin-proposal-class-properties要保持这样。
    "babel-plugin-inline-react-svg",                              // 将svg 导出React组件
    ["babel-plugin-import", {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true
    }],                                                           // 导入组件的时候，顺带导入样式
  ]
}
```

需要安装一下的包

```shell
yarn add @babel/preset-env -D
yarn add @babel/preset-react -D
yarn add @babel/plugin-transform-runtime -D
yarn add @babel/runtime-corejs3 -D
yarn add @babel/plugin-proposal-nullish-coalescing-operator -D
yarn add @babel/plugin-proposal-optional-chaining -D 
yarn add @babel/plugin-proposal-decorators -D 
yarn add @babel/plugin-proposal-class-properties -D
yarn add babel-plugin-inline-react-svg -D
yarn add babel-plugin-import -D
yarn add @babel/core -D
```

安装完成后，修改一下webpack.public.js的babel-loader规则

```javascript
const path = require("./paths.js")
const babelOptions = require("./babel.config.js")

module.exports = {
  entry: [
    path.resolveApp("./src/index.js")
  ],
  resolve:{
    extensions: [".jsx", ".js", ".json"] // 无需后缀即可完成导入
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolveApp("src")],
      exclude: [path.resolveApp("node_modules")],
      use: [
        {
          loader: "babel-loader",
          options: babelOptions
        }
      ]
    }]
  }
}
```

我们需要在开发环境中看到效果，因此需要安装webpack-dev-server这个开发服务器。

```shell
yarn add webpack-dev-server -D
```

修改webpack.development.js文件

```javascript
const common = require("./webpack.public.js")
const {merge} = require("webpack-merge")
const path = require("./paths.js")

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].bundle.js",
        clean: true,
        path: path.resolveApp("dist")
    },
    devServer: {
        host: "0.0.0.0",
        port: 3000,
        compress: true,             // 开启服务器gzip压缩
        open: false,
        historyApiFallback: true,   // 提供页面来替代404响应
        hot: "only",                // 构建失败的情况下启动热模块替代而不是刷新页面
    }
})
```

通过node 命令来启动服务器查看效果

修改根目录下的package.json文件

```javascript
{
  "name": "webpack5",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "dev": "webpack-dev-server --config config/webpack.development.js"
  },
  "devDependencies": {
    "@babel/core": "^7.18.5",
    "@babel/plugin-proposal-class-properties": "^7.17.12",
    "@babel/plugin-proposal-decorators": "^7.18.2",
    "@babel/plugin-proposal-optional-chaining": "^7.17.12",
    "@babel/plugin-transform-runtime": "^7.18.5",
    "@babel/preset-env": "^7.18.2",
    "@babel/preset-react": "^7.17.12",
    "@babel/runtime-corejs3": "^7.18.3",
    "babel-loader": "^8.2.5",
    "babel-plugin-import": "^1.13.5",
    "babel-plugin-inline-react-svg": "^2.0.1",
    "esbuild-loader": "^2.19.0",
    "react": "^18.1.0",
    "react-dom": "^18.1.0",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.9.2",
    "webpack-merge": "^5.8.0"
  }
}
```

然后在终端敲

```shell
yarn dev
```

![image-20220613190620925](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220613190620925.png)

出现以上内容，即为成功。

现在我们访问http://localhost:3000/是没有任何效果的。

因此我们需要对src/index.js进行改造

```javascript
// index.js
import React from "react";
import {createRoot} from "react-dom/client"


function HelloMessage({name}){
    return <div>Hello {name}</div>
}


const root = createRoot(
    document.getElementById("root")
)
root.render(<HelloMessage name={"Bob"}/>)

```

通过之前对React-dom的学习以及了解，解读代码就知道React需要将DOM节点挂载到id="root"的元素上。

因此，我们需要一个html的模板，进入src目录中

```she
-> pwd
/Users/liangpingbo/Desktop/个人/前端/webpack/webpack5
cd src
touch index.html
```

index.html的内容如下

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <!-- <meta name="viewport" content="width=device-width,initial-scale=1"> -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div id="<%= htmlWebpackPlugin.options.mountRoot %>" style="height: 100%;"></div>
    </script>
 </body>
</html>
```

仔细观察，就会发现id 并没有写死，而是通过一个插件进行动态传递的。

这时我们就需要安装一个插件

```shell
  yarn add --dev html-webpack-plugin
```

我们需要对webpack.public.js的内容进行修改

```javascript
const path = require("./paths.js")
const babelOptions = require("./babel.config.js")
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
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
    }]
  },
  plugins: [
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
```

再次启动开发服务器

```shell
yarn dev
```

通过浏览器访问localhost:3000，就会发现出现hello Bob

![image-20220613193624202](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220613193624202.png)

### 五、优化Webpack 进度条

由于启动Webpack 时，常常输出一堆太感兴趣的东西。因此，需要一个工具将其美化一下(webpackbar)

```shell
yarn add webpackbar -D
```

修改webpack.public.js的内容

```javascript
const path = require("./paths.js")
const babelOptions = require("./babel.config.js")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar');

console.log(path.resolveApp("./src/index.html"),)

module.exports = {
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
    }]
  },
  plugins: [
    new WebpackBar(),
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
```

### 六、使用Antd

首先安装antd

```shell
yarn add antd -D
```

修改src/index.js

```react
import React from "react";
import { createRoot } from "react-dom/client"
import { Button } from "antd";

function HelloMessage({ name }) {
  return <div>
    Hello {name}
    <div>
      <Button>测试</Button>
    </div>
  </div>
}


const root = createRoot(
  document.getElementById("root")
)
root.render(<HelloMessage name={"Bob"} />)

```

这时启动yarn dev，就会出现一个报错。

![image-20220613195040277](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220613195040277.png)

由于我们webpack没有对less指定loader解析，因此遇到less会报错。

开发环境和生产环境上，对less解析有所不同。

webpack.development.js

```javascript
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
    }]
  }
})
```

需要安装loader

```shell
yarn add style-loader -D
yarn add css-loader -D
yarn add less-loader -D
yarn add less -D
```

完成以上操作，启动项目看看。

![image-20220614095933738](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220614095933738.png)

看到效果了，代表less规则生效。

webpack.product.js

```javascript
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
    }]
  },
  plugins: [new MiniCssExtractPlugin({
    filename: "[name].[contenthash:8].css",
    chunkFilename: "[name].[contenthash:8].chunk.css"
  })], // 将css 提取到单独文件中，为每个css的js创建一个css文件，并且支持css和SourceMaps按需加载。
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
    ]
  }
})
```

安装依赖

```shell
yarn add mini-css-extract-plugin -D
yarn add css-minimizer-webpack-plugin -D 
```

### 七、根据需求安装loader

#### 1. css

如果项目中引用了css文件，而此时Webpack匹配规则并没有css解析器。因此我们需要分别对webpack.development.js 和 webpack.product.js进行添加规则

webpack.development.js

```javascript
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
```

 webpack.product.js

```javascript
const path = require("./paths.js")
const babelOptions = require("./babel.config.js")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar');

console.log(path.resolveApp("./src/index.html"), )

module.exports = {
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
    }]
  },
  plugins: [
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
```

在src目录下，添加index.css

index.css

```css
.demo1{
    background-color: red;
}
```

修改index.js

```react
import React from "react";
import { createRoot } from "react-dom/client"
import { Button } from "antd";
import "./index.css"


function HelloMessage({ name }) {
  return <div>
    Hello {name}
    <div className={"demo1"}>
      <Button>测试</Button>
    </div>
  </div>
}


const root = createRoot(
  document.getElementById("root")
)
root.render(<HelloMessage name={"Bob"} />)
```

出现以下效果，则代表规则匹配上。

![image-20220614104445246](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220614104445246.png)

#### 2. png, jpeg, gif

webpack匹配规则现在无法对png,jpeg,git进行解析，因此我们需要对其添加解析器。

webpack.public.js

```javascript
const path = require("./paths.js")
const babelOptions = require("./babel.config.js")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar');

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
```

修改src目录下的index.js

```react
import React from "react";
import { createRoot } from "react-dom/client"
import { Button, Avatar } from "antd";
import "./index.css"
import User1 from "./user1.jpeg"

function HelloMessage({ name }) {
  return <div>
    Hello {name}
    <div className={"demo1"}>
      <Button>测试</Button>
    </div>
    <Avatar src={User1}/>
  </div>
}


const root = createRoot(
  document.getElementById("root")
)
root.render(<HelloMessage name={"Bob"} />)
```

![image-20220614110508781](https://cdn.jsdelivr.net/gh/a1733452028/blog@main/image-20220614110508781.png)