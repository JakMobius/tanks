const beelder = require("./utils/beelder-steps");
const constants = require("./utils/constants");

module.exports = {
    "build-map-converter": {
        steps: [
            beelder.bundleJavascript("src/map-converter/map-converter.ts", `${constants.cacheFolder}/map-converter/index.js`, {
                "compilerOptions": constants.serverCompilerConfig,
                ...constants.serverBundlerConfig
            }),
        ],
        "targets": [
            `#map-converter-build = ${constants.cacheFolder}/map-converter`
        ]
    },
    "release-map-converter": {
        steps: [
            beelder.copy("#map-converter-build", "#map-converter=dist/map-converter")
        ]
    }
}