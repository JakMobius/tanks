import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import WheeledTankBehaviour from '../physics/wheeledtankbehaviour';
import Box2D from '../../library/box2d';
import WeaponMachineGun from '../../weapon/models/machinegun';

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

export default MonsterTank;