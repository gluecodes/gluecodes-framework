const path = require('path')

module.exports = {
  entry: {
    main: './index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'eslint-loader' }
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}
