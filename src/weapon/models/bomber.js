const Weapon = require("../weapon");
const BulletModelBomb = require("../../entity/bullet/models/bomb")

class WeaponBomber extends Weapon {
	constructor(config) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: BulletModelBomb,
		}, config)

		super(config);

		this.id = 1
	}
}

module.exports = WeaponBomber