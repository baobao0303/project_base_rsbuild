import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { createConfig, type PluginAngularOptions } from '@ng-rsbuild/plugin-angular';
import type { RsbuildConfig } from '@rsbuild/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppEnvironment = 'development' | 'staging' | 'qa' | 'production';

export interface SharedDependencyConfig {
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
  requiredVersion?: false | string;
}

export interface RsbuildOptions {
  appName: string;
  isHost?: boolean;
  appDir?: string;
  port?: number;
  env?: AppEnvironment;
  remotes?: Record<string, string>;
  exposes?: Record<string, string>;
  extraOptions?: Partial<PluginAngularOptions>;
  rsbuildConfigOverrides?: Partial<RsbuildConfig>;
}

export function getSharedDependencies(isHost = false): Record<string, SharedDependencyConfig> {
  const eager = isHost;
  return {
    '@angular/core': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/common': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/common/http': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/router': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/platform-browser': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/platform-browser/animations': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/animations': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/forms': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/cdk': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    'rxjs': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    'rxjs/operators': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    'zone.js': { singleton: true, strictVersion: false, eager, requiredVersion: false },
  };
}

export async function createFederatedConfig(options: RsbuildOptions) {
  const {
    appName,
    isHost = false,
    appDir = `apps/${appName}`,
    port = isHost ? 4200 : 4204,
    env = (options.env || (process.env['APP_ENV'] as AppEnvironment) || (process.env['NODE_ENV'] === 'production' ? 'production' : 'development')),
    remotes = {},
    exposes,
    extraOptions = {},
    rsbuildConfigOverrides = {},
  } = options;

  const uniqueName = appName.replace(/-/g, '_');
  const assetPrefix = env === 'development' ? (isHost ? '/' : `http://localhost:${port}/`) : (isHost ? '/' : 'auto');

  return await createConfig({
    options: {
      browser: `./${appDir}/src/main.ts`,
      index: `./${appDir}/src/index.html`,
      tsConfig: `./${appDir}/tsconfig.app.json`,
      outputPath: {
        base: `dist/${appDir}`,
        browser: `dist/${appDir}`,
      },
      styles: [`./${appDir}/src/styles.scss`],
      assets: [],
      polyfills: ['zone.js'],
      inlineStyleLanguage: 'scss',
      skipTypeChecking: env === 'development',
      deleteOutputPath: true,
      devServer: { port },
      ...extraOptions,
    },
    rsbuildConfigOverrides: {
      server: {
        port,
        host: '0.0.0.0',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
      },
      output: {
        assetPrefix,
        distPath: {
          root: `dist/${appDir}`,
        },
        cleanDistPath: true,
        ...rsbuildConfigOverrides?.output,
      },
      tools: {
        rspack: {
          output: {
            uniqueName,
          },
        },
        ...rsbuildConfigOverrides?.tools,
      },
      plugins: [
        pluginModuleFederation({
          name: uniqueName,
          dts: false,
          shared: getSharedDependencies(isHost),
          ...(isHost
            ? { remotes }
            : {
                filename: 'remoteEntry.mjs',
                exposes: exposes ?? {
                  './Routes': `./${appDir}/src/app/remote-entry/entry.routes.ts`,
                },
              }),
        }),
      ],
      ...rsbuildConfigOverrides,
    },
  });
}
