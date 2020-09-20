const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

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
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html')
    }),
    new CleanWebpackPlugin()
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    // name 对应 entry中的属性name   hash chunkhash contenthash
    // filename: '[name].[hash:6].js'
    filename: '[name].[chunkhash:6].js',
  }
}
