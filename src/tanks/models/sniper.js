const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const BasicTankBehaviour = require("../physics/trucktankbehaviour")
const Box2D = require("../../library/box2d");
const Weapon42mm = require("../../weapon/models/42mm")

class SniperTank extends TankModel {

    constructor(options) {
        super(options);

        this.behaviour = new BasicTankBehaviour(this, {
            power: 20000
        });
    }

    static getWeapon() {
        return Weapon42mm
    }

    initPhysics(world) {

        this.world = world

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.b2Vec2(0, 0))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.b2Vec2(-size / 2 - segment, size * 0.2))

        this.body = PhysicsUtils.dynamicBody(world);

        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }

    static getMaximumHealth() {
        return 10
    }

    static getId() {
        return 1
    }
}

TankModel.register(SniperTank)

module.exports = SniperTank