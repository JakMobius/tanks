import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

class MortarTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 110

    constructor() {
        super()

        this.behaviour = new TrackTankBehaviour(this, {
            enginePower: 30000
        });
    }

    initPhysics(world: Box2D.World) {

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.8, new Box2D.Vec2(0, 0), {
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world);

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.setBody(body)
    }

    static getMaximumHealth() {
        return 10
    }
}

export default MortarTankModel;