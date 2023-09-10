import path from 'node:path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { type Configuration } from 'webpack';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

const config: Configuration = {
  mode: IS_PROD ? 'production' : 'development',
  devtool: IS_PROD ? false : 'inline-source-map',
  resolve: {
    extensions: ['.css', '.js', '.jsx', '.ts', '.tsx'],
  },
  entry: {
    app: './src/app.ts',
    background: './src/background.ts',
    popup: './src/popup.ts',
    'content-main': './src/content-main.ts',
    'content-style': './src/content-style.ts',
    'content-video': './src/content-video.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'manifest.json', to: '.' },
      ],
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
  },
};

export default config;
