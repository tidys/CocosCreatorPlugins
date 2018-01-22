let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
if (process.env.NODE_ENV === 'production') {

}

module.exports = {
  entry: {
    popup: path.resolve(__dirname, "./src/popup/main.js"),
    devInspector: path.resolve(__dirname, './src/dev/devInspector/main.js'),
    devNoGame: path.resolve(__dirname, './src/dev/devNoGame/main.js'),
    dev: path.resolve(__dirname, './src/dev/dev.js'),
    index: path.resolve(__dirname, './src/index/main.js'),
    backgroundScripts: path.resolve(__dirname, './src/dev/backgroundScripts.js'),
    contentScripts: path.resolve(__dirname, './src/dev/contentScripts.js'),
    util: path.resolve(__dirname, './src/dev/util.js'),
    injectScript: path.resolve(__dirname, './src/dev/injectScript.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: './',
    filename: '[name].main.js'
  },
  plugins: [
    // webpack 执行之前删除dist下的文件
    new CleanWebpackPlugin(
      ['dist/*.*'],
      {
        root: __dirname,//根目录
        verbose: true,//开启在控制台输出信息
        dry: false,//启用删除文件
      }),
    //index.html
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index/index.html",
      filename: 'index.html',
      inject: 'body',
      chunks: ['index']
    }),
    //popup.html
    new HtmlWebpackPlugin({
      template: __dirname + "/src/popup/popup.html",
      filename: 'popup.html',
      inject: 'body',
      chunks: ['popup']
    }),
    //dev.html
    new HtmlWebpackPlugin({
      template: __dirname + "/src/dev/dev.html",
      filename: 'dev.html',
      inject: 'body',
      chunks: ['dev']
    }),

    //devInspector.html
    new HtmlWebpackPlugin({
      template: __dirname + "/src/dev/devInspector/devInspector.html",
      filename: 'devInspector.html',
      inject: 'body',
      chunks: ['devInspector']
    }),

    // 拷贝静态资源(manifest.json)
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/assets/'),
        to: 'static',
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, 'src/manifest.json'),
        to: path.resolve(__dirname, 'dist/')
      }]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.(less|css)$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {}
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    contentBase: "./dist",//本地服务器所加载的页面所在的目录
    historyApiFallback: true,//不跳转
    noInfo: true,
    inline: true,//实时刷新
    overlay: true
  },

  performance: {
    hints: false
  },
  devtool: '#source-map'
};


