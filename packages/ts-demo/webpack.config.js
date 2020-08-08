const Path = require('path');
const Fs = require('fs')
const WebPack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports = {
    target: 'node',
    externals: {
    },
    entry: {
        main: './src/main.ts',
        panel: './src/panel/index.ts'
    },
    output: {
        path: Path.join(__dirname, 'dist'),
        // publicPath: 'dist', // 通过devServer访问路径,这个路径也会打入到最终的html
        filename: '[name].js' // 打包后的文件名
    },
    devtool: 'source-map',
    mode: 'development',

    resolve: {
        // 当import文件时，没有写后缀的情况下，按照以下扩展名依次load
        extensions: ['.vue', '.ts', '.js', '.json', '.less'],
        alias: {
            vue: 'vue/dist/vue.esm.js',
        },
        // 去哪些目录下寻找第三方模块
        modules: [
            'node_modules',
            Path.join(__dirname, './src')
        ]
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/

            },
            {
                test: /\.ts(x?)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    onlyCompileBundledFiles: true,
                    appendTsSuffixTo: [/\.vue$/], // 给.vue文件添加个.ts后缀用于编译
                }
            },
        ]

    },
    plugins: [
        new VueLoaderPlugin(),
        new WebPack.ProvidePlugin({
        }),
    ],
    watch: false,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
        poll: 200,
    }
}
