
import PhysicsUtils from './physicsutils';
import * as Box2D from '../library/box2d';
import GameWorld from "../gameworld";
import AbstractTank from "../tanks/abstracttank";
import Team from "../server/team";
import Effect from "../server/bonuses/effect";
import BonusModel from "../server/bonuses/bonus";

export interface PlayerConfig {
    nick?: string
    id?: number
    world?: GameWorld
    team?: Team
}

class Player {
	public nick: any;
	public id: any;
	public team: any;
	public blockMap: any;
	public bonuses: BonusModel[]

    tank: AbstractTank
    world: GameWorld

    constructor(config?: PlayerConfig) {
        config = config || {}
        this.nick = config.nick
        this.id = config.id
        this.world = config.world
        this.tank = null
        this.team = config.team
        this.blockMap = []
    }

    setTank(tank: AbstractTank) {
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

export default Player;