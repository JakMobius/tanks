const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const Box2D = require("../../library/box2d");
const BasicTankBehaviour = require("../physics/trucktankbehaviour")
const WeaponStungun = require("../../weapon/models/stungun")

class TeslaTank extends TankModel {

    constructor(options) {
        super(options)

        new BasicTankBehaviour(this, {
            lineardamping: 0.93,
            angulardamping: 0.75,
            power: 20000
        })
    }

    static getWeapon() {
        return 8
    }

    static getMaximumHealth() {
        return 20
    }

    static getId() {
        return WeaponStungun
    }

    initPhysics(world) {
        this.world = world
        
        let size = 9
        
        const segment = size / 4

        const bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8)
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.b2Vec2(size / 2 + segment, 0))

        this.body = PhysicsUtils.dynamicBody(world)
        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }
}

TankModel.register(TeslaTank)

module.exports = TeslaTank