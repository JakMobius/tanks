import AbstractWorld from "./abstract-world";
import Team from "./server/team";
import AbstractEntity from "./entity/abstract-entity";
import TankModel from "./entity/tanks/tank-model";

export interface PlayerConfig<
        TankClass extends AbstractEntity = AbstractEntity,
        WorldClass extends AbstractWorld = any
    > {
    nick?: string
    id?: number
    team?: Team
    tank?: TankClass
}

export type AbstractTank = AbstractEntity<any, TankModel> & {
    player: AbstractPlayer
}

export default class AbstractPlayer<
        TankClass extends AbstractTank = AbstractTank,
        WorldClass extends AbstractWorld = any
    > {

    protected world: WorldClass
    public tank: TankClass

    /* Ugly stuff to get around "circular default generic" problem */

    public getWorld(): WorldClass & AbstractWorld { return this.world }
    public setWorld(world: WorldClass & AbstractWorld) { this.world = world }

    public nick: string;
    public id: number;
    public team: Team;

    constructor(config?: PlayerConfig<TankClass, WorldClass>) {
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