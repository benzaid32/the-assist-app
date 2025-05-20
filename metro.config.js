// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Add svg support
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  
  // Define module resolution for patched modules
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    extraNodeModules: {
      // Patch for missing useAnimatedValue.js in react-native-tab-view
      './useAnimatedValue.js': path.resolve(__dirname, 'src/patches/useAnimatedValue.js'),
    },
  };

  // Add module resolver for dependencies that need patching
  config.watchFolders = [
    path.resolve(__dirname, 'src/patches')
  ];

  return config;
})();
