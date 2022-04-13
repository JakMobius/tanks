
import AbstractWorld, {GameWorldConfig} from '../abstract-world';
import Game from "./room/game";
import ServerEntity from "./entity/server-entity";
import ServerPlayer from "./server-player";
import ServerTank from "./entity/tank/server-tank";
import ServerWorldExplodeEffectPool from "./server-world-explode-effect-model-pool";

export interface ServerGameWorldConfig extends GameWorldConfig {
    room: Game
}

export default class ServerGameWorld extends AbstractWorld<ServerEntity, ServerPlayer, ServerTank> {

    public room: Game

    constructor(options: ServerGameWorldConfig) {
        super(options);

        this.addComponent(new ServerWorldExplodeEffectPool())

        this.room = options.room
    }
}