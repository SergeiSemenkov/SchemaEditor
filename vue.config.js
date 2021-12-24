module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/scheme-editor/' : '/',
  transpileDependencies: [
    'vuetify'
  ]
}
