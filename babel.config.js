module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "module:metro-react-native-babel-preset"],
    plugins: [
      ["module:react-native-dotenv"] ,["react-native-reanimated/plugin"],
      [require.resolve("babel-plugin-module-resolver"),
      {
        root: ['./src/'],
        alias: {
          components: './src/components',
          helpers: './src/helpers',
          res: './src/res',
          screens : './src/screens',
          fonts : './src/res/fonts'
        },
        extensions: [".js", ".jsx", ".tsx", ".ios.js", ".android.js"],
      }]
    ]
  };
};
