const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// Add .bin to the asset extensions
config.resolver.assetExts.push("bin");

module.exports = withNativeWind(config, { input: "./global.css" });
