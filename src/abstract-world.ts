
import GameMap from 'src/map/game-map';
import WorldExplodeEffectModelPool from 'src/effects/world/explode/explode-effect-pool';
import AbstractEffect from 'src/effects/abstract-effect';
import AbstractEntity from 'src/entity/abstract-entity';
import AbstractPlayer from 'src/abstract-player';
import ExplodeEffectPool from "src/effects/world/explode/explode-effect-pool";
import AdapterLoop from "./utils/loop/adapter-loop";
import ChunkedMapCollider from "./physics/chunked-map-collider";
import GameWorldContactListener from "./contact-listener";
import GameWorldContactFilter from "./contact-filter";
import PhysicalComponent from "./entity/physics-component";
import Entity from "./utils/ecs/entity";
import PhysicalHostComponent from "./physiсal-world-component";
import TilemapComponent from "./physics/tilemap-component";

export interface GameWorldConfig<MapClass extends GameMap = GameMap> {
    physicsTick?: number
    maxTicks?: number
    positionSteps?: number
    velocitySteps?: number
    map?: MapClass
}

export default class AbstractWorld<
    MapClass extends GameMap = GameMap,
    EntityClass extends AbstractEntity = AbstractEntity,
    EffectClass extends AbstractEffect = AbstractEffect,
    PlayerClass extends AbstractPlayer = AbstractPlayer,
    TankClass extends AbstractEntity = AbstractEntity
> extends Entity {
    public readonly physicsLoop: AdapterLoop;

    players = new Map<number, PlayerClass>()
    entities = new Map<number, EntityClass>()
    effects = new Map<number, EffectClass>()
    explosionEffectPool: ExplodeEffectPool<this>
    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter

    constructor(options?: GameWorldConfig<MapClass>) {
        super()

        options = Object.assign({
            physicsTick: 0.002,
            maxTicks: 30,
            positionSteps: 1,
            velocitySteps: 1
        }, options)

        this.addComponent(new TilemapComponent());

        this.addComponent(new PhysicalHostComponent({
            physicsTick: options.physicsTick,
            positionSteps: options.positionSteps,
            velocitySteps: options.velocitySteps
        }))

        this.addComponent(new ChunkedMapCollider());

        this.setupContactListener()
        this.setupContactFilter()
        this.getComponent(TilemapComponent).setMap(options.map)

        this.createExplosionPool()

        this.physicsLoop = new AdapterLoop({
            maximumSteps: options.maxTicks,
            interval: options.physicsTick
        })

        this.physicsLoop.run = () => this.getComponent(PhysicalHostComponent).tickPhysics()
        this.physicsLoop.start()

        this.on("map-change", () => {
            this.effects.clear()
            this.players.clear()
        })
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new WorldExplodeEffectModelPool({
            world: this
        })
    }

    processPhysics(dt: number): void {
        this.explosionEffectPool.tick(dt)
        this.physicsLoop.timePassed(dt)
    }

    processEntities(dt: number): void {
        for (let entity of this.entities.values()) {
            entity.tick(dt)
        }
    }

    removeDeadEntities() {
        for(let entity of this.entities.values()) {
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
        this.emit("before-tick", dt)

        this.processPhysics(dt)
        this.processEntities(dt)
        this.processEffects(dt)

        this.emit("tick", dt)

        this.removeDeadEntities()
    }

    createEntity(entity: EntityClass): void {
        entity.setWorld(this)
        if(!entity.model.getComponent(PhysicalComponent)) entity.model.initPhysics(this.getComponent(PhysicalHostComponent))
        this.entities.set(entity.model.id, entity)
        this.emit("entity-create", entity)
    }

    removeEntity(entity: EntityClass): void {
        entity.model.destroy()
        entity.setWorld(null)
        this.entities.delete(entity.model.id)
        this.emit("entity-remove", entity)
    }

    createPlayer(player: PlayerClass) {
        player.setWorld(this)
        if(!this.players.has(player.id)) {
            this.players.set(player.id, player)
            this.emit("player-create", player)
        } else {
            this.emit("player-changed-tank", player)
        }
    }

    removePlayer(player: PlayerClass) {
        player.destroy()
        this.players.delete(player.id)
        this.emit("player-remove", player)
    }

    addTankEffect(effect: EffectClass, tank: TankClass) {
        this.emit("effect-create", effect, tank)
    }

    removeTankEffect(effect: EffectClass, tank: TankClass) {
        this.emit("effect-remove", effect, tank)
    }

    addEffect(effect: EffectClass) {
        if(this.effects.has(effect.model.id)) return

        this.effects.set(effect.model.id, effect)
        this.emit("effect-create", effect)
    }

    removeEffect(effect: EffectClass) {
        if(this.effects.delete(effect.model.id)) {
            this.emit("effect-remove", effect)
        }
    }

    // TODO: move to component

    protected setupContactListener() {
        this.contactListener = new GameWorldContactListener(this)
        this.getComponent(PhysicalHostComponent).world.SetContactListener(this.contactListener)
    }

    protected setupContactFilter() {
        this.contactFilter = new GameWorldContactFilter()
        this.getComponent(PhysicalHostComponent).world.SetContactFilter(this.contactFilter)
    }
}