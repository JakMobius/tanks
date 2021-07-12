
import PhysicsUtils from './physicsutils';
import * as Box2D from '../library/box2d';
import GameWorld from "../gameworld";
import AbstractTank from "../tanks/abstracttank";
import Team from "../server/team";
import BonusModel from "../server/bonuses/bonus";

export interface PlayerConfig<WorldClass extends GameWorld = GameWorld> {
    nick?: string
    id?: number
    world?: WorldClass
    team?: Team
}

export type PlayerTankType<P extends Player> = P extends Player<infer T> ? T : never
export type PlayerWorldType<P extends Player> = P extends Player<any, infer W> ? W : never

export default class Player<
        TankClass extends AbstractTank = AbstractTank,
        WorldClass extends GameWorld = any
    > {

    protected world: WorldClass
    public tank: TankClass

    /* Ugly stuff to get around "circular default generic" problem */

    public getWorld(): WorldClass & GameWorld { return this.world }
    public setWorld(world: WorldClass & GameWorld) { this.world = world }

    //public banana(): WorldClass & GameWorld { return this.world }

    public nick: string;
    public id: number;
    public team: Team;
    public blockMap: Box2D.Body[];
    public bonuses: BonusModel[]

    constructor(config?: PlayerConfig<WorldClass>) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.world = config.world
        this.tank = null
        this.team = config.team
        this.blockMap = []
    }

    setTank(tank: TankClass) {
        this.tank = tank
        tank.player = this
    }

    setupPhysics() {
        const wallFixture = PhysicsUtils.squareFixture(10, 10, null, {
            density: 1.0,
            friction: 0.1,
            restitution: 0.5,
        })

        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                this.blockMap.push(null)
                continue
            }

            const bodyDef = new Box2D.BodyDef();
            bodyDef.type = Box2D.staticBody;
            bodyDef.position.x = 0
            bodyDef.position.y = 0

            this.blockMap.push(this.world.world.CreateBody(bodyDef).CreateFixture(wallFixture).GetBody())
        }
    }

    destroy() {
        this.tank.destroy()

        let blocks = this.blockMap

        for (let i = blocks.length - 1; i >= 0; i--) {
            let b = blocks[i]
            if (b) this.world.world.DestroyBody(b)
        }
        this.blockMap = []
    }
}