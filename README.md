# Webpacker

Easy way to use [webpack](https://webpack.js.org/)



### Installation

- NPM

  ```bash
  npm i -D @hanreev/webpacker
  ```

- Yarn

  ```bash
  yarn add -D @hanreev/webpacker
  ```



### Configuration

- Create `webpacker.config.js` in root directory of your project. See [example](https://github.com/hanreev/webpacker/blob/master/webpacker.config.js).

- Available options:

  | Option          | Type                                                         | Default  | Description                                                  |
  | --------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------ |
  | `outputPath`    | `string`                                                     | `''`     | Assets output path, can be absolute or relative path         |
  | `publicPath`    | `string`                                                     | `''`     | URL to public path                                           |
  | `entries`       | <code>{[destPath: string]: string&#124;string[]}</code>      | `{}`     | List of entry files. Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder |
  | `splitChunks`   | `Object`                                                     | `{}`     | Webpack SplitChunksPlugin options. See [detail](https://webpack.js.org/plugins/split-chunks-plugin/) |
  | `runtimeChunck` | <code>boolean&#124;'single'&#124;'multiple'&#124;{ name: string }</code> | `false`  | Webpack runtime chunk option. See [detail](https://webpack.js.org/configuration/optimization/#optimization-runtimechunk) |
  | `providers`     | `Object`                                                     | `{}`     | Webpack ProvidePlugin options. See [detail](https://webpack.js.org/plugins/provide-plugin/) |
  | `copies`        | `{[destPath: string]: string}`                               | `{}`     | List of files, folders or glob to copy                       |
  | `sourceMap`     | <code>boolean&#124;'auto'</code>                             | `'auto'` | Enable/Disable source map                                    |
  | `hashOutput`    | <code>string&#124;boolean</code>                             | `true`   | Hash output path. `true` enables hash output to default location: `asset-hash.json` |
  | `watchExclude`  | `string[]`                                                   | `[]`     | List of files, folders and glob string to exclude on watch   |



### Usage

- NPX

  ```bash
  npx webpacker <command> [options]

  # To see available commands and options, run:
  npx webpacker --help
  ```

- Yarn

  ```bash
  yarn webpacker <command> [options]

  # To see available commands and options, run:
  yarn webpacker --help
  ```

