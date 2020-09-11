const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const BasicTankBehaviour = require("../physics/trucktankbehaviour")
const Box2D = require("../../library/box2d");
const WeaponMortar = require("../../weapon/models/mortar")

class MortarTank extends TankModel {

    constructor(options) {
        super(options)

        this.behaviour = new BasicTankBehaviour(this, {
            power: 30000
        });
    }

    static getWeapon() {
        return WeaponMortar
    }

    initPhysics(world) {

        this.world = world

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8, new Box2D.b2Vec2(0, 0))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.b2Vec2(-size / 2 - segment, 0))

        this.body = PhysicsUtils.dynamicBody(world);

        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }

    static getId() {
        return 4
    }

    static getMaximumHealth() {
        return 10
    }
}

TankModel.register(MortarTank)

module.exports = MortarTank