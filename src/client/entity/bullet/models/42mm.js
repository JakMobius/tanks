const ClientBullet = require("../clientbullet")
const BulletModel42mm = require("../../../../entity/bullet/models/42mm")
const BasicEntityDrawer = require("../../../graphics/drawers/basicentitydrawer")

class Drawer extends BasicEntityDrawer {
    static spriteNames = ["bullets/42mm/42mm"]

    draw(program) {
        this.drawSprite(Drawer.getSprite(0), 6, 23, program)
    }
}

class ClientBullet42mm extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBullet42mm, BulletModel42mm)

module.exports = ClientBullet42mm