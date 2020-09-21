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
            }
          }, 'css-loader']
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
      filename: 'css/[name].[contenthash:6].css'
    })
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    // name 对应 entry中的属性name   hash chunkhash contenthash
    // filename: '[name].[hash:6].js'
    filename: '[name].[chunkhash:6].js',
    // 用来定义在使用CommonChunkPlugin或者动态加载过程中生成的额外chunk。不会影响到MiniCssExtractPlugin抽离出来的css命名。
    chunkFilename: '[name].[contenthash]'
  }
}

// hash 每次打包如果整个项目没有变，则不变
// chunkhash 每次打包如果整个chunk没有变，则不变。
// contenthash 每次打包如果文件内容没有变，则该文件的contenthash不会变。