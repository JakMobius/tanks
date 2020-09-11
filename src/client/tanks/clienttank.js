
const AbstractTank = require("../../tanks/abstracttank")
const Box2D = require("../../library/box2d")

class ClientTank extends AbstractTank {

    /**
     * @type {TankDrawer}
     */
    drawer = null

    /**
     * @type {Map<number, ClientTankEffect>}
     */
    effects = new Map()

    /**
     * @type {ClientGameWorld}
     */
    world

    /**
     *
     * @param {Object | null} options
     * @param {ClientGameWorld | null} options.world
     * @param {TankModel | null} options.model
     */

    constructor(options) {
        super(options)
        this.drawer = null
        this.engine = null
        this.serverPosition = null

        if(options && options.model) {
            let expected = this.constructor.getModel()
            if (expected && options.model.constructor !== expected) {
                throw new TypeError("Invalid model type")
            }
            this.model = options.model
        } else {
            this.model = new (this.constructor.getModel())
        }
    }

    setupDrawer(ctx) {
        this.drawer = new (this.constructor.getDrawer())(this, ctx)
    }

    destroy() {
        this.model.destroy()
    }

    tick(dt) {
        if(this.serverPosition) {
            let pos = this.model.body.GetPosition()
            let target = this.serverPosition

            let diffX = (target.x - pos.x)
            let diffY = (target.y - pos.y)

            if(diffX * diffX + diffY * diffY > 400) {
                pos.x = target.x
                pos.y = target.y
            } else {
                pos.x += (target.x - pos.x) / 20
                pos.y += (target.y - pos.y) / 20
            }
            this.model.body.SetPosition(pos)
        }
        for(let effect of this.effects.values()) {
            effect.tick(dt)
        }
        this.model.rotation = this.model.body.GetAngle()
        this.model.behaviour.tick(dt)
        this.model.behaviour.countDetails(dt)
    }

    decodeDynamicData(decoder) {
        let teleport = decoder.readUint8()
        let x = decoder.readFloat32()
        let y = decoder.readFloat32()
        let rotation = decoder.readFloat32()
        let vx = decoder.readFloat32()
        let vy = decoder.readFloat32()
        let angularVelocity = decoder.readFloat32()

        let velocity = this.model.body.GetLinearVelocity()

        velocity.Set(vx, vy)

        this.model.body.SetLinearVelocity(velocity)
        this.model.body.SetAngularVelocity(angularVelocity)

        let position = this.model.body.GetPosition()

        // When teleporting, player should instantly move
        // from one point to another. Otherwise, this
        // meant to be continious movement. Considering
        // ping jitter and other imperfections of WWW,
        // these positions should be interpolated to give
        // a smooth move impression to player.

        if (teleport) {
            position.Set(x, y)
        } else {
            if (this.serverPosition)
                this.serverPosition.Set(x, y)
            else this.serverPosition = new Box2D.b2Vec2(x, y)
        }
        this.model.body.SetPositionAndAngle(position, rotation)

        this.health = decoder.readFloat32()
    }

    static createDrawer() {}
    static getDrawer() {}
    static getName() {}
    static getDescription() {}
    static getStats() {}

    static fromModel(model) {
        let clazz = ClientTank.Types.get(model.constructor.getId())

        return new clazz({
            model: model
        })
    }

    static register(clazz) {
        this.Types.set(clazz.getModel().getId(), clazz)
    }
}

module.exports = ClientTank