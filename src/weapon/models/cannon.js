const Weapon = require("../weapon");
const CannonBall = require("../../entity/bullet/models/cannonball")

class WeaponCannon extends Weapon {
	constructor(config) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 2000,
			reloadTime: 7000,
			bulletType: CannonBall
		}, config)

		super(config);

		this.id = 2
	}
}

module.exports = WeaponCannon