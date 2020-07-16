const path = require('path');

module.exports = {
  entry: {
    main: './lib/main.js'
  },
  target: 'web',
  mode: 'development',
  devtool: false,
  devServer: {
    open: true,
    hot: true
  }
};
