
const Particle = require("./particle")

class FireParticle extends Particle {

    createColors(config) {
        let varying = 30
        return [
            [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0],
            [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0.4],
            [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.6],
            [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0]
        ]
    }

    createTimings(config) {
        return [
            0.0,
            0.1,
            0.6,
            1.0
        ]
    }

    constructor(config) {
        super(config)
        this.config = config
        this.width = config.width || 4
        this.height = config.height || 4
        this.scaling = config.scaling || 0.01

        this.colors = this.createColors(config)
        this.times = this.createTimings(config)
        this.tick(0)
    }

    tick(dt) {
        super.tick(dt)
        let fraction = this.lifespan / this.lifetime
        let r, g, b, a, c1, c2
        let colors = this.colors

        for(let i = 0, l = colors.length; i < l; i++) {
            if(fraction < this.times[i]) {
                c2 = i
                break
            } else {
                c1 = i
            }
        }

        if(c2 === undefined) c2 = colors.length - 1
        let f1 = (fraction - this.times[c1]) / (this.times[c2] - this.times[c1])
        let f2 = 1 - f1

        c1 = colors[c1]
        c2 = colors[c2]

        r = c1[0] * f2 + c2[0] * f1
        g = c1[1] * f2 + c2[1] * f1
        b = c1[2] * f2 + c2[2] * f1
        a = c1[3] * f2 + c2[3] * f1

        this.color.r = Math.round(r)
        this.color.g = Math.round(g)
        this.color.b = Math.round(b)
        this.color.alpha = a

        this.width += this.scaling
        this.height += this.scaling
    }
}

module.exports = FireParticle