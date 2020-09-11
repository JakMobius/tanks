const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const PhysicalTankModel = require("../physics/trucktankbehaviour")
const Box2D = require("../../library/box2d");
const WeaponBomber = require("../../weapon/models/bomber")

class BomberTank extends TankModel {

    constructor(config) {
        super(config)

        this.behaviour = new PhysicalTankModel(this, {
            lineardamping: 0.93,
            angulardamping: 0.75
        });
    }

    static getWeapon() {
        return WeaponBomber
    }

    static getMaximumHealth() {
        return 20
    }

    static getId() {
        return 2
    }

    initPhysics(world) {
        this.world = world

        let size = 9

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.70, new Box2D.b2Vec2(0, -size * 0.25))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(size / 2, size * 0.75, new Box2D.b2Vec2(size, -0.066 * size))

        this.body = PhysicsUtils.dynamicBody(world);

        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

TankModel.register(BomberTank)

module.exports = BomberTank