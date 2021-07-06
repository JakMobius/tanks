
module.exports = (config) => {
    return {
        "action": "compile-scss",
        "source": `#${config.targetName}-style-list`,
        "target": config.target
    }
}