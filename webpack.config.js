const path = require('path')

const env = process.env.NODE_ENV

module.exports = {
  entry: {
    bundle: './public/js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/js',
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  externals: {
    jquery: 'jQuery'
  },
}