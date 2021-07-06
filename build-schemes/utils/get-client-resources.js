
const constants = require("./constants")

module.exports = (config) => {
    return {
        "action": "bundle-javascript",
        "source": config.source,
        "compilerOptions": {
            ...constants.clientCompilerConfig,
            "plugins": [{
                "plugin": "resource-plugin",
                "rules": [{
                    "pattern": "**/*.glsl",
                    "target": `#${config.targetName}-shader-list = ${constants.cacheFolder}/temp/${config.targetName}/shader-list.json`
                }, {
                    "pattern": "**/*.@(scss|css)",
                    "target": `#${config.targetName}-style-list = ${constants.cacheFolder}/temp/${config.targetName}/style-list.json`
                }]
            }]
        },
        ...constants.clientBundlerConfig
    }
}