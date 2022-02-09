const path = require('path')

module.exports = {
  entry: './client/js/client.js',
  output: {
    filename: 'client.bundle.js',
    path: path.resolve(__dirname, './dist/'),
    publicPath: "dist/"
  }
}