const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const appSrc = path.resolve(__dirname)
const appBuild = path.resolve(appSrc, 'build')
const appHtml = path.resolve(appSrc, 'index.html')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    bundle: './frontend/index.js'
  },
  output: {
    path: appBuild,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    publicPath: '/'
  },
  externals: {
    jquery: 'jQuery'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint')
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        include: appSrc
      },
      {
        oneOf: [
          {
            test: /\.(js|jsx|mjs)$/,
            include: appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                require.resolve('babel-preset-env'),
                require.resolve('babel-preset-stage-2')
              ],
              plugins: [
                [
                  require.resolve('babel-plugin-transform-react-jsx'),
                  { pragma: 'h' }
                ],
                [
                  require.resolve('babel-plugin-jsx-pragmatic'),
                  {
                    module: 'preact',
                    export: 'h',
                    import: 'h'
                  }
                ]
              ]
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
      // Not necessary unless you consume a module using `createClass`
      'create-react-class': 'preact-compat/lib/create-react-class'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: appHtml
    })
  ]
}
