/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 *
 * General configuration and file entries
 *
 * outputPath      string            Global output path, can be absolute or relative path
 * entries         object            List of entry files. Format: { destination_path: source_path [string|array|glob] }
 *                                   Example: { 'js/app.js': ['src/lib.js', 'src/main.js'], 'app.css': 'src/scss/app.scss' }
 *                                   Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder
 * splitChunks     object            splitChunks.cacheGroups entries
 * providers       object            webpack.ProviderPlugin options
 * copies          object            List of files or folders to copy. Format: { destination_path: source_path[string|glob] }
 * sourceMap       boolean|'auto'    Override sourcemap generation
 * watchExclude    array             List of files, folders and glob to exclude on watch
 */

module.exports = {
  outputPath: 'dist',
  entries: {
    'js/[basename].js': 'src/*.[jt]s',
    'css/[basename].css': 'src/[^_.]*.s[ac]ss',
  },
  splitChunks: {
    jquery: {
      test: /[\\/]node_modules[\\/]jquery[\\/]/,
      name: 'js/jquery.js',
      chunks: 'all',
    }
  },
  providers: {
    $: 'jquery',
    jQuery: 'jquery',
  },
  copies: {},
  sourceMap: 'auto',
  watchExclude: []
}
