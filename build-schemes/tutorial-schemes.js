
const getClientResources = require("./utils/get-client-resources")
const exportShaders = require("./utils/export-shaders")
const exportStylesheets = require("./utils/export-stylesheets")
const insertShadersPlugin = require("./utils/insert-shaders-plugin")
const beelder = require("./utils/beelder-steps")
const constants = require("./utils/constants")

module.exports = {
    "prepare-tutorial-resources": {
        steps: [
            getClientResources({
                source: "src/client/tutorial/index.ts",
                targetName: "tutorial"
            }),
            getClientResources({
                source: "src/client/tutorial-launcher/index.ts",
                targetName: "tutorial-launcher"
            })
        ]
    },
    "compile-tutorial-resources": {
        steps: [
            // Writing shader library to temp folder, because
            // we don't want this json to appear in the bundle.
            exportShaders({
                targetName: "tutorial",
                target: `#tutorial-shaders = ${constants.cacheFolder}/temp/tutorial/tutorial-shaders.json`
            }),
            // Writing styles directly in the bundle
            exportStylesheets({
                targetName: "tutorial",
                target: `#tutorial-styles = ${constants.cacheFolder}/tutorial/styles/tutorial-styles.css`
            }),
            exportStylesheets({
                targetName: "tutorial-launcher",
                target: `#tutorial-launcher-styles = ${constants.cacheFolder}/tutorial/styles/tutorial-launcher-styles.css`
            })
        ]
    },
    "build-tutorial": {
        steps: [
            beelder.bundleJavascript(
                "src/client/tutorial-launcher/index.ts",
                `#tutorial-launcher = ${constants.cacheFolder}/tutorial/scripts/index.js`,
                {
                    compilerOptions: constants.clientCompilerConfig,
                    ...constants.clientBundlerConfig
                }
            ),
            beelder.bundleJavascript(
                "src/client/tutorial/index.ts",
                `#tutorial-executable = ${constants.cacheFolder}/tutorial/scripts/tutorial.js`,
                {
                    compilerOptions: {
                        ...constants.clientCompilerConfig,
                        plugins: [ insertShadersPlugin({ file: "#tutorial-shaders" })]
                    },
                    ...constants.clientBundlerConfig
                }
            ),
            beelder.copy("src/client/web/tutorial", `${constants.cacheFolder}/tutorial`)
        ],
        targets: [ `#tutorial = ${constants.cacheFolder}/tutorial` ]
    },
}