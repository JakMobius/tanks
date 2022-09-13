import TankControls from "../../controls/tank-controls";
import Entity from "../../utils/ecs/entity";
import TilemapHitEmitter from "../components/tilemap-hit-emitter";
import TransformComponent from "../components/transform-component";
import HealthComponent from "../components/health-component";
import EffectHostComponent from "../../effects/effect-host-component";

export default class TankModel {
    static initializeEntity(entity: Entity) {
        entity.addComponent(new TilemapHitEmitter())
        entity.addComponent(new TransformComponent())
        entity.addComponent(new HealthComponent())
        entity.addComponent(new EffectHostComponent())
        entity.addComponent(new TankControls())
    }
}
