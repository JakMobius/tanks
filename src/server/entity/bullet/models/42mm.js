
const ServerBullet = require("../serverbullet")
const BulletModel42mm = require("../../../../entity/bullet/models/42mm")

class ServerBullet42mm extends ServerBullet {
    constructor(model) {
        super(model);

        this.wallDamage = 3000
        this.startVelocity = 450
        this.explodePower = 5
    }
}

ServerBullet.associate(ServerBullet42mm, BulletModel42mm);
module.exports = ServerBullet42mm