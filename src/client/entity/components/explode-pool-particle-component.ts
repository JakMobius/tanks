import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ExplodeParticle from "src/client/particles/explode-particle";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { WorldComponent } from "src/entity/game-world-entity-prefab";

export default class ExplodePoolParticleComponent extends EventHandlerComponent {

    private queue: number = 0
    private particleEmitInterval = 0.006

    constructor() {
        super();

        this.eventHandler.on("tick", (dt) => this.onTick(dt))
    }

    onTick(dt: number) {
        this.queue += dt

        let steps = Math.floor(this.queue / this.particleEmitInterval)
        if (steps === 0) return
        this.queue -= this.particleEmitInterval * steps

        let particleComponent = WorldComponent.getWorld(this.entity).getComponent(ParticleHostComponent)
        let explodePool = this.entity.getComponent(ExplodeEffectPool)

        for (let row of explodePool.walkers.rows.values()) {
            for (let walker of row.values()) {
                let normalized = explodePool.normalize(walker.power)

                if (normalized < 0.3) continue

                let dx = 0
                let dy = 0

                for (let i = 0; i < steps; i++) {

                    let decoration = new ExplodeParticle({
                        width: 0.5 + normalized * 2,
                        height: 0.5 + normalized * 2,
                        x: walker.x + (Math.random() - 0.5) * explodePool.gridSize * 2,
                        y: walker.y + (Math.random() - 0.5) * explodePool.gridSize * 2,
                        dx: dx,
                        dy: dy,
                        scaling: 15 + normalized * 7.5,
                        lifetime: 0.6 - normalized / 2 + Math.random() * 0.3,
                        startOpacity: normalized / 2,
                        shifting: 1 - normalized * 2
                    });

                    particleComponent.addParticle(decoration)
                }
            }
        }
    }
}