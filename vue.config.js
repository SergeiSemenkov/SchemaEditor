module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/scheme-editor/' : '/',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
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
