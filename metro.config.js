const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");


const config = getDefaultConfig(__dirname);
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "web.js", "web.ts", "web.tsx"];

config.resolver.alias = {
    "react-native-maps": path.resolve(__dirname, "mocks/react-native-maps.js"),
    "@stripe/stripe-react-native": path.resolve(__dirname, "mocks/empty.js"),
    "react-native/Libraries/Utilities/codegenNativeCommands": path.resolve(__dirname, "mocks/empty.js"),
};
module.exports = withNativeWind(config, {
    input: "./global.css",
});
