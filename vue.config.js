const monacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/emondrian/schema_editor/' : '/',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    plugins: [
      new monacoWebpackPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.xml$/i,
          use: 'raw-loader',
        },
      ],
    }
  }
}
