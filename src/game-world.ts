import GameMap from 'src/map/game-map';
import AbstractPlayer from 'src/abstract-player';
import AdapterLoop from "./utils/loop/adapter-loop";
import ChunkedMapCollider from "./physics/chunked-map-collider";
import Entity from "./utils/ecs/entity";
import PhysicalHostComponent from "./physiсal-world-component";
import TilemapComponent from "./physics/tilemap-component";
import EffectHost from "./effects/effect-host";
import SoundHostComponent from "./client/entity/components/sound-host-component";

export interface GameWorldConfig {
    physicsTick?: number
    maxTicks?: number
    positionSteps?: number
    velocitySteps?: number
    map?: GameMap
}

export default class GameWorld extends Entity {
    public readonly physicsLoop: AdapterLoop;

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
}