
const bundlerBabelPlugins = [
    ["module-resolver", { "extensions": [".js", ".ts", ".json"], "alias": { "src": "./src" }}],
    ["./babel-plugins/babel-plugin-import-dir"],
    ["@babel/plugin-proposal-private-methods", { "loose": true }]
]

const serverCompilerConfig = {
    "includeExternalModules": false,
    "babelPlugins": bundlerBabelPlugins,
}

const serverBundlerConfig = {
    "cacheSection": "no-external-modules"
}

const clientCompilerConfig = {
    "includeExternalModules": true,
    "babelPlugins": bundlerBabelPlugins,
    "cacheSection": "with-external-modules"
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