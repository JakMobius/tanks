
const constants = require("./utils/constants")

module.exports = {
    "build-texture-atlas": {
        "steps": [{
            "action": "texture-atlas",
            "source": "src/client/textures",
            "target": `#texture-atlas = ${constants.cacheFolder}/textures`,
        }]
    },
}