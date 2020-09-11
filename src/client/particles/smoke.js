
const Particle = require("./particle")

class Smoke extends Particle {
    constructor(config) {
        super(config)
        this.color = config.color
        this.width = config.width || 4
        this.height = config.height || 4
        this.scaling = config.scaling === undefined ? 0.01 : config.scaling
    }

    tick(dt) {
        super.tick(dt)

        this.color.setAlpha(1 - this.lifespan / this.lifetime)
        this.width += this.scaling * dt
        this.height += this.scaling * dt
    }
}

module.exports = Smoke