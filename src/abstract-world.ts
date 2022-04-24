import GameMap from 'src/map/game-map';
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
    PlayerClass extends AbstractPlayer = AbstractPlayer
> extends Entity {
    public readonly physicsLoop: AdapterLoop;

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
    }

    tick(dt: number): void {
        this.physicsLoop.timePassed(dt)
        this.emit("tick", dt)
    }

    createPlayer(player: PlayerClass) {
        this.emit("player-create", player)
    }

    removePlayer(player: PlayerClass) {
        this.emit("player-remove", player)
    }

    // TODO: move to component

    protected setupContactListener() {
        this.contactListener = new GameWorldContactListener()
        this.getComponent(PhysicalHostComponent).world.SetContactListener(this.contactListener)
    }

    protected setupContactFilter() {
        this.contactFilter = new GameWorldContactFilter()
        this.getComponent(PhysicalHostComponent).world.SetContactFilter(this.contactFilter)
    }
}