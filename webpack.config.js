var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /.\js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
        use: "babel-loader"
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              // 这里的options选项参数可以定义多大的图片转换为base64
              limit: 50000, // 表示小于50kb的图片转为base64,大于50kb的是路径
              outputPath: "images" //定义输出的图片文件夹
            }
          }
        ]
      },
      {
        test: /\.scss/, // SCSS 文件的处理顺序为先 sass-loader 再 css-loader 再 style-loader
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: false,
              localIdentName: "[path][name]__[local]--[hash:base64:5]"
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  devtool: "#source-map",
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    inline: true,
    clientLogLevel: "none",
    contentBase: path.join(__dirname, "dist"),
    hot: true, // 热启动
    open: true, // 打包好后从浏览器打开
    historyApiFallback: true,
    compress: true,
    overlay: {
      // 项目报错警告，设置成true，在页面上会显示报错
      warnings: true,
      errors: true
    },
    stats: {
      colors: true // 启用/禁用控制台上的颜色。
    },
    port: 3001
  }
};
