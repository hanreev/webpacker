[![npm version](https://badge.fury.io/js/%40hanreev%2Fwebpacker.svg)](https://badge.fury.io/js/%40hanreev%2Fwebpacker)

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

- Run `webpacker init` command to generate empty configuration

  ```bash
  # NPX
  npx webpacker init

  # yarn
  yarn webpacker init
  ```

  > Add `--out` options to generate `webpacker.config.js` into different path
  >
  > See [configuration example](https://github.com/hanreev/webpacker/blob/master/webpacker.config.js)

- Available options:

  | Option          | Type                                                                     | Default     | Description                                                                                                      |
  | --------------- | ------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
  | `outputPath`    | `string`                                                                 | `''`        | Assets output path, can be absolute or relative path                                                             |
  | `publicPath`    | `string`                                                                 | `''`        | URL to public path                                                                                               |
  | `entries`       | <code>{[destPath: string]: string&#124;string[]}</code>                  | `{}`        | List of entry files. Destinaton path for glob and array may use `[name]`, `[basename]` and `[ext]` placeholder   |
  | `splitChunks`   | `Object`                                                                 | `{}`        | See [Webpack SplitChunksPlugin options](https://webpack.js.org/plugins/split-chunks-plugin/)                     |
  | `runtimeChunck` | <code>boolean&#124;'single'&#124;'multiple'&#124;{ name: string }</code> | `false`     | See [Webpack runtime chunk option](https://webpack.js.org/configuration/optimization/#optimization-runtimechunk) |
  | `providers`     | `Object`                                                                 | `{}`        | See [Webpack ProvidePlugin options](https://webpack.js.org/plugins/provide-plugin/)                              |
  | `copies`        | `{[destPath: string]: string}`                                           | `{}`        | List of files, folders or glob to copy                                                                           |
  | `sourceMap`     | <code>boolean&#124;'auto'</code>                                         | `'auto'`    | Enable/Disable source map                                                                                        |
  | `hashOutput`    | <code>string&#124;boolean</code>                                         | `true`      | Hash output path. `true` enables hash output to default location: `asset-hash.json`                              |
  | `watchExclude`  | `string[]`                                                               | `[]`        | List of files, folders and glob string to exclude on watch                                                       |
  | `devServer`     | `Object`                                                                 | `undefined` | See [Webpack DevServer options](https://webpack.js.org/configuration/dev-server)                                 |
  | `webpackConfig` | `Object`                                                                 | `undefined` | Override webpack configuration. See [Webpack configuration](https://webpack.js.org/configuration)                |

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

#### Help Output

```bash
Usage: webpacker <command> [options]

Commands:
  webpacker production   Compile assets for production [default] [aliases: prod]
  webpacker development  Compile assets for development           [aliases: dev]
  webpacker watch        Compile assets for production
  webpacker server       Compile assets and start dev server
  webpacker init         Generate webpacker configuration

Options:
  --help, -h         Show help                                         [boolean]
  --version, -v      Show version number                               [boolean]
  --config, -c       Webpacker config path                              [string]
                                                [default: "webpacker.config.js"]
  --merge, -m        Merge with provided webpack config                 [string]
  --progress, -p     Print compilation progress in percentage          [boolean]
  --color, --colors  Enables/Disables colors on the console            [boolean]
                                                                 [default: true]
  --json, -j         Prints the result as JSON.                        [boolean]
```
