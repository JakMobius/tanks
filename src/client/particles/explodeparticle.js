
const FireParticle = require("./fireparticle")

class ExplodeParticle extends FireParticle {
    createColors(config) {
        let varying = 30
        return [
            [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, config.startOpacity],
            [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0.2],
            [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.3],
            [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.2 * (1 + Math.min(0, config.shifting))],
            [115 - Math.random() * varying, 115 - Math.random() * varying, 115 - Math.random() * varying, 0.2 * (1 + Math.min(0, config.shifting))],
            [115 - Math.random() * varying, 115 - Math.random() * varying, 115 - Math.random() * varying, 0]
        ]
    }

    static fireOnly =   [0.00, 0.10, 0.66, 1.00, 1.00, 1.00] // -1
    static all =        [0.00, 0.10, 0.40, 0.60, 0.80, 1.00] // 0
    static smokeOnly =  [0.00, 0.00, 0.00, 0.33, 0.66, 1.00] // 1

    createTimings(config) {
        let result = []

        let t1, t2, f1, f2
        if(config.shifting < 0) {
            t1 = ExplodeParticle.fireOnly
            t2 = ExplodeParticle.all
            f2 = 1 + config.shifting
        } else {
            t1 = ExplodeParticle.all
            t2 = ExplodeParticle.smokeOnly
            f2 = config.shifting
        }

        f1 = 1 - f2

        for(let i = 0; i < 6; i++) {
            result[i] = t1[i] * f1 + t2[i] * f2
        }

        return result
    }

    constructor(config) {
        super(config);
    }
}

window.ExplodeParticle = ExplodeParticle

module.exports = ExplodeParticle