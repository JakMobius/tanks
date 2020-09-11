
const PhysicsUtils = require("./physicsutils.js")
const Box2D = require("../library/box2d")

class Player {

    /** @type AbstractTank */
    tank

    /** @type GameWorld */
    world

    constructor(config) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.world = config.world
        this.tank = null
        this.team = config.team
        this.blockMap = []
    }

    setTank(tank) {
        this.tank = tank
        tank.player = this
    }

    setupPhysics() {
        const wallFixture = PhysicsUtils.squareFixture(10, 10, null, {
            density: 1.0,
            friction: 0.1,
            restitution: 0.5,
        })

        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                this.blockMap.push(null)
                continue
            }

            const bodyDef = new Box2D.b2BodyDef;
            bodyDef.type = Box2D.b2Body.b2_staticBody;
            bodyDef.position.x = 0
            bodyDef.position.y = 0

            this.blockMap.push(this.world.world.CreateBody(bodyDef).CreateFixture(wallFixture).GetBody())
        }
    }

    destroy() {
        this.tank.destroy()

        let blocks = this.blockMap

        for (let i = blocks.length - 1; i >= 0; i--) {
            let b = blocks[i]
            if (b) this.world.world.DestroyBody(b)
        }
        this.blockMap = []
    }
}

module.exports = Player