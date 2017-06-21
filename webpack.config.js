var path = require('path');
var webpack = require('webpack');
var glob = require('glob-all');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
var PurifyCSSPlugin = require('purifycss-webpack');

//Variable indicating if we are in production mode
var isProduction = process.env.NODE_ENV === 'production';

//Dev and prod conf for SASS and CSS
var cssDev = ['style-loader', 'css-loader', 'sass-loader'];
var cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader', 
  loader: ['css-loader', 'sass-loader']
  //SASS goes through sass-loader, then css-loader
  //The result is extracted to a file (see plugin configuration)
});
var cssConf = isProduction ? cssProd : cssDev;

module.exports = {
  entry: {
    main: './src/js/main.js',
    materialize: "materialize-loader!./materialize-css/materialize.config.js"
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    port: 9001,
    open: true,           //Opens browser after build
    stats: 'errors-only', //Shows errors only in console
    hot: true             //Hot Module Replacement mode on
  },
module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: { 
            //Enabling SASS transpilation in vue components
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          }
        }
      },
      {
        test: /\.scss$/,
        use: cssConf 
      },
      {
        test: /\.pug$/,
        use: ['html-loader', 'pug-html-loader']
      },      
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'img/'
        }
      },
      { 
        //Loaders for materialize's fonts
        test: /\.(woff2?|ttf|eot|svg)$/, 
        loader: 'url-loader?limit=10000&name=fonts/[name].[ext]' 
      },
    ]
  },
  plugins: [   
    new webpack.ProvidePlugin({
      //Required for materialize
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    }),
    new webpack.ProvidePlugin({
      //Nice JS functions, like LINQ for JS
      lodash: 'lodash',
      _: 'lodash'
    }),
    new ExtractTextPlugin({
      filename: '/css/[name].css',
      disable: !isProduction 
      //Turning off Extract Text Plugin for dev mode
      //To enable Hot Module Replacement
    }),
    new PurifyCSSPlugin({
      paths: glob.sync([
        path.join(__dirname, 'src/*.pug'),
        path.join(__dirname, 'src/js/components/*.vue')
      ])
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.pug',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new CleanWebpackPlugin(['.tmp', 'dist']),
    new WebpackNotifierPlugin(),
    new webpack.HotModuleReplacementPlugin(), //Hot Module Replacement
    new webpack.NamedModulesPlugin()          //Hot Module Replacement
  ],  
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.js'
    }
  }
};
