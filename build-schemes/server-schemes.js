
const constants = require("./utils/constants")

module.exports = {
    "release-server": {
        "steps": [{
            "action": "delete",
            "target": "dist/server/index.js"
        }, {
            "action": "delete",
            "target": "dist/server/index.js.map"
        }]
    },

    "release-server-resources": {
        "steps": [{
            "action": "delete",
            "target": "dist/server/resources"
        }, {
            "action": "copy",
            "source": "#server-build",
            "target": "#server = dist/"
        }]
    },

    "build-server": {
        "steps": [{
            "action": "bundle-javascript",
            "source": "src/server/main.ts",
            "target": `${constants.cacheFolder}/server/index.js`,
            "compilerOptions": constants.serverCompilerConfig,
            ...constants.serverBundlerConfig
        }, {
            "action": "copy",
            "source": "#game",
            "target": `${constants.cacheFolder}/server/resources/web/`
        }, {
            "action": "copy",
            "source": "#hub",
            "target": `${constants.cacheFolder}/server/resources/web/`
        }, {
           "action": "copy",
           "source": "#tutorial",
           "target": `${constants.cacheFolder}/server/resources/web/`
        }, {
            "action": "copy",
            "source": "src/client/web/default",
            "target": `${constants.cacheFolder}/server/resources/web/`
        }, {
            "action": "copy",
            "source": "src/library/blessed-fork/usr",
            "target": `${constants.cacheFolder}/server/resources/terminal/`
        }, {
            "action": "copy",
            "source": "src/server/maps",
            "target": `${constants.cacheFolder}/server/resources/`
        }, {
            "action": "copy",
            "source": "src/server/preferences/default.json",
            "target": `${constants.cacheFolder}/server/resources/default-preferences.json`
        }, {
            "action": "copy",
            "source": "src/server/scripts",
            "target": `${constants.cacheFolder}/server/resources/`
        }],
        "targets": [
            `#server-build = ${constants.cacheFolder}/server`
        ]
    }
}