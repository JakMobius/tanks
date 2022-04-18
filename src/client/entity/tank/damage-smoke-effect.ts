import TransformComponent from "../../../entity/transform-component";
import Color from "../../../utils/color";
import PhysicalComponent from "../../../entity/physics-component";
import SmokeParticle from "../../particles/smoke-particle";
import ClientTankEffect from "../../effects/tank/client-tank-effect";
import ClientTank from "./client-tank";
import HealthComponent from "../../../entity/health-component";
import ParticleHost from "../../particle-host";

export default class DamageSmokeEffect extends ClientTankEffect {
    private smokeTimer: number = 0;

    constructor(tank: ClientTank) {
        super(null, tank)
    }

    tick(dt: number) {
        const model = this.tank.model
        const transform = model.getComponent(TransformComponent).transform
        const health = model.getComponent(HealthComponent).getHealth()

        if (health >= 7) {
            this.smokeTimer = 0
            return
        }

        this.smokeTimer += dt

        const currentSmokeTime = (0.7 + health / 7) / 5

        if (this.smokeTimer <= currentSmokeTime) {
            return
        }

        const physicalComponent = model.getComponent(PhysicalComponent)
        const particleComponent = model.parent.getComponent(ParticleHost)

        const gray = health / 7 * 255
        const color = new Color(gray, gray, gray)
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