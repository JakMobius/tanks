import PhysicsUtils from '../../utils/physics-utils';
import * as Box2D from '../../library/box2d';
import AirbagTankBehaviour from '../tanks/physics/airbag-tank-behaviour';
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import TankControls from "../../controls/tank-controls";

const vertices = [
    [-1.00, -1.10],
    [-0.80, -1.30],
    [0.80, -1.30],
    [1.00, -1.10],
    [1.00, -0.25],
    [0.55, 0.90],
    [-0.55, 0.90],
    [-1.00, -0.25],
].map(v => new Box2D.Vec2(v[0] * 2.25, v[1] * 2.25))

EntityModel.Types.set(EntityType.TANK_NASTY, (entity) => {
    entity.addComponent(new TankControls())
    entity.addComponent(new AirbagTankBehaviour({
        power: 120000,
        torque: 90000
    }))

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.vertexFixture(vertices, {
            filter: physicsFilters.tank,
            density: 200
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            linearDamping: 0.8,
            angularDamping: 0.7
        });

        body.CreateFixture(bodyFixture)

        return body
    }))
})