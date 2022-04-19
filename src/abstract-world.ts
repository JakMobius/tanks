import GameMap from 'src/map/game-map';
import AbstractEntity from 'src/entity/abstract-entity';
import AbstractPlayer from 'src/abstract-player';
import AdapterLoop from "./utils/loop/adapter-loop";
import ChunkedMapCollider from "./physics/chunked-map-collider";
import GameWorldContactListener from "./contact-listener";
import GameWorldContactFilter from "./contact-filter";
import Entity from "./utils/ecs/entity";
import PhysicalHostComponent from "./physiсal-world-component";
import TilemapComponent from "./physics/tilemap-component";
import EffectHost from "./effects/effect-host";

export interface GameWorldConfig {
    physicsTick?: number
    maxTicks?: number
    positionSteps?: number
    velocitySteps?: number
    map?: GameMap
}

export default class AbstractWorld<
    EntityClass extends AbstractEntity = AbstractEntity,
    PlayerClass extends AbstractPlayer = AbstractPlayer
> extends Entity {
    public readonly physicsLoop: AdapterLoop;

    players = new Map<number, PlayerClass>()
    entities = new Map<number, EntityClass>()
    contactListener: GameWorldContactListener
    contactFilter: GameWorldContactFilter

    constructor(options?: GameWorldConfig) {
        super()

        options = Object.assign({
            physicsTick: 0.002,
            maxTicks: 30,
            positionSteps: 1,
            velocitySteps: 1
        }, options)

        this.addComponent(new EffectHost());
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

        this.physicsLoop = new AdapterLoop({
            maximumSteps: options.maxTicks,
            interval: options.physicsTick
        })

        this.physicsLoop.run = () => this.getComponent(PhysicalHostComponent).tickPhysics()
        this.physicsLoop.start()

        this.on("map-change", () => {
            this.players.clear()
        })
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

    tick(dt: number): void {
        this.emit("before-tick", dt)

        this.physicsLoop.timePassed(dt)
        this.processEntities(dt)

        this.emit("tick", dt)

        this.removeDeadEntities()
    }

    createEntity(entity: EntityClass): void {
        this.appendChild(entity.model)

        this.entities.set(entity.model.id, entity)
        this.emit("entity-create", entity)
    }

    removeEntity(entity: EntityClass): void {
        entity.model.removeFromParent()
        entity.model.destroy()

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