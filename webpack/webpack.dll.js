const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    // vue: ['vue'],
    // element: ['element-ui']
    vendor: ['vue', 'element-ui', 'moment', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, '../static/dll'),
    filename: '[name].dll.js',
    library: '[name]_dll'
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../static/dll')]
    }),
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]_dll',
      path: path.resolve(__dirname, './dll', '[name].manifest.json')
    })
  ]
}

// 动态链接库会根据入口生成js文件以及manifest文件 其中js文件的相关配置 可以使用output来配置
// 另外该js文件需要在html当中手动引入 它需要暴露一个全局变量 所以需要配置output.library
// manifest文件的配置在DLLPlugin插件当中 DLLReferencePlugin会根据manifest文件的name属性来寻找对应的全局变量 也就是说DLL的模块不会再经过编译过程 
