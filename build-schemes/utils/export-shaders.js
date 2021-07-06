
module.exports = (config) => {
    return {
        "action": "create-shader-library",
        "source": `#${config.targetName}-shader-list`,
        "target": config.target
    }
}