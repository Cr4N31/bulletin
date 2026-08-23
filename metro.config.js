const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Wrap your default config and pass the path to your global CSS file
module.exports = withNativeWind(config, { input: "./global.css" });
