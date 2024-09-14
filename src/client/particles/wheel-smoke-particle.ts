
import SmokeParticle from "src/client/particles/smoke-particle";

export default class WheelSmokeParticle extends SmokeParticle {
    tick(dt: number) {
        super.tick(dt)

        let normalizedLifetime = this.lifespan / this.lifetime

        if(normalizedLifetime < 0.2) {
            this.color.setAlpha(this.alpha / 0.2)
        } else {
            this.color.setAlpha(this.alpha * (1 - normalizedLifetime) / 0.8)
        }
    }
}