import Entity from "../utils/ecs/entity";
import TransformComponent from "./components/transform-component";
import HealthComponent from "./components/health-component";
import EffectHostComponent from "../effects/effect-host-component";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import TilemapHitEmitter from "./components/tilemap-hit-emitter";


export default class EntityModel extends Entity {
    static Types = new Map<number, (entity: EntityModel) => void>()

    private worldEventHandler = new BasicEventHandlerSet()
    private dead = false

    constructor() {
        super()

        this.worldEventHandler.on("tick", (dt) => this.tick(dt))

        this.on("attached-to-parent", (child, parent) => {
            if(child == this) this.worldEventHandler.setTarget(parent)
        });

        this.on("will-detach-from-parent", (child) => {
            if(child == this) this.worldEventHandler.setTarget(null)
        })
    }

    tick(dt: number): void {
        if(!this.dead) {
            this.emit("tick", dt)
        }
        this.afterTick()
    }

    afterTick() {
        if(this.dead) {
            this.removeFromParent()
        }
    }

    die() {
        this.dead = true
    }

    isDead() {
        return this.dead || !this.parent
    }

    static initializeEntity(entity: Entity) {
        entity.addComponent(new TilemapHitEmitter())
        entity.addComponent(new TransformComponent())
        entity.addComponent(new HealthComponent())
        entity.addComponent(new EffectHostComponent())
    }
}