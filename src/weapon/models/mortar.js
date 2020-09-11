const Weapon = require("../weapon");
const MortarBall = require("../../entity/bullet/models/mortarball")

class WeaponMortar extends Weapon {
	constructor(config) {
		config = Object.assign({
			maxAmmo: 5,
			shootRate: 1000,
			reloadTime: 5000,
			bulletType: MortarBall,
		}, config)

		super(config);

		this.id = 6
	}
}

module.exports = WeaponMortar
