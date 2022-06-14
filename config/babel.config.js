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