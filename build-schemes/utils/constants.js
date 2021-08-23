
const bundlerBabelPlugins = [
    ["module-resolver", { "extensions": [".js", ".ts", ".json"], "alias": { "src": "./src" }}],
    ["./babel-plugins/babel-plugin-import-dir"],
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
    ["@babel/plugin-syntax-class-properties"],
    ["@babel/plugin-transform-typescript"],
    ["@babel/plugin-transform-runtime"],
]

const serverCompilerConfig = {
    "includeExternalModules": false,
    "babelPlugins": bundlerBabelPlugins,
    "babelPresets": [
        ['@babel/preset-env', { "targets": "node 7", "loose": false }]
    ]
}

const serverBundlerConfig = {
    "cacheSection": "no-external-modules"
}

const clientCompilerConfig = {
    "includeExternalModules": true,
    "babelPlugins": bundlerBabelPlugins,
    "cacheSection": "with-external-modules",
    "babelPresets": [
        ['@babel/preset-env', {
            "targets": "chrome 80, firefox 80, safari 12, ios 12, android 81",
            "loose": false
        }]
    ]
}

const clientBundlerConfig = {
    "cacheSection": "with-external-modules"
}

const cacheFolder = "beelder-cache/build-files";

module.exports = {
    bundlerBabelPlugins: bundlerBabelPlugins,
    serverCompilerConfig: serverCompilerConfig,
    serverBundlerConfig: serverBundlerConfig,
    clientCompilerConfig: clientCompilerConfig,
    clientBundlerConfig: clientBundlerConfig,
    cacheFolder: cacheFolder
}