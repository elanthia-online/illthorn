import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const deb = new MakerDeb(
  { options: {icon: "./icons/app-icon.png", productName: "illthorn"}
  })
const rpm = new MakerRpm(
  { options: {icon: "./icons/app-icon.png"}
  })
const squirrel = new MakerSquirrel(
  { iconUrl: "https://raw.githubusercontent.com/elanthia-online/illthorn/electron-22/icons/app-icon.ico"
  })
const zip = new MakerZIP(
  {
  }, ['darwin'])

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [deb, rpm, squirrel, zip],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      port: 3001,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/frontend/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
};

export default config;
