
const Particle = require("./particle")

class Smoke extends Particle {
    constructor(config) {
        super(config)
        this.color = config.color
        this.width = config.width || 4
        this.height = config.height || 4
    }
}

module.exports = Smoke