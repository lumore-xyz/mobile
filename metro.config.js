const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]),
  /[\\/]\.cxx[\\/]/,
];
// Add .bin to the asset extensions
config.resolver.assetExts.push("bin");

module.exports = withNativeWind(config, { input: "./global.css" });
