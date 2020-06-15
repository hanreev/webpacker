module.exports = {
  outputPath: 'dist',
  publicPath: '',
  entries: {
    'js/[basename].js': 'example/[jt]s/*.[jt]s',
    'css/[basename].css': 'example/sass/[^_.]*.s[ac]ss',
  },
  splitChunks: {
    cacheGroups: {
      jquery: {
        test: /[\\/]node_modules[\\/]jquery[\\/]/,
        name: 'js/vendor.js',
        chunks: 'all',
      },
    },
  },
  runtimeChunk: { name: 'js/runtime.js' },
  providers: {
    $: 'jquery',
    jQuery: 'jquery',
  },
  copies: {
    'index.html': 'example/index.html',
    images: 'example/images',
  },
  sourceMap: 'auto',
  hashOutput: true,
  watchExclude: ['dist'],
};
