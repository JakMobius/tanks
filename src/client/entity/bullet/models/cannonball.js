const ClientBullet = require("../clientbullet")
const BulletModelCannonball = require("../../../../entity/bullet/models/cannonball")
const BasicEntityDrawer = require("../../../graphics/drawers/basicentitydrawer")

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/cannonball/cannonball"]

    draw(program) {
        this.drawSprite(Drawer.getSprite(0), 18, 18, program)
    }
}

class ClientBulletCannonball extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBulletCannonball, BulletModelCannonball)

module.exports = ClientBulletCannonball