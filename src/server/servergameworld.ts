
import GameWorld, {GameWorldConfig} from '../gameworld';
import ServerWorldExplodeEffectModelPool from './effects/world/types/serverworldexplodeeffect/serverworldexplodeeffectmodelpool';
import Game from "./room/game";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";
import ServerEntity from "./entity/serverentity";
import ServerEffect from "./effects/servereffect";
import ServerPlayer from "./server-player";
import GameMap from "../utils/map/gamemap";

export interface ServerGameWorldConfig<MapClass extends GameMap = GameMap> extends GameWorldConfig<MapClass> {
    room: Game
}

export default class ServerGameWorld<MapClass extends GameMap = GameMap> extends GameWorld<MapClass, ServerEntity, ServerEffect, ServerPlayer> {

    room: Game

    constructor(options: ServerGameWorldConfig<MapClass>) {
        super(options);

        this.room = options.room
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new ExplodeEffectPool({
            world: this
        })
    }
}