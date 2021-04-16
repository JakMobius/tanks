
import GameWorld, {GameWorldConfig} from '../gameworld';
import ServerWorldExplodeEffectModelPool from './effects/world/types/serverworldexplodeeffect/serverworldexplodeeffectmodelpool';
import Game from "./room/game";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";

export interface ServerGameWorldConfig extends GameWorldConfig {
    room: Game
}

export default class ServerGameWorld extends GameWorld {

    room: Game

    constructor(options: ServerGameWorldConfig) {
        super(options);

        this.room = options.room
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new ExplodeEffectPool({
            world: this
        })
    }
}