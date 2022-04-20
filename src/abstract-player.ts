import AbstractWorld from "./abstract-world";
import Team from "./server/team";
import AbstractEntity from "./entity/abstract-entity";
import TankModel from "./entity/tanks/tank-model";

export interface PlayerConfig<
        TankClass extends AbstractEntity = AbstractEntity
    > {
    nick?: string
    id?: number
    team?: Team
    tank?: TankClass
}

export type AbstractTank = AbstractEntity & {
    player: AbstractPlayer
}

export default class AbstractPlayer<
        TankClass extends AbstractTank = AbstractTank
    > {

    public tank: TankClass

    public nick: string;
    public id: number;
    public team: Team;

    constructor(config?: PlayerConfig<TankClass>) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.tank = null
        this.team = config.team
        if(config.tank) this.setTank(config.tank)
    }

    setTank(tank: TankClass) {
        this.tank = tank
        tank.player = this
    }

    destroy() {

    }
}