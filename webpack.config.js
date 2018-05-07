const path = require('path')

// TODO: multiple targets for testing? https://webpack.js.org/concepts/targets/#multiple-targets
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/src'),
    library: 'nexusdk',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  target: 'node',
}
