const path = require('path');

module.exports = {
  entry: './lib/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(path.join(__dirname, 'dist')),
  },
  node: {
    fs: "empty"
  },
  target: 'web',
  mode: 'development',
  devtool: false,
  devServer: {
    open: true,
    hot: true
  }
};
