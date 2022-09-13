import TransformComponent from "src/entity/components/transform-component";
import Color from "src/utils/color";
import PhysicalComponent from "src/entity/components/physics-component";
import SmokeParticle from "src/client/particles/smoke-particle";
import HealthComponent from "src/entity/components/health-component";
import ParticleHostComponent from "./particle-host-component";
import ClientEffect from "src/client/effects/client-effect";

export default class DamageSmokeEffect extends ClientEffect {
    private smokeTimer: number = 0;

    constructor() {
        super(null)
    }

    tick(dt: number) {
        const entity = this.host.entity
        const transform = entity.getComponent(TransformComponent).transform
        const health = entity.getComponent(HealthComponent).getHealth()

        if (health >= 7) {
            this.smokeTimer = 0
            return
        }

        this.smokeTimer += dt

        const currentSmokeTime = (0.7 + health / 7) / 5

        if (this.smokeTimer <= currentSmokeTime) {
            return
        }

        const physicalComponent = entity.getComponent(PhysicalComponent)
        const particleComponent = entity.parent.getComponent(ParticleHostComponent)

        const gray = health / 7 * 255
        const color = new Color().setRGB(gray, gray, gray)
        const position = physicalComponent.getBody().GetPosition()
        const velocityX = transform.transformX(0, -2, 0)
        const velocityY = transform.transformY(0, -2, 0)
        const smoke = new SmokeParticle({
            x: position.x,
            y: position.y,
            dx: (velocityX + Math.random() - 0.5) * 5,
            dy: (velocityY + Math.random() - 0.5) * 5,
            scaling: 2.5,
            color: color
        })

        particleComponent.addParticle(smoke)
        this.smokeTimer -= currentSmokeTime
    }
}