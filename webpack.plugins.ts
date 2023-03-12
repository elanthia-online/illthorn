import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyWebpackPlugin from "copy-webpack-plugin"
import path from "path"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const copyPlugins = ["icons"].map((asset) => {
  return new CopyWebpackPlugin({
    patterns: [{ from: path.resolve(__dirname, asset), to: asset }],
  })
})

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
]
