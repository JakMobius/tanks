import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physics-utils';
import * as Box2D from '../../../library/box2d';
import BasicTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";
import PhysicalComponent from "../../entity-physics-component";

export default class TeslaTankModel extends TankModel {

    public static typeName = 106
    public behaviour: BasicTankBehaviour

    constructor() {
        super()

        new BasicTankBehaviour(this, {
            engineMaxTorque: 30000,
            enginePower: 30000,
            trackConfig: {
                length: 3.75,
                grip: 30000,
                mass: 100
            },
            trackGauge: 3.75
        })
    }

    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {

        const bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, null, {
            filter: physicsFilters.tank
        })
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(1.6875, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world)
        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.addComponent(new PhysicalComponent(body))
    }
}