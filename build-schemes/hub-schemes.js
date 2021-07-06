
const getClientResources = require("./utils/get-client-resources")
const exportStylesheets = require("./utils/export-stylesheets")
const constants = require("./utils/constants")

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
        "steps": [{
            "action": "require-target",
            "target": "#hub-styles"
        }, {
            "action": "bundle-javascript",
            "source": "src/client/hub/index.ts",
            "target": `${constants.cacheFolder}/hub/scripts/index.js`,
            "compilerOptions": constants.clientCompilerConfig,
            ...constants.clientBundlerConfig
        }, {
            "action": "copy",
            "source": "src/client/web/hub",
            "target": `${constants.cacheFolder}/hub`
        }],
        "targets": [ `#hub = ${constants.cacheFolder}/hub` ]
    },
}