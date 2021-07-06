
const getClientResources = require("./utils/get-client-resources")
const exportShaders = require("./utils/export-shaders")
const exportStylesheets = require("./utils/export-stylesheets")
const insertShadersPlugin = require("./utils/insert-shaders-plugin")
const constants = require("./utils/constants")

module.exports = {
    "prepare-game-resources": {
        "steps": [
            getClientResources({
                source: "src/client/game/index.ts",
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
                target: `#game-styles = ${constants.cacheFolder}/game/styles/game-styles.css`
            }),
            exportStylesheets({
                targetName: "game-launcher",
                target: `#game-launcher-styles = ${constants.cacheFolder}/game/styles/game-launcher-styles.css`
            })
        ]
    },
    "build-game": {
        "steps": [{
            "action": "bundle-javascript",
            "source": "src/client/game-launcher/index.ts",
            "target": `#game-launcher = ${constants.cacheFolder}/game/scripts/index.js`,
            "compilerOptions": constants.clientCompilerConfig,
            ...constants.clientBundlerConfig
        }, {
            "action": "bundle-javascript",
            "source": "src/client/game/index.ts",
            "target": `#game-executable = ${constants.cacheFolder}/game/scripts/game.js`,
            "compilerOptions": {
                ...constants.clientCompilerConfig,
                "plugins": [
                    insertShadersPlugin({
                        file: "#game-shaders"
                    })
                ]
            },
            ...constants.clientBundlerConfig
        }, {
            "action": "copy",
            "source": "src/client/web/game",
            "target": `${constants.cacheFolder}/game`
        }, {
            "action": "copy",
            "source": "#texture-atlas",
            "target": `${constants.cacheFolder}/game/assets/img/textures`,
        }],
        "targets": [ `#game = ${constants.cacheFolder}/game` ]
    },
}