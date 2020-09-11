const Weapon = require("../weapon");
const Mine = require("../../entity/bullet/models/mine")

class WeaponMiner extends Weapon {
    constructor(config) {
        config = Object.assign({
            maxAmmo: 1,
            shootRate: 1000,
            reloadTime: 1000,
            bulletType: Mine,
        }, config)

        super(config);

        this.id = 5
    }
}

module.exports = WeaponMiner
