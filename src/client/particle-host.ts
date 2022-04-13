import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import Particle from "./particles/particle";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";

export default class ParticleHost implements Component {
    entity: Entity | null;

    particles: Particle[] = []
    eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("tick", (dt: number) => this.tick(dt))
    }


    tick(dt: number) {
        for(let i = 0, l = this.particles.length; i < l; i++) {
            let p = this.particles[i]

            p.tick(dt)

            if(p.dead) {
                this.particles.splice(i--, 1)
                l--
            }
        }
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }

    addParticle(decoration: Particle) {
        this.particles.push(decoration)
    }
}