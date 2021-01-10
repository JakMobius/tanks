import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import PhysicalTankModel from '../physics/trucktankbehaviour';
import * as Box2D from '../../library/box2d';
import WeaponBomber from '../../weapon/models/bomber';

class BomberTank extends TankModel {

    public static typeName = 2
    public behaviour: PhysicalTankModel

    constructor() {
        super()

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

    initPhysics(world: Box2D.World) {
        this.world = world

        let size = 9

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.70, new Box2D.Vec2(0, -size * 0.25))
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(size / 2, size * 0.75, new Box2D.Vec2(size, -0.066 * size))

        this.body = PhysicsUtils.dynamicBody(world);

        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

export default BomberTank;