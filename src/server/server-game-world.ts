
import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import Game from "./room/game";
import ServerEntity from "./entity/serverentity";
import ServerEffect from "./effects/servereffect";
import ServerPlayer from "./server-player";
import GameMap from "../map/gamemap";
import ServerTank from "./entity/tank/servertank";
import ServerWorldExplodeEffectPool from "./server-world-explode-effect-model-pool";

export interface ServerGameWorldConfig<MapClass extends GameMap = GameMap> extends GameWorldConfig<MapClass> {
    room: Game
}

export default class ServerGameWorld<MapClass extends GameMap = GameMap> extends AbstractWorld<MapClass, ServerEntity, ServerEffect, ServerPlayer, ServerTank> {

    public room: Game

    constructor(options: ServerGameWorldConfig<MapClass>) {
        super(options);

        this.room = options.room
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new ServerWorldExplodeEffectPool({
            world: this
        })
    }
}