
const ClientBullet = require("../clientbullet")
const BulletModelMine = require("../../../../entity/bullet/models/mine")
const BasicEntityDrawer = require("../../../graphics/drawers/basicentitydrawer")

class Drawer extends BasicEntityDrawer {
    static spriteNames = [
        "bullets/mine/on",
        "bullets/mine/off"
    ]

    constructor(entity) {
        super(entity);

        this.shift = this.entity.model.id * 350
    }

    draw(program) {
        let index = Math.floor((Date.now() + this.shift) / 1000) % 3
        if(index === 2) index = 1
        this.drawSprite(Drawer.getSprite(index), 60, 60, program)
    }
}

class ClientBulletMine extends ClientBullet {
    constructor(model) {
        super(model);
        this.drawer = new Drawer(this)
    }
}

ClientBullet.associate(ClientBulletMine, BulletModelMine)

module.exports = ClientBulletMine