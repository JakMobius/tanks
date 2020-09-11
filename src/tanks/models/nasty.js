
const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const Box2D = require("../../library/box2d");
const AirbagTankBehaviour = require("../physics/airbagbehaviour")
const WeaponFlamethrower = require("../../weapon/models/flamethrower")

class NastyTank extends TankModel {

    constructor(options) {
        super(options)

        this.behaviour = new AirbagTankBehaviour(this, {})
    }

    static getWeapon() {
        return WeaponFlamethrower
    }

    static getMaximumHealth() {
        return 15
    }

    static getId() {
        return 7
    }

    initPhysics(world) {
        this.world = world

        let size = 9

        const vertexArray = [
            new Box2D.b2Vec2(-1.00,  -1.10),
            new Box2D.b2Vec2(-0.80,  -1.30),
            new Box2D.b2Vec2( 0.80,  -1.30),
            new Box2D.b2Vec2( 1.00,  -1.10),
            new Box2D.b2Vec2( 1.00,  -0.25),
            new Box2D.b2Vec2( 0.55,   0.90),
            new Box2D.b2Vec2(-0.55,   0.90),
            new Box2D.b2Vec2(-1.00,  -0.25),
        ]

        vertexArray.forEach(v => v.Multiply(size));

        let bodyFixture = PhysicsUtils.vertexFixture(vertexArray)

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.8,
            angularDamping: 0.7
        });

        this.body.CreateFixture(bodyFixture)

        this.world = world
    }
}

TankModel.register(NastyTank)

module.exports = NastyTank