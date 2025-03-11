import TransformComponent from "src/entity/components/transform-component";
import Color from "src/utils/color";
import PhysicalComponent from "src/entity/components/physics-component";
import SmokeParticle from "src/client/particles/smoke-particle";
import HealthComponent from "src/entity/components/health-component";
import ParticleHostComponent from "./particle-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import FireParticle from "src/client/particles/fire-particle";

export default class DamageSmokeEffectComponent extends EventHandlerComponent {
    private smokeTimer: number = 0;
    private smokeHealthThreshold = 0.7
    private lowSmokeFrequency = 0.33
    private highSmokeFrequency = 0.10

    constructor() {
        super()

        this.eventHandler.on("tick", (dt: number) => this.onTick(dt))
    }

    onTick(dt: number) {
        const tank = this.entity
        const transform = tank.getComponent(TransformComponent).getGlobalTransform()
        const healthComponent = tank.getComponent(HealthComponent)
        const health = healthComponent.getHealth()
        const maxHealth = healthComponent.getMaxHealth()

        let normalizedHealth = health / maxHealth

        if (normalizedHealth >= this.smokeHealthThreshold) {
            this.smokeTimer = 0
            return
        }

        this.smokeTimer += dt

        let currentSmokeTime = this.lowSmokeFrequency * normalizedHealth + (this.highSmokeFrequency) * (1 - normalizedHealth)

        if (normalizedHealth === 0) {
            currentSmokeTime *= 0.5
        }

        if (this.smokeTimer <= currentSmokeTime) {
            return
        }

        const physicalComponent = tank.getComponent(PhysicalComponent)
        const particleComponent = tank.parent.getComponent(ParticleHostComponent)

        const position = physicalComponent.getBody().GetPosition()
        const velocityX = transform.transformX(-2, 0, 0)
        const velocityY = transform.transformY(-2, 0, 0)

        if (normalizedHealth !== 0 || Math.random() < 0.5) {
            const gray = normalizedHealth / 0.7
            const color = new Color().setRGB(gray, gray, gray)
            const particle = new SmokeParticle({
                x: position.x,
                y: position.y,
                dx: (velocityX + Math.random() - 0.5) * 5,
                dy: (velocityY + Math.random() - 0.5) * 5,
                scaling: 2.5,
                color: color,
                width: 1,
                height: 1
            })

            particleComponent.addParticle(particle)
        } else {
            const particle = new FireParticle({
                x: position.x,
                y: position.y,
                dx: (velocityX + Math.random() - 0.5) * 5,
                dy: (velocityY + Math.random() - 0.5) * 5,
                scaling: 2.5,
                width: 1,
                height: 1
            })

            particleComponent.addParticle(particle)
        }
        this.smokeTimer -= currentSmokeTime
    }
}