
import Team from "./server/team";
import AbstractEntity from "./entity/abstract-entity";
import EntityModel from "./entity/entity-model";


export interface PlayerConfig {
    nick?: string
    id?: number
    team?: Team
    tank?: EntityModel
}

export type AbstractTank = AbstractEntity & {
    player: AbstractPlayer
}

export default class AbstractPlayer {

    public tank: EntityModel

    public nick: string;
    public id: number;
    public team: Team;

    constructor(config?: PlayerConfig) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.tank = null
        this.team = config.team
        if(config.tank) this.setTank(config.tank)
    }

    setTank(tank: EntityModel) {
        this.tank = tank
    }

    destroy() {

    }
}