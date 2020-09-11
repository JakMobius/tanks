const BulletModel = require("../bulletmodel");

class BulletModelCannonball extends BulletModel {
    static typeName() { return 2 }

    constructor() {
        super();
    }
}

BulletModel.register(BulletModelCannonball)

// module.exports = new BulletType({
// 	name: "cannonball",
// 	explodePower: 2,
// 	mass: 30,
// 	wallDamage: 7600,
// 	playerDamage: 4,
// 	velocity: 600,
// 	explodes: false,
// 	id: 2
// })

module.exports = BulletModelCannonball