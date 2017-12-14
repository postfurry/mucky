const path = require('path')

const env = process.env.NODE_ENV
const appSrc = path.resolve(__dirname, 'public/js')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    bundle: './public/js/app.js',
  },
  output: {
    path: appSrc,
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/js',
  },
  externals: {
    jquery: 'jQuery'
  },
  module:{
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|jsx|mjs)$/,
            include: appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              presets: [require.resolve('babel-preset-env')],
            },
          },
        ]
      }
    ]
  }
}