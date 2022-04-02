
const beelder = require("./utils/beelder-steps")
const constants = require("./utils/constants")

module.exports = {
    "release-server": {
        steps: [
            beelder.delete("dist/server/index.js"),
            beelder.delete("dist/server/index.js.map"),
            beelder.delete("dist/server/resources"),
            beelder.copy("#server-build", "#server = dist/server")
        ]
    },

    "release-server-resources": {
        "steps": [
            beelder.delete("dist/server/resources"),
            beelder.copy("#server-build", "dist/")
        ]
    },

    "build-server": {
        steps: [
            beelder.bundleJavascript("src/server/main.ts", `${constants.cacheFolder}/server/index.js`, {
                "compilerOptions": constants.serverCompilerConfig,
                ...constants.serverBundlerConfig
            }),
            beelder.copy("src/server/preferences/default.json", `${constants.cacheFolder}/server/resources/default-preferences.json`),
            beelder.copy("#game",                  `${constants.cacheFolder}/server/resources/web/`),
            beelder.copy("#hub",                   `${constants.cacheFolder}/server/resources/web/`),
            beelder.copy("#tutorial",              `${constants.cacheFolder}/server/resources/web/`),
            beelder.copy("src/client/web/default", `${constants.cacheFolder}/server/resources/web/`),
            beelder.copy("src/server/maps",        `${constants.cacheFolder}/server/resources/`),
            beelder.copy("src/server/scripts",     `${constants.cacheFolder}/server/resources/`)
        ],
        "targets": [
            `#server-build = ${constants.cacheFolder}/server`
        ]
    }
}