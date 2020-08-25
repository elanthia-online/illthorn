module.exports = [
  {
    test: /\.node$/,
    use: "node-loader",
  },
  {
    test: /\.(m?js|node)$/,
    exclude: /(node_modules|bower_components)/,
    parser: { amd: false },
    use: [
      {
        loader:
          "@marshallofsound/webpack-asset-relocator-loader",
        options: {
          outputAssetBase: "native_modules",
        },
      },
      {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    ],
  },
  {
    test: /\.(woff(2)?|ttf|eot|svg|jpg|png)(\?v=\d+\.\d+\.\d+)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "fonts/",
        },
      },
    ],
  },
]
