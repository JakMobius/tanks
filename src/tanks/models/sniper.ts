import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import BasicTankBehaviour from '../physics/trucktankbehaviour';
import * as Box2D from '../../library/box2d';
import Weapon42mm from '../../weapon/models/42mm';

class SniperTank extends TankModel {

    public static typeName = 1
    public behaviour: BasicTankBehaviour

    constructor() {
        super();

        this.behaviour = new BasicTankBehaviour(this, {
            power: 20000
        });
    }

    static getWeapon() {
        return Weapon42mm
    }

    initPhysics(world: Box2D.World) {

        this.world = world

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.Vec2(0, 0))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, size * 0.2))

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

export default SniperTank;