
import Particle from "../../particles/particle";
import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";

export default class ParticleDrawer {
    static drawParticle(phase: DrawPhase, particle: Particle) {
        let program = phase.getProgram(ConvexShapeProgram)
        let alpha = particle.color.getAlpha()

        if(alpha <= 0) {
            return
        }

        const w = particle.width / 2
        const h = particle.height / 2

        const r = particle.color.getRed() & 0xff
        const g = particle.color.getGreen() & 0xff
        const b = particle.color.getBlue() & 0xff
        const colorData = ConvexShapeProgram.getColor(r, g, b, alpha)

        program.drawConvexShape([
            particle.x - w, particle.y - h,
            particle.x - w, particle.y + h,
            particle.x + w, particle.y + h,
            particle.x + w, particle.y - h
        ], colorData)
    }
}