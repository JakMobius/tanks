import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import * as Box2D from '../../library/box2d';
import BasicTankBehaviour from '../physics/trucktankbehaviour';
import WeaponStungun from '../../weapon/models/stungun';

class TeslaTank extends TankModel {

    public static typeName = 6
    public behaviour: BasicTankBehaviour

    constructor() {
        super()

        new BasicTankBehaviour(this, {
            lineardamping: 0.93,
            angulardamping: 0.75,
            power: 20000
        })
    }

    static getWeapon() {
        return WeaponStungun
    }

    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {
        this.world = world
        
        let size = 9
        
        const segment = size / 4

        const bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8)
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(size / 2 + segment, 0))

        this.body = PhysicsUtils.dynamicBody(world)
        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }
}

export default TeslaTank;