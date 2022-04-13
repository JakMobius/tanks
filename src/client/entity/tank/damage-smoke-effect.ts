
import TransformComponent from "../../../entity/transform-component";
import Color from "../../../utils/color";
import PhysicalComponent from "../../../entity/physics-component";
import SmokeParticle from "../../particles/smoke-particle";
import ClientTankEffect from "../../effects/tank/client-tank-effect";
import ClientTank from "./client-tank";
import HealthComponent from "../../../entity/health-component";

export default class DamageSmokeEffect extends ClientTankEffect {
    private timeSinceLastSmoke: number = 0;

    constructor(tank: ClientTank) {
        super(null, tank)
    }

    tick(dt: number) {
        const model = this.tank.model
        const transform = model.getComponent(TransformComponent).transform
        const health = model.getComponent(HealthComponent).getHealth()

        if(health < 7) {
            this.timeSinceLastSmoke += dt

            const currentSmokeTime = (0.7 + health / 7) / 5
            if(this.timeSinceLastSmoke > currentSmokeTime) {

                const gray = health / 7 * 255

                const color = new Color(gray, gray, gray)

                const position = model.getComponent(PhysicalComponent).getBody().GetPosition()
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

                this.parent.particles.push(smoke)

                this.timeSinceLastSmoke -= currentSmokeTime
            }
        } else {
            this.timeSinceLastSmoke = 0
        }
    }
}