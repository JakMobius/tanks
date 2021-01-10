import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import BasicTankBehaviour from '../physics/trucktankbehaviour';
import * as Box2D from '../../library/box2d';
import WeaponMortar from '../../weapon/models/mortar';

class MortarTank extends TankModel {

    public static typeName = 4
    public behaviour: BasicTankBehaviour

    constructor() {
        super()

        this.behaviour = new BasicTankBehaviour(this, {
            power: 30000
        });
    }

    static getWeapon() {
        return WeaponMortar
    }

    initPhysics(world: Box2D.World) {

        this.world = world

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8, new Box2D.Vec2(0, 0))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, 0))

        this.body = PhysicsUtils.dynamicBody(world);

        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }

    static getMaximumHealth() {
        return 10
    }
}

export default MortarTank;