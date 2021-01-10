
import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import * as Box2D from '../../library/box2d';
import BasicTankBehaviour from '../physics/trucktankbehaviour';
import WeaponShotgun from '../../weapon/models/shotgun';

class ShotgunTank extends TankModel {

    public static typeName = 0
    public behaviour: BasicTankBehaviour

    constructor() {
        super();

        this.behaviour = new BasicTankBehaviour(this, {
            lateralFriction: 2,
            power: 20000,
            lineardamping: 0.93,
        });
    }

    static getWeapon() {
        return WeaponShotgun
    }

    initPhysics(world: Box2D.World) {

        this.world = world

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.Vec2(0, -size * 0.2))
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

export default ShotgunTank;