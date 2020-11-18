const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 自动清除dist文件夹下文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 自动拷贝静态资源 将没有模块化的静态资源直接打包进dist目录中
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 抽离css
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')
// 检测模块 分析模块
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
  mode: 'development',
  // 字符串形式 简写 
  entry: path.resolve(__dirname, '../src/main.js'),
  // 数组形式 将这两入口文件及其依赖打包成一个。打包后的代码执行顺序跟在数组中的顺序相关。
  // entry: [path.resolve(__dirname, '../src/sub.js'), path.resolve(__dirname, '../src/main.js')],
  // 对象形式(单个属性)
  // entry: {
  //   main: path.resolve(__dirname, '../src/main.js')
  // },
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
              // https://lakerswgq.github.io/2017/09/10/webpack-ExtractTextWebpackPlugin-plugin-causes-image-404/
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
        },
        {
          from: path.resolve(__dirname, '../static'),
          to: path.resolve(__dirname, '../dist/static')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      // path: path.resolve(__dirname, '../dist/css'), 不管用
      // 为了css的更好缓存，推荐使用contenthash 而不是chunkhash
      filename: 'css/[name].[contenthash:6].css',
      // MiniCssExtractPlugin也会自动将动态生成的chunk中的css分离出来，如果没有设置chunkFilename的话，会以filename为准。
      chunkFilename: 'css/[name].[contenthash:6].css',
    }),
    // webpack gzip后 需要nginx配合设置开启gzip。其实webpack配置gzip的主要目的是降低服务端的gzip压力。部分资源提前打包好。
    new CompressionWebpackPlugin({
      // 压缩后的文件命名 default: '[path].[base].gz'
      filename: '[path].[base].gz',
      // 算法
      algorithm: 'gzip',
      // 目标资源
      test: /\.(js|css)$/,
      // 阈值 大于该数据的文件才会被压缩
      threshold: 10240,
      // 压缩比例 1-10 数值越大 压缩效果越好 但也会更加耗时
      minRatio: 8,
      // 压缩文件后 是否删除源文件 默认不删除
      deleteOriginalAssets: false
    }),
    new webpack.DllReferencePlugin({
      // 配置manifest文件的路径
      context: __dirname,
      // context: path.resolve(__dirname, './'),
      manifest: require('./dll/vendor.manifest.json')
    }),
    // new webpack.DllReferencePlugin({
    //   // 配置manifest文件的路径
    //   context: path.resolve(__dirname, './'),
    //   manifest: require('./dll/element.manifest.json')
    // })
    // new BundleAnalyzerPlugin()
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html')
    }),
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    // name 对应 entry中的属性name   hash chunkhash contenthash
    // filename: '[name].[hash:6].js'
    // filename: 'js/[name].[contenthash:6].js',
    // 用来定义在使用CommonChunkPlugin或者动态加载过程中生成的额外chunk。不会影响到MiniCssExtractPlugin抽离出来的css命名。如果没有设置chunkFilename的话 会默认采用filename的命名
    // chunkFilename: 'js/[name].[contenthash].js',
    // 如果项目想要作为第三方库的话 需要设置导出的变量。libraryTarget用来设置该变量可以以何种方式引用。
    library: 'myLibrary',
    libraryExport: 'default',
    // libraryTarget: 'var', // 作为一个全局变量，通过 script 标签来访问
    // libraryTarget: 'window', // 通过 window 对象访问，在浏览器中
    libraryTarget: 'umd', // 在 AMD 或 CommonJS 的 require 之后可访问

    // filename以及chunkFilename 推荐使用chunkhash 而不是contenthash 因为依赖的css文件内容的改变 不会影响到输出JS文件的contenthash
    filename: 'js/[name].[chunkhash:4].js',
    chunkFilename: 'js/[name].[chunkhash:6].js'
    // filename: 'js/[name].js'
  },
  optimization: {
    splitChunks: {
      // chunks: 'initial',

      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunk-libs',
          // chunks的两个值 initial和async都指的是最开始的chunk块。
          // 该规则会匹配所有异步chunk内的node_modules包（不管是jquery还是lodash） 并打入到chunk-libs包内。如果想要更细致的拆分，可以添加下面具体到包的规则。
          // https://www.webpackjs.com/plugins/split-chunks-plugin/
          chunks: 'async',
          minChunks: 2,
          priority: 20
        },
        // 越精细权重越要设置高
        jquery: {
          test: /[\\/]node_modules[\\/]jquery[\\/]/,
          name: 'chunk-jquery',
          chunks: 'all',
          minChunks: 2,
          priority: 30
        },
        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: 'chunk-lodash',
          chunks: 'initial',
          // minChunks: 2,
          priority: 30
        },
        // 拆分异步chunk中的异步axios 不拆分的话会命中第一条规则chunk-libs
        axios: {
          test: /[\\/]node_modules[\\/]axios[\\/]/,
          name: 'chunk-axios',
          chunks: 'async',
          priority: 30
        },
        default: {
          chunks: 'all',
          name: 'default',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        }
      }
    },
    runtimeChunk: 'single'
  }
}

// yarn report时 process.env.npm_config_report为true
if (process.env.npm_config_report) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config
// hash 每次打包如果整个项目没有变，则不变
// chunkhash 每次打包如果整个chunk没有变，则不变。
// contenthash 每次打包如果文件内容没有变，则该文件的contenthash不会变。


/**
 * 1.namedmoduleplugin hashdmoduleplugin  runtimeChunk
 * 2.两个异步chunk中的node_module分包会打进一个chunk中？异步chunk中的异步chunk呢
 * 同步chunk与异步chunk的公共代码不会命中 即使chunks设置为all,单独利用minChunks不能分离。猜测minChunks不会同时计算二者的总chunks，而是intial与async分别计算。但另外要注意的一点时，如果同步chunk与异步chunk有公共代码 最终打包时虽然不会分离 但公共代码会在main.js文件中 而不是在异步chunk中。
 * 
 * 3. maxAsyncRequests 异步chunk最大拆包数
 *    maxInitialRequests 同步chunk最大拆包数
 * 
 * 
 * 
 * */ 