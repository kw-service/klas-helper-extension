import type webpack from 'webpack';
import { isEnvProduction } from './env';
import paths from './paths';

const config: webpack.Configuration = {
  entry: paths.appExtMain,
  mode: isEnvProduction ? 'production' : 'development',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 1% in KR, not ie > 0',
              }],
            ],
          },
        },
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  output: {
    filename: 'main-ext.js',
    path: paths.appDist,
  },
};

export default config;
