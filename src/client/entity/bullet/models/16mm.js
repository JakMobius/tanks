const ClientBullet = require("../clientbullet")
const BulletModel16mm = require("../../../../entity/bullet/models/16mm")
const BasicEntityDrawer = require("../../../graphics/drawers/basicentitydrawer")

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/16mm/16mm"]

    draw(program) {
        this.drawSprite(Drawer.getSprite(0), 4, 12, program)
    }
}

class ClientBullet16mm extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBullet16mm, BulletModel16mm)

module.exports = ClientBullet16mm