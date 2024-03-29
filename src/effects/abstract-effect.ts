import EffectModel from "./effect-model";
import EffectHostComponent from "./effect-host-component";
import Entity from "../utils/ecs/entity";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

export default class AbstractEffect extends Entity {
    public model: EffectModel
    public host: EffectHostComponent

    protected entityEventHandler = new BasicEventHandlerSet()

    constructor(model: EffectModel) {
        super()
        this.model = model

        this.entityEventHandler.on("tick", (dt: number) => this.tick(dt))
    }

    onAdded(host: EffectHostComponent) {
        this.host = host
        this.entityEventHandler.setTarget(this.host.entity)
        this.emit("added")
    }

    onRemoved() {
        this.host = null
        this.entityEventHandler.setTarget(null)
        this.emit("removed")
    }

    tick(dt: number): void {}

    die(): void {
        if (!this.host) return;

        this.host.removeEffect(this)
    }
}