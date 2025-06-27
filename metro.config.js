const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
  
  // Add optimization settings
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });

  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
  config.resolver.sourceExts.push('svg');

  return config;
})();