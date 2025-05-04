module.exports = function (api) {
    api.cache(true);

    const isWeb = process.env.EXPO_TARGET === 'web';

    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            'react-native-reanimated/plugin',
            [
                "module-resolver",
                {
                    extensions: [".tsx", ".ts", ".js", ".json"],
                    alias: isWeb
                        ? {
                            "react-native$": "react-native-web",
                        }
                        : {},
                },
            ],
        ],
    };
};
