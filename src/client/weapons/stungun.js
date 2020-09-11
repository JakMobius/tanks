
const Weapon = require("./weapon")

class Stungun extends Weapon {
    constructor(config) {
        super(config)
    }

    readyFraction() {
        return 1
    }

    clone() {
        return new Stungun(this)
    }
}

module.exports = Stungun