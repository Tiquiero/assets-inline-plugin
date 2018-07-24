const path = require('path');
const fs = require('fs');
// 将解析相对于它所在的源文件的源映射URL
const sourceMappingURL = require('source-map-url');

class HtmlInlinePlugin {
  constructor(options) {
    isObject(options) || (options = {});

    if (!isObject(options.inline)) {
      if (options.hasOwnProperty('inline')) {
        let inline = isRegExp(options.inline) ? options.inline : !!options.inline;
        options.inline = { js: inline, css: inline };
      }
      else options.inline = { js: true, css: true };
    }
    else {
      // 取反操作“!”会得到与目标对象代表的布尔型值相反的布尔值，而再做一次取反“!!”就得到了与其相同的布尔值。
      options.inline.js = isRegExp(options.inline.js) ? options.inline.js : !!options.inline.js;
      options.inline.css = isRegExp(options.inline.css) ? options.inline.css : !!options.inline.css;
    }

    this.outDir = '';
    this.inlineAsserts = [];
    if(options.remove){
      this.options = Object.assign({}, options);
    }else{
      this.options = Object.assign({ remove: true }, options);
    }
  }
  apply(compiler) {
    compiler.plugin('compilation', compilation => {

      //compilation.outputOptions是webpack的输出配置，如果想要更多的信息的话可以用compilation.options
      this.outDir = compilation.outputOptions.path;

      //html-webpack-plugin-alter-asset-tags允许插件在调用模板之前更改资源
      compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
        if (!this.options.inline.css && !this.options.inline.js) {
          return callback(null, htmlPluginData);
        }

        callback(null, this.processTags(compilation, htmlPluginData));
      });
    });

    compiler.plugin('done', compilation => {
      // remove inlined files
      if (this.options.remove) this.removeInlineAsserts();
    })
  }

  processTags(compilation, pluginData) {
    pluginData.head = pluginData.head.map(tag => {
      let assetUrl = tag.attributes.href;
      if (this.testAssertName(assetUrl, this.options.inline.css)) {
        tag = { tagName: 'style', closeTag: true ,attributes: {type: 'text/css'}};
        this.updateTag(tag, assetUrl, compilation);
      }

      return tag;
    });

    pluginData.body = pluginData.body.map(tag => {
      let assetUrl = tag.attributes.src;
      if (this.testAssertName(assetUrl, this.options.inline.js)) {
        tag = { tagName: 'script', closeTag: true ,attributes: {type: 'text/javascript'}};
        this.updateTag(tag, assetUrl, compilation);
      }

      return tag;
    });

    return pluginData;
  }

  updateTag(tag, assetUrl, compilation) {
    let publicUrlPrefix = compilation.outputOptions.publicPath || '';

    //path.posix.relative(from, to) 方法返回从 from 到 to 的相对路径（基于当前工作目录）
    //在 POSIX 上：path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
    // 返回: '../../impl/bbb'
    let assetName = path.posix.relative(publicUrlPrefix, assetUrl);
    let asset = compilation.assets[assetName];

    let source = asset.source();
    if (typeof source !== 'string') {
      source = source.toString();
    }

    // remove sourcemap comments
    tag.innerHTML = sourceMappingURL.removeFrom(source);

    // mark inlined asserts which will be deleted lately
    this.inlineAsserts.push(assetName);

    return tag;
  }

  testAssertName(assetName, option) {
    return option instanceof RegExp ? option.test(assetName) : option;
  }

  removeInlineAsserts() {
    if (!this.outDir) return;

    this.inlineAsserts.forEach(file => {
      let filePath = path.join(this.outDir, file);

        //如果路径存在
      if (fs.existsSync(filePath)) {
          //删除文件
        fs.unlinkSync(filePath);
      }

      rmdirSync(this.outDir, file);
    })
  }
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function rmdirSync(outDir, file) {
  //path.sep平台特定的路径片段分隔符，Windows 上是 \
  file = path.join(file).split(path.sep);
  file.pop();

  if (!file.length) return;

  file = file.join(path.sep);
  let dirPath = path.join(outDir, file);

  if (fs.existsSync(dirPath)) {
    //同步读取目录，返回一个所包含的文件和子目录的数组
    let files = fs.readdirSync(dirPath);

    if (!files.length) {
      fs.rmdirSync(dirPath);
    }
  }
  rmdirSync(outDir, file);
}

module.exports = HtmlInlinePlugin;