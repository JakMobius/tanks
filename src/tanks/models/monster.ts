import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import WheeledTankBehaviour from '../physics/wheeledtankbehaviour';
import * as Box2D from '../../library/box2d';
import WeaponMachineGun from '../../weapon/models/machinegun';

class MonsterTankModel extends TankModel {

    public static typeName = 3
    public behaviour: WheeledTankBehaviour

    constructor() {
        super()

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

    initPhysics(world: Box2D.World) {
        this.world = world

        let size = 9

        let bodyFixture = PhysicsUtils.squareFixture(size * 0.6, size, new Box2D.Vec2(0, -size * 0.25))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(size * 0.18, size * 0.9, new Box2D.Vec2(-size * 0.78 , 0))

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.3
        });

        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

export default MonsterTankModel;
