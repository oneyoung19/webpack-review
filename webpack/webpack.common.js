const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 自动清除dist文件夹下文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 自动拷贝静态资源 将没有模块化的静态资源直接打包进dist目录中
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 抽离css
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'development',
  // 字符串形式 简写 entry: '../src/main.js'
  // 数组形式 将这两入口文件及其依赖打包成一个。打包后的代码执行顺序跟在数组中的顺序相关。
  // entry: [path.resolve(__dirname, '../src/sub.js'), path.resolve(__dirname, '../src/main.js')],
  // 对象形式(单个属性)
  entry: {
    main: path.resolve(__dirname, '../src/main.js')
  },
  // 对象形式(多个属性) 会以这两个属性的对应文件为入口 然后递归依赖 打包成各个对应的bundle包
  // entry: {
  //   main: path.resolve(__dirname, '../src/main.js'),
  //   sub: path.resolve(__dirname, '../src/sub.js')
  // },
  module: {
    rules: [
      {
        test: /\.css$/,
        // loader的执行顺序是从右至左。 css-loader用来解析css。style-loader可以将解析的css转化为style标签的形式。如果为了更好的缓存策略要抽离出css的话，可以使用MiniCssExtractPlugin的loader来替代style-loader
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // ！！！解决在使用MiniCssExtractPlugin分离css后 css中的背景图片路径不正确的问题。
              // 譬如css会分离在dist/css中 背景图片被file-loader的image/[name].[hash:6].[ext]分离在dist/image中 不管背景图片的引用路径是什么 都会变成url('image/[name].[hash:6].[ext]')这种形式。 但由于背景图片是在dist/css目录下 这样资源的真实路径就会变成dist/css/image/[name].[hash:6].[ext] 很明显是不正确的 实际上的资源路径为dist/image/[name].[hash:6].[ext] 这样就需要我们配置下publicPath: '../'
              // https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27
              publicPath: '../'
            }
          }, 'css-loader']
      },
      {
        test: /\.(jpg|jpeg|png)/,
        use: [
          // {
          //   loader: 'file-loader',
          //   options: {
          //     name: 'image/[name].[hash:6].[ext]',
          //     // outputPath: 'images'
          //   }
          // },
          // url-loader如果不设置limit 默认会将所有图片路径转为dataUrl 此时不依赖file-loader url-loader可独立使用
          // 如果设置了limit 而且有超过limit大小限制的图片 此时就依赖file-loader 需要yarn add file-loader -D 否则在打包过程中会报错提示找不到file-loader。然后options中可以使用file-loader的相关配置 如name、outputPath等 url-loader会自动调用file-loader并传入参数
          {
            loader: 'url-loader',
            options: {
              name: 'image/[name].[hash:6].[ext]',
              limit: 100 * 1024
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html')
    }),
    new CleanWebpackPlugin(),
    // 注意这个patterns 以前的CopyWebpackPlugin版本是没有patterns这个参数的。
    new CopyWebpackPlugin({
      patterns: [
        {
          // from: '../favicon.ico',
          from: 'favicon.ico',
          to: path.resolve(__dirname, '../dist'),
        },
        {
          from: path.resolve(__dirname, '../vendor'),
          to: path.resolve(__dirname, '../dist/wendor'),
          // flatten: true
        }
      ]
    }),
    new MiniCssExtractPlugin({
      // path: path.resolve(__dirname, '../dist/css'), 不管用
      // 为了css的更好缓存，推荐使用contenthash 而不是chunkhash
      filename: 'css/[name].[contenthash:6].css',
      // MiniCssExtractPlugin也会自动将动态生成的chunk中的css分离出来，如果没有设置chunkFilename的话，会以filename为准。
      chunkFilename: 'css/[name].[contenthash:6].css',
    })
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    // name 对应 entry中的属性name   hash chunkhash contenthash
    // filename: '[name].[hash:6].js'
    filename: 'js/[name].[chunkhash:6].js',
    // 用来定义在使用CommonChunkPlugin或者动态加载过程中生成的额外chunk。不会影响到MiniCssExtractPlugin抽离出来的css命名。
    chunkFilename: 'js/[name].[contenthash].js',
    // 如果项目想要作为第三方库的话 需要设置导出的变量。libraryTarget用来设置该变量可以以何种方式引用。
    library: 'myLibrary',
    // libraryTarget: 'var', // 作为一个全局变量，通过 script 标签来访问
    // libraryTarget: 'window', // 通过 window 对象访问，在浏览器中
    // libraryTarget: 'umd', // 在 AMD 或 CommonJS 的 require 之后可访问
  }
}

// hash 每次打包如果整个项目没有变，则不变
// chunkhash 每次打包如果整个chunk没有变，则不变。
// contenthash 每次打包如果文件内容没有变，则该文件的contenthash不会变。