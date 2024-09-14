
const getClientResources = require("./utils/get-client-resources")
const exportShaders = require("./utils/export-shaders")
const exportStylesheets = require("./utils/export-stylesheets")
const insertShadersPlugin = require("./utils/insert-shaders-plugin")
const constants = require("./utils/constants")
const beelder = require("./utils/beelder-steps");

module.exports = {
    "prepare-game-resources": {
        "steps": [
            getClientResources({
                source: "src/client/index.ts",
                targetName: "game"
            }),
            getClientResources({
                source: "src/client/game-launcher/index.ts",
                targetName: "game-launcher"
            })
        ]
    },
    "compile-game-resources": {
        "steps": [
            // Writing shader library to temp folder, because
            // we don't want this json to appear in the bundle.
            exportShaders({
                targetName: "game",
                target: `#game-shaders = ${constants.cacheFolder}/temp/game/game-shaders.json`
            }),
            // Writing styles directly in the bundle
            exportStylesheets({
                targetName: "game",
                target: `#game-styles = ${constants.cacheFolder}/web/styles/styles.css`
            }),
            exportStylesheets({
                targetName: "game-launcher",
                target: `#game-launcher-styles = ${constants.cacheFolder}/web/styles/launcher-styles.css`
            }),
            beelder.copy("src/client/web", `${constants.cacheFolder}/web`),
            beelder.copy("#texture-atlas", `${constants.cacheFolder}/web/assets/img/textures`)
        ],
    },
    "build-game": {
        "steps": [
            beelder.bundleJavascript("src/client/game-launcher/index.ts", `#game-launcher = ${constants.cacheFolder}/web/scripts/index.js`, {
                "compilerOptions": constants.clientCompilerConfig,
                ...constants.clientBundlerConfig
            }),
            beelder.bundleJavascript(
                "src/client/game/index.ts",
                `#game-executable = ${constants.cacheFolder}/web/scripts/main.js`, {
                    compilerOptions: {
                        ...constants.clientCompilerConfig,
                        plugins: [
                            insertShadersPlugin({
                                file: "#game-shaders"
                            })
                        ]
                    },
                    ...constants.clientBundlerConfig
            })
        ],
        "targets": [ `#web-resources = ${constants.cacheFolder}/web` ]
    },
}