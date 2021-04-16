
import * as Box2D from 'src/library/box2d';
import GameMap from 'src/utils/map/gamemap';
import EventEmitter from 'src/utils/eventemitter';
import WorldExplodeEffectModelPool from 'src/effects/world/explode/explode-effect-pool';
import AbstractEffect from 'src/effects/abstract-effect';
import AbstractEntity from 'src/entity/abstractentity';
import Player from 'src/utils/player';
import AbstractTank from './tanks/abstracttank';
import BlockState from "./utils/map/blockstate/blockstate";
import ExplodeEffectPool from "src/effects/world/explode/explode-effect-pool";

export interface GameWorldConfig {
    physicsTick?: number
    maxTicks?: number
    positionSteps?: number
    velocitySteps?: number
    map: GameMap
}

class GameWorld extends EventEmitter {
	public physicsTick: number;
	public maxTicks: number;
	public positionSteps: number;
	public velocitySteps: number;

    world: Box2D.World
    map: GameMap
    players = new Map<number, Player>()
    entities = new Map<number, AbstractEntity>()
    effects = new Map<number, AbstractEffect>()
    explosionEffectPool: ExplodeEffectPool

    constructor(options: GameWorldConfig) {
        super()

        options = Object.assign({
            physicsTick: 0.002,
            maxTicks: 30,
            positionSteps: 1,
            velocitySteps: 1
        }, options)

        this.world = new Box2D.World(new Box2D.Vec2())
        this.map = options.map

        this.physicsTick = options.physicsTick
        this.maxTicks = options.maxTicks
        this.positionSteps = options.positionSteps
        this.velocitySteps = options.velocitySteps
        this.createExplosionPool()
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new WorldExplodeEffectModelPool({
            world: this
        })
    }

    // TODO: Вынести в отдельный класс

    rebuildBlockPhysics(): void {

        for (let player of this.players.values()) {
            if(!player.tank) continue
            let position = player.tank.model.body.GetPosition()

            const x = Math.floor(position.x / GameMap.BLOCK_SIZE)
            const y = Math.floor(position.y / GameMap.BLOCK_SIZE)

            const tx = x + 2
            const ty = y + 2

            let n = 0

            for (let i = x - 2; i <= tx; i++) {
                for (let j = y - 2; j <= ty; j++, n++) {
                    if (i === x && j === y) continue
                    let block = player.blockMap[n]
                    let mapBlock = this.map.getBlock(i, j)

                    if ((mapBlock && (mapBlock.constructor as typeof BlockState).isSolid) || (i < 0) || (j < 0) || (i >= this.map.width) || (j >= this.map.height)) {
                        let pos = block.GetPosition()

                        pos.x = (i + 0.5) * GameMap.BLOCK_SIZE
                        pos.y = (j + 0.5) * GameMap.BLOCK_SIZE

                        block.SetPosition(pos)

                        block.m_fixtureList.m_filter.maskBits = 0xFFFF
                    } else {
                        if (block.m_fixtureList.m_filter.maskBits) {
                            let pos = block.GetPosition()
                            pos.Set(-1000, -1000)
                            block.SetPosition(pos)
                        }
                        block.m_fixtureList.m_filter.maskBits = 0
                    }
                }
            }
        }
    }

    processPhysics(dt: number): void {

        this.explosionEffectPool.tick(dt)

        let steps = Math.floor(dt / this.physicsTick);
        if (steps > this.maxTicks) steps = this.maxTicks;

        for (let i = 0; i < steps; i++) {
            this.world.Step(this.physicsTick, 1, 1);
            for (let player of this.players.values()) {
                if(player.tank) player.tank.tick(this.physicsTick)
            }
        }

        this.rebuildBlockPhysics()
        this.world.ClearForces()
    }

    processEntities(dt: number): void {
        for (let entity of this.entities.values()) {
            entity.tick(dt)
            if (entity.model.dead)
                this.removeEntity(entity)
        }
    }

    processEffects(dt: number): void {
        for(let effect of this.effects.values()) {
            effect.tick(dt)
            if(effect.dead) {
                this.removeEffect(effect)
            }
        }
    }

    tick(dt: number): void {
        // Processing entities first because
        // otherwise processPhysics method
        // does an excessive initial tick
        // to new bullets

        this.processEntities(dt)
        this.processPhysics(dt)
        this.processEffects(dt)
    }

    createEntity(entity: AbstractEntity): void {
        entity.game = this
        this.entities.set(entity.model.id, entity)
        this.emit("entity-create", entity)
    }

    removeEntity(entity: AbstractEntity): void {
        this.entities.delete(entity.model.id)
        this.emit("entity-remove", entity)
    }

    createPlayer(player: Player) {
        if(this.players.has(player.id)) {
            this.players.get(player.id).destroy()
        }
        player.world = this
        this.players.set(player.id, player)
        player.setupPhysics()
        this.emit("player-create", player)
    }

    removePlayer(player: Player) {
        player.destroy()
        //player.team.remove(player);
        this.players.delete(player.id)
        this.emit("player-remove", player)
    }

    addTankEffect(effect: AbstractEffect, tank: AbstractTank) {
        this.emit("effect-create", effect, tank)
    }

    removeTankEffect(effect: AbstractEffect, tank: AbstractTank) {
        this.emit("effect-remove", effect, tank)
    }

    addEffect(effect: AbstractEffect) {
        if(this.effects.has(effect.model.id)) return

        this.effects.set(effect.model.id, effect)
        this.emit("effect-create", effect)
    }

    removeEffect(effect: AbstractEffect) {
        if(this.effects.delete(effect.model.id)) {
            this.emit("effect-remove", effect)
        }
    }
}

export default GameWorld;