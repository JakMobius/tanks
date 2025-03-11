import Color from 'src/utils/color';
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Particle from "src/client/particles/particle";

export default class ClientPelletsEffectComponent extends EventHandlerComponent {

    constructor() {
        super();

        this.eventHandler.on("trigger", () => this.createPellets())
    }

    createPellets() {
        const tank = this.entity.parent
        if (!tank) return

        const world = tank.parent
        const body = tank.getComponent(PhysicalComponent).getBody()
        const transform = tank.getComponent(TransformComponent).getGlobalTransform()

        const weaponAngle = -Math.PI / 2
        const weaponSpread = Math.PI / 4
        const pelletsVelocity = 100
        const maxRadius = 15

        const tankRotation = body.GetAngle()
        const tankPosition = body.GetPosition()
        const tankVelocity = body.GetLinearVelocity()

        const particleOffsetX = transform.transformX(0, 2, 0)
        const particleOffsetY = transform.transformY(0, 2, 0)

        for (let k = 0; k < 12; k++) {
            const angle = tankRotation + (Math.random() - 0.5) * 2 * weaponSpread + weaponAngle;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const vel = pelletsVelocity + Math.random() * 10;
            const dist = Math.random() * 3;

            const pellet = new Particle({
                width: 0.4,
                height: 0.4,
                x: tankPosition.x + particleOffsetX - cos * dist,
                y: tankPosition.y + particleOffsetY - sin * dist,
                dx: tankVelocity.x - cos * vel,
                dy: tankVelocity.y - sin * vel,
                lifetime: maxRadius / pelletsVelocity,
                color: new Color().setRGB(0.19, 0.19, 0.19)
            });

            world.getComponent(ParticleHostComponent).particles.push(pellet)
        }
    }
}