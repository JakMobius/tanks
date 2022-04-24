import PhysicsUtils from '../../utils/physics-utils';
import WheeledTankBehaviour from '../tanks/physics/wheeled-tank/wheeled-tank-behaviour';
import {Vec2} from "../../library/box2d";
import {physicsFilters} from "../../physics/categories";
import WheelAxlesGenerator from "../tanks/physics/wheeled-tank/wheel-axles-generator";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import TankControls from "../../controls/tank-controls";
import {b2BodyType} from "../../library/box2d/dynamics/b2_body";

EntityModel.Types.set(EntityType.TANK_MONSTER, (entity) => {
    entity.addComponent(new TankControls())
    entity.addComponent(new WheeledTankBehaviour({
        enginePower: 900000,
        engineMaxTorque: 200000,
        wheels: WheelAxlesGenerator.generateWheels({
            wheelConfig: {
                grip: 45000,
                maxBrakingTorque: 45000,
                idleBrakingTorque: 5000,
                mass: 100,
            },
            axles: 3,
            axleDistance: 1.5,
            axleWidth: 2
        })
    }));

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.5, 2.5, new Vec2(), {
            density: 512,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.1,
            linearDamping: 0.1
        });

        body.CreateFixture(bodyFixture)

        const behaviour = entity.getComponent(WheeledTankBehaviour)

        for (let wheel of behaviour.wheels) {
            const fixture = PhysicsUtils.squareFixture(0.175, 0.5, wheel.position, {
                density: 512,
                filter: physicsFilters.tank
            })
            body.CreateFixture(fixture)
        }

        return body;
    }))
})