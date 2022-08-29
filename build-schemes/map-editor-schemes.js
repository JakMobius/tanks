
const getClientResources = require("./utils/get-client-resources")
const exportShaders = require("./utils/export-shaders")
const exportStylesheets = require("./utils/export-stylesheets")
const insertShadersPlugin = require("./utils/insert-shaders-plugin")
const beelder = require("./utils/beelder-steps")
const constants = require("./utils/constants")

module.exports = {
    "prepare-map-editor-resources": {
        steps: [
            getClientResources({
                source: "src/client/map-editor/index.ts",
                targetName: "map-editor"
            }),
            getClientResources({
                source: "src/client/map-editor-launcher/index.ts",
                targetName: "map-editor-launcher"
            })
        ]
    },
    "compile-map-editor-resources": {
        steps: [
            // Writing shader library to temp folder, because
            // we don't want this json to appear in the bundle.
            exportShaders({
                targetName: "map-editor",
                target: `#map-editor-shaders = ${constants.cacheFolder}/temp/map-editor/map-editor-shaders.json`
            }),
            // Writing styles directly in the bundle
            exportStylesheets({
                targetName: "map-editor",
                target: `#map-editor-styles = ${constants.cacheFolder}/map-editor/styles/map-editor-styles.css`
            }),
            exportStylesheets({
                targetName: "map-editor-launcher",
                target: `#map-editor-launcher-styles = ${constants.cacheFolder}/map-editor/styles/map-editor-launcher-styles.css`
            })
        ]
    },
    "build-map-editor": {
        steps: [
            beelder.bundleJavascript(
                "src/client/map-editor-launcher/index.ts",
                `#map-editor-launcher = ${constants.cacheFolder}/map-editor/scripts/index.js`,{
                    compilerOptions: constants.clientCompilerConfig,
                    ...constants.clientBundlerConfig
            }),
            beelder.bundleJavascript(
                "src/client/map-editor/index.ts",
                `#map-editor-executable = ${constants.cacheFolder}/map-editor/scripts/map-editor.js`,{
                    compilerOptions: {
                        ...constants.clientCompilerConfig,
                        plugins: [
                            insertShadersPlugin({
                                file: "#map-editor-shaders"
                            })
                        ]
                    },
                    ...constants.clientBundlerConfig
            }),
            beelder.bundleJavascript(
            "src/client/map-editor/index.ts",
            `#map-editor-executable = ${constants.cacheFolder}/map-editor/scripts/map-editor.js`, {
                ...constants.clientBundlerConfig,
                compilerOptions: {
                    ...constants.clientCompilerConfig,
                    plugins: [
                        insertShadersPlugin({
                            file: "#map-editor-shaders"
                        })
                    ]
                }
            }),
            beelder.copy("src/client/web/map-editor", `${constants.cacheFolder}/map-editor`),

            // TODO: It's not good to steal game assets for the map editor.
            // It's probably better to combine hub, game and map editor into a single page.
            beelder.copy("src/client/web/game/assets", `${constants.cacheFolder}/map-editor/`),
            beelder.copy("#texture-atlas", `${constants.cacheFolder}/map-editor/assets/img/textures`)
        ],
        targets: [ `#map-editor-build = ${constants.cacheFolder}/map-editor` ]
    },
    "release-map-editor": {
        steps: [
            beelder.delete("#map-editor"),
            beelder.copy("#map-editor-build", "#map-editor = dist/map-editor")
        ]
    }
}
