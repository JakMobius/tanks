const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const BasicTankBehaviour = require("../physics/trucktankbehaviour")
const Box2D = require("../../library/box2d")
const Cannon = require("../../weapon/models/cannon")

class BigBoiTank extends TankModel {

    constructor(options) {
        super(options);

        this.behaviour = new BasicTankBehaviour(this, {
            lateralFriction: 150,
            power: 40000,
            angulardamping: 2,
            angularFriction: 0.1,
            truckSlipperness: 0
        });
    }

    static getWeapon() {
        return Cannon
    }

    static getMaximumHealth() {
        return 20
    }

    static getId() {
        return 5
    }

    initPhysics(world) {
        this.world = world

        let size = 9

        const segment = size / 2;

        let bodyFixture = PhysicsUtils.squareFixture(
            size,
            size * 0.87,
            null,{
            density: 3.5
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(
            segment,
            size,
            new Box2D.b2Vec2(size, 0), {
            density: 2
        })

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.5
        });
        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

TankModel.register(BigBoiTank)

module.exports = BigBoiTank