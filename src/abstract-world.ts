
import * as Box2D from 'src/library/box2d';
import GameMap from 'src/map/gamemap';
import EventEmitter from 'src/utils/eventemitter';
import WorldExplodeEffectModelPool from 'src/effects/world/explode/explode-effect-pool';
import AbstractEffect from 'src/effects/abstract-effect';
import AbstractEntity from 'src/entity/abstract-entity';
import AbstractPlayer from 'src/abstract-player';
import ExplodeEffectPool from "src/effects/world/explode/explode-effect-pool";
import AdapterLoop from "./utils/loop/adapter-loop";
import PhysicsChunkManager from "./physics/physics-chunk-manager";
import BasicEventHandlerSet from "./utils/basic-event-handler-set";
import GameWorldContactListener from "./contact-listener";
import GameWorldContactFilter from "./contact-filter";

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
> extends EventEmitter {
	public physicsTick: number;
	public maxTicks: number;
	public positionSteps: number;
	public velocitySteps: number;
    public readonly physicsLoop: AdapterLoop;

    world: Box2D.World
    map: MapClass
    players = new Map<number, PlayerClass>()
    entities = new Map<number, EntityClass>()
    effects = new Map<number, EffectClass>()
    explosionEffectPool: ExplodeEffectPool<this>
    physicsChunkManager: PhysicsChunkManager
    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter

    private mapEventHandler = new BasicEventHandlerSet()

    constructor(options?: GameWorldConfig<MapClass>) {
        super()

        options = Object.assign({
            physicsTick: 0.002,
            maxTicks: 30,
            positionSteps: 1,
            velocitySteps: 1
        }, options)

        this.world = new Box2D.World(new Box2D.Vec2())
        this.setupContactListener()
        this.setupContactFilter()
        this.setMap(options.map)

        this.physicsTick = options.physicsTick
        this.maxTicks = options.maxTicks
        this.positionSteps = options.positionSteps
        this.velocitySteps = options.velocitySteps

        this.createExplosionPool()

        this.mapEventHandler.on("block-update", (x, y) => this.emit("map-block-update", x, y))
        this.mapEventHandler.on("block-damage", (x, y) => this.emit("map-block-damage", x, y))
        this.mapEventHandler.on("block-change", (x, y) => this.emit("map-block-change", x, y))

        this.physicsLoop = new AdapterLoop({
            maximumSteps: options.maxTicks,
            interval: this.physicsTick
        })

        this.physicsChunkManager = new PhysicsChunkManager({
            world: this
        })

        this.physicsChunkManager.attach()

        this.physicsLoop.run = () => {
            this.performPhysicsTick()
        }
        this.physicsLoop.start()
    }

    createExplosionPool(): void {
        this.explosionEffectPool = new WorldExplodeEffectModelPool({
            world: this
        })
    }

    private performPhysicsTick() {
        this.world.ClearForces()
        for (let entity of this.entities.values()) {
            entity.model.physicsTick(this.physicsTick)
        }
        this.world.Step(this.physicsTick, this.velocitySteps, this.positionSteps);
    }

    processPhysics(dt: number): void {

        this.explosionEffectPool.tick(dt)
        this.physicsLoop.timePassed(dt)
        this.world.ClearForces()
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
        if(!entity.model.getBody()) entity.model.initPhysics(this.world)
        this.entities.set(entity.model.id, entity)
        this.emit("entity-create", entity)
    }

    removeEntity(entity: EntityClass): void {
        entity.model.destroyPhysics()
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
        //player.team.remove(player);
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

    setMap(map: MapClass) {
        this.effects.clear()
        this.players.clear()
        this.map = map
        this.mapEventHandler.setTarget(map)
        this.emit("map-change", map)
    }

    protected setupContactListener() {
        this.contactListener = new GameWorldContactListener(this)
        this.world.SetContactListener(this.contactListener)
    }

    protected setupContactFilter() {
        this.contactFilter = new GameWorldContactFilter()
        this.world.SetContactFilter(this.contactFilter)
    }
}