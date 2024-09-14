import Particle from "src/client/particles/particle";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ParticleDrawer from "src/client/graphics/drawers/particle-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import Entity from "src/utils/ecs/entity";

export default class ParticleHostComponent extends EventHandlerComponent {
    particles: Particle[] = []

    drawCallback = (phase: DrawPhase) => this.draw(phase)

    constructor() {
        super()
        this.eventHandler.on("tick", (dt: number) => this.tick(dt))

        this.eventHandler.on("camera-attach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).particleDrawPhase.on("draw", this.drawCallback)
        })

        this.eventHandler.on("camera-detach", (camera: Entity) => {
            camera.getComponent(WorldDrawerComponent).particleDrawPhase.off("draw", this.drawCallback)
        })
    }

    tick(dt: number) {
        for (let i = 0, l = this.particles.length; i < l; i++) {
            let p = this.particles[i]

            p.tick(dt)

            if (p.dead) {
                this.particles.splice(i--, 1)
                l--
            }
        }
    }

    addParticle(decoration: Particle) {
        this.particles.push(decoration)
    }

    draw(phase: DrawPhase) {
        for (let particle of this.particles) {
            ParticleDrawer.drawParticle(phase, particle)
        }
    }
}