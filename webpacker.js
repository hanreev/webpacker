/**
 * General configuration and file entries
 *
 * outputPath      Global output path, can be absolute or relative path
 * entries         List of entry files. Format: { destination_path: source_path[string|array|glob] }
 *                 Example: { 'js/app.js': ['src/lib.js', 'src/main.js'], 'app.css': 'src/scss/app.scss' }
 *                 Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder
 * copies          List of files or folders to copy. Format: { destination_path: source_path[string|glob] }
 * watchExclude    List of files, folders and glob to exclude on watch
 */

module.exports = {
  outputPath: 'dist',
  entries: {
    'js/[name]': 'src/*.[jt]s',
    'css/[name]': 'src/[^_.]*.s[ac]ss',
  },
  copies: {},
  watchExclude: []
}
