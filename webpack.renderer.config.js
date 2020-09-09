const rules = require("./webpack.rules")

rules.push({
  test: /\.scss$/,
  use: [
    // Creates `style` nodes from JS strings
    {
      loader: "style-loader",
      options: {
        attributes: {
          media: "all",
          class: "style",
        },
      },
    },
    // Translates CSS into CommonJS
    "css-loader",
    // Compiles Sass to CSS
    "sass-loader",
  ],
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
}
