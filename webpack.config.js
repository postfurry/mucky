const path = require('path')

const env = process.env.NODE_ENV
const appSrc = path.resolve(__dirname, 'frontend')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    bundle: './frontend/index.js',
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
  node: {
   fs: "empty"
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
              plugins: [require.resolve('babel-plugin-transform-react-jsx')],
            },
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          }
        ]
      }
    ]
  }
}
