/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 *
 * General configuration and file entries
 *
 * outputPath      string            Global output path, can be absolute or relative path
 * publicPath      string            URL to public path
 * entries         object            List of entry files. Format: { destination_path: source_path [string|array|glob] }
 *                                   Example: { 'js/app.js': ['src/lib.js', 'src/main.js'], 'app.css': 'src/scss/app.scss' }
 *                                   Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder
 * splitChunks     object            splitChunks.cacheGroups entries
 * runtimeChunck   string|false      Webpack runtime script destination path or false to disable splitting
 * providers       object            webpack.ProviderPlugin options
 * copies          object            List of files or folders to copy. Format: { destination_path: source_path[string|glob] }
 * sourceMap       boolean|'auto'    Override sourcemap generation
 * watchExclude    array             List of files, folders and glob to exclude on watch
 */

module.exports = {
  outputPath: 'dist',
  publicPath: '',
  entries: {
    'js/[basename].js': 'example/[jt]s/*.[jt]s',
    'css/[basename].css': 'example/sass/[^_.]*.s[ac]ss',
  },
  splitChunks: {
    jquery: {
      test: /[\\/]node_modules[\\/]jquery[\\/]/,
      name: 'js/vendor.js',
      chunks: 'all',
    }
  },
  runtimeChunk: 'js/runtime.js',
  providers: {
    $: 'jquery',
    jQuery: 'jquery',
  },
  copies: {
    'index.html': 'example/index.html',
    'images': 'example/images',
  },
  sourceMap: 'auto',
  watchExclude: []
}
