module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/schema_editor/' : '/',
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
