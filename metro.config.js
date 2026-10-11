const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, "../shared"),
];
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]),
  /[\\/]\.cxx[\\/]/,
];
// Add .bin to the asset extensions
config.resolver.assetExts.push("bin");

module.exports = withNativeWind(config, { input: "./global.css" });
