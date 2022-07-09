
import EntityModel from "./entity/entity-model";
import EventEmitter from "./utils/event-emitter";
import GameWorld from "./game-world";

export interface PlayerConfig {
    nick?: string
    id?: number
}

export default class Player extends EventEmitter {
    public world: GameWorld
    public tank: EntityModel
    public nick: string;
    public id: number;

    constructor(config?: PlayerConfig) {
        super()
        config = config || {}
        this.nick = config.nick
        this.id = config.id
    }

    setWorld(world: GameWorld) {
        if(this.world == world) return;
        this.world = world
        this.emit("world-set")
    }

    setTank(tank: EntityModel) {
        if(this.tank == tank) return;
        this.tank = tank
        this.emit("tank-set")
    }
}