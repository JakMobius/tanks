const TankModel = require("../tankmodel");
const PhysicsUtils = require("../../utils/physicsutils.js")
const WheeledTankBehaviour = require("../physics/wheeledtankbehaviour")
const Box2D = require("../../library/box2d");
const WeaponMachineGun = require("../../weapon/models/machinegun")

class MonsterTank extends TankModel {

    constructor(options) {
        super(options)

        this.behaviour = new WheeledTankBehaviour(this, {
            power: 30000
        });
    }

    static getWeapon() {
        return WeaponMachineGun
    }

    static getMaximumHealth() {
        return 10
    }

    static getId() {
        return 3
    }

    initPhysics(world) {
        this.world = world

        let size = 9

        let bodyFixture = PhysicsUtils.squareFixture(size * 0.6, size, new Box2D.b2Vec2(0, -size * 0.25))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(size * 0.18, size * 0.9, new Box2D.b2Vec2(-size * 0.78 , 0))

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.3
        });

        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

TankModel.register(MonsterTank)

module.exports = MonsterTank