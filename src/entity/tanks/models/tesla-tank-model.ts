import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import * as Box2D from '../../../library/box2d';
import BasicTankBehaviour from '../physics/truck-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";

export default class TeslaTankModel extends TankModel {

    public static typeName = 106
    public behaviour: BasicTankBehaviour

    constructor() {
        super()

        new BasicTankBehaviour(this, {
            power: 20000
        })
    }

    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {
        let size = 9
        
        const segment = size / 4

        const bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8, null, {
            filter: physicsFilters.tank
        })
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(size / 2 + segment, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world)
        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.setBody(body)
    }
}