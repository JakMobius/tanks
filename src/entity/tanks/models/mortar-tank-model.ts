import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

class MortarTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 110

    constructor() {
        super()

        this.behaviour = new TrackTankBehaviour(this, {
            engineMaxTorque: 30000,
            enginePower: 30000,
            trackConfig: {
                length: 15,
                grip: 30000,
                mass: 100
            },
            trackGauge: 15
        });
    }

    initPhysics(world: Box2D.World) {

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, new Box2D.Vec2(0, 0), {
            filter: physicsFilters.tank,
            density: 600
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-1.6875, 0), {
            filter: physicsFilters.tank,
            density: 600
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