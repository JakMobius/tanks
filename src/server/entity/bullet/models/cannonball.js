
const ServerBullet = require("../serverbullet")
const BulletModelCannonball = require("../../../../entity/bullet/models/cannonball")

class ServerBulletCannonball extends ServerBullet {
    constructor(model) {
        super(model);

        this.startVelocity = 600
        this.explodePower = 0
        this.wallDamage = 7600
        this.mass = 30
    }
}

ServerBullet.associate(ServerBulletCannonball, BulletModelCannonball);
module.exports = ServerBulletCannonball