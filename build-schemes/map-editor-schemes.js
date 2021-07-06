
const getClientResources = require("./utils/get-client-resources")
const exportShaders = require("./utils/export-shaders")
const exportStylesheets = require("./utils/export-stylesheets")
const insertShadersPlugin = require("./utils/insert-shaders-plugin")
const constants = require("./utils/constants")

module.exports = {
    "prepare-map-editor-resources": {
        "steps": [
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
        "steps": [
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
        "steps": [{
            "action": "bundle-javascript",
            "source": "src/client/map-editor-launcher/index.ts",
            "target": `#map-editor-launcher = ${constants.cacheFolder}/map-editor/scripts/index.js`,
            "compilerOptions": constants.clientCompilerConfig,
            ...constants.clientBundlerConfig
        }, {
            "action": "bundle-javascript",
            "source": "src/client/map-editor/index.ts",
            "target": `#map-editor-executable = ${constants.cacheFolder}/map-editor/scripts/map-editor.js`,
            "compilerOptions": {
                ...constants.clientCompilerConfig,
                "plugins": [
                    insertShadersPlugin({
                        file: "#map-editor-shaders"
                    })
                ]
            },
            ...constants.clientBundlerConfig
        }, {
            "action": "copy",
            "source": "src/client/web/map-editor",
            "target": `${constants.cacheFolder}/map-editor`
        }, {
            "action": "copy",
            "source": "#texture-atlas",
            "target": `${constants.cacheFolder}/map-editor/assets/img/textures`,
        }],
        "targets": [ `#map-editor-build = ${constants.cacheFolder}/map-editor` ]
    },
    "release-map-editor": {
        "steps": [{
            "action": "delete",
            "target": "#map-editor"
        }, {
            "action": "copy",
            "source": "#map-editor-build",
            "target": "#map-editor = dist/map-editor",
        }]
    }
}
