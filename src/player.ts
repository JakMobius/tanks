
import EntityModel from "./entity/entity-model";

export interface PlayerConfig {
    nick?: string
    id?: number
    tank?: EntityModel
}

export default class Player {

    public tank: EntityModel

    public nick: string;
    public id: number;

    constructor(config?: PlayerConfig) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.tank = null
        if(config.tank) this.setTank(config.tank)
    }

    setTank(tank: EntityModel) {
        this.tank = tank
    }
}