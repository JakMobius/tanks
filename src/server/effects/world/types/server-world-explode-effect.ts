
import ServerWorldEffect from '../server-world-effect';
import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ServerGameWorld from "../../../server-game-world";
import ExplodeEffectPool from "../../../../effects/world/explode/explode-effect-pool";

export default class ServerWorldExplodeEffect extends ServerWorldEffect {
    static Model = WorldExplodeEffectModel
    static shouldSynchroniseRemoval = false
    public model: WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel, world: ServerGameWorld) {
        super(model, world);
        this.model = model
    }

    tick(dt: number) {
        this.world.getComponent(ExplodeEffectPool).start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}