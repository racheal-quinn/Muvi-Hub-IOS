const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
module.exports = {
  entry: './src/index.js', // Update with your entry file
  mode: 'development',
  devServer: {
    static: './dist',
    hot: true,
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'www/js') // Output directory.
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
        FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
        FIREBASE_DATABASE_URL: JSON.stringify(process.env.FIREBASE_DATABASE_URL),
        FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
        FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
        FIREBASE_APP_ID: JSON.stringify(process.env.FIREBASE_APP_ID),
        FIREBASE_MEASUREMENT_ID: JSON.stringify(process.env.FIREBASE_MEASUREMENT_ID),
        REWARDED_AD_ID: JSON.stringify(process.env.REWARDED_AD_ID),
        INTERSTITIAL_AD_ID: JSON.stringify(process.env.INTERSTITIAL_AD_ID),
        BANNER_AD_ID: JSON.stringify(process.env.BANNER_AD_ID),
        REWARDED_INTERSTITIAL_AD_ID: JSON.stringify(process.env.REWARDED_INTERSTITIAL_AD_ID)
      }
    }),
  ],
  module: {
    rules: [
      // webpack rules
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.f7.html$/,
        use: [
          // 'babel-loader',
          'framework7-loader',
        ],
      },
    ],
  },
};