
const getClientResources = require("./utils/get-client-resources")
const exportStylesheets = require("./utils/export-stylesheets")
const constants = require("./utils/constants")
const beelder = require("./utils/beelder-steps")

module.exports = {
    "prepare-hub-resources": {
        "steps": [
            getClientResources({
                source: "src/client/hub/index.ts",
                targetName: "hub"
            })
        ]
    },
    "compile-hub-resources": {
        "steps": [
            // Writing styles directly in the bundle
            exportStylesheets({
                targetName: "hub",
                target: `#hub-styles = ${constants.cacheFolder}/hub/styles/hub-styles.css`
            })
        ]
    },
    "build-hub": {
        "steps": [
            beelder.requireTarget("#hub-styles"),
            beelder.bundleJavascript("src/client/hub/index.ts", `${constants.cacheFolder}/hub/scripts/index.js`, {
                "compilerOptions": constants.clientCompilerConfig,
                ...constants.clientBundlerConfig
            }),
            beelder.copy("src/client/web/hub", `${constants.cacheFolder}/hub`)
        ],
        "targets": [ `#hub = ${constants.cacheFolder}/hub` ]
    },
}