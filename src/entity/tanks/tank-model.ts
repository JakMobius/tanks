import TankControls from "src/controls/tank-controls";
import Entity from "src/utils/ecs/entity";
import TilemapHitEmitter from "../components/tilemap-hit-emitter";
import TransformComponent from "../components/transform/transform-component";
import HealthComponent from "../components/health/health-component";
import TankWeaponsController from "src/entity/components/weapon/tank-weapons-controller";
import ChildTickComponent from "src/entity/components/child-tick-component";

export default class TankModel {
    static configureTank(entity: Entity) {
        entity.addComponent(new TransformComponent())
        entity.addComponent(new HealthComponent())
        entity.addComponent(new TankControls())
        entity.addComponent(new TankWeaponsController())
        entity.addComponent(new ChildTickComponent())
    }
}
