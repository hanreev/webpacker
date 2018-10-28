/**
 * Webpacker for webpack
 * https://github.com/hanreev/webpacker
 *
 * General configuration and file entries
 *
 * outputPath      Global output path, can be absolute or relative path
 * entries         List of entry files. Format: { destination_path: source_path[string|array|glob] }
 *                 Example: { 'js/app.js': ['src/lib.js', 'src/main.js'], 'app.css': 'src/scss/app.scss' }
 *                 Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder
 * splitChunks     splitChunks.cacheGroups entries
 * providers       webpack.ProviderPlugin options
 * copies          List of files or folders to copy. Format: { destination_path: source_path[string|glob] }
 * watchExclude    List of files, folders and glob to exclude on watch
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
  watchExclude: []
}
