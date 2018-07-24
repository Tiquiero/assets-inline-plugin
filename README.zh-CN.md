以html-webpack-plugin插件为基础的扩展插件。
[![NPM](https://nodei.co/npm/assets-inline-plugin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/assets-inline-plugin/)
========================================

这是以 [webpack](http://webpack.github.io)的 [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)为基础的扩展插件。该插件可以将资源文件(js,css)以内联的形式插入进去。

语言
------------

[English](README.md)

安装
------------

基本使用
------------

在你的webpack config文件种引入插件：

```javascript
const HtmlInlinePlugin = require('assets-inline-plugin');
```

把插件添加到webpack config的plugins配置：

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlInlinePlugin()
]
```

配置：
-------

允许的配置项有：

- `inline`: `boolean` or `regexp` or `object`

    可以内联的资源文件形式，以下配置项都是支持生效的：

    - `inline: true`
    - `inline: /\.(css|js)$/`
    - `inline: {
            css: /\.css$/,
            js: /\.js$/
        }`
    - `inline: {
            css: true,
            js: true
        }`

    默认值是 `true`.

- `remove`: `boolean`

    删除内联文件，默认值是 `true`.