
import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import Game from "./room/game";
import ServerEntity from "./entity/server-entity";
import ServerEffect from "./effects/server-effect";
import ServerPlayer from "./server-player";
import GameMap from "../map/game-map";
import ServerTank from "./entity/tank/server-tank";
import ServerWorldExplodeEffectPool from "./server-world-explode-effect-model-pool";

export interface ServerGameWorldConfig extends GameWorldConfig {
    room: Game
}

export default class ServerGameWorld extends AbstractWorld<ServerEntity, ServerPlayer, ServerTank> {

    public room: Game

    constructor(options: ServerGameWorldConfig) {
        super(options);

        this.room = options.room
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new ServerWorldExplodeEffectPool({
            world: this
        })
    }
}