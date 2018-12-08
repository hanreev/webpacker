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

  | Option          | Type                                      | Default  | Description                                                  |
  | --------------- | ----------------------------------------- | -------- | ------------------------------------------------------------ |
  | `outputPath`    | `string`                                  | `""`     | Assets output path, can be absolute or relative path         |
  | `publicPath`    | `string`                                  | `""`     | URL to public path                                           |
  | `entries`       | `{ [destPath: string]: string|string[] }` | `{}`     | List of entry files. Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder |
  | `splitChunks`   | `Object`                                  | `{}`     | Webpack SplitChunksPlugin cacheGroups options. See [details](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunks-cachegroups) |
  | `runtimeChunck` | `string|boolean`                          | `false`  | Webpack runtime script destination path or `false` to disable splitting |
  | `providers`     | `Object`                                  | `{}`     | Webpack ProvidePlugin options. See [detail](https://webpack.js.org/plugins/provide-plugin/) |
  | `copies`        | `{ [destPath: string]: string }`          | `{}`     | List of files or folders to copy, you can glob string as source path |
  | `sourceMap`     | `boolean|"auto"`                          | `"auto"` | Enable/Disable source map                                    |
  | `hashOutput`    | `string|boolean`                          | `true`   | Hash output path. `true` enables hash output to default location: `asset-hash.json` |
  | `watchExclude`  | `string[]`                                | `[]`     | List of files, folders and glob string to exclude on watch   |



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