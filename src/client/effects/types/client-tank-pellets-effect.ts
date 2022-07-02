
import Pellet from 'src/client/particles/pellet-particle'
import Color from 'src/utils/color';
import EffectModel from 'src/effects/effect-model';
import TankPelletsEffectModel from 'src/effects/models/tank-pellets-effect-model';
import PhysicalComponent from "../../../entity/components/physics-component";
import TransformComponent from "../../../entity/components/transform-component";
import ParticleHostComponent from "../../entity/components/particle-host-component";
import ClientEffect from "../client-effect";

export default class ClientTankPelletsEffect extends ClientEffect {
    static Model: typeof EffectModel = TankPelletsEffectModel

    start() {

    }

    draw(ctx: WebGLRenderingContext) {

        const entity = this.host.entity
        const world = entity.parent
        const body = entity.getComponent(PhysicalComponent).getBody()
        const transform = entity.getComponent(TransformComponent).transform

        const tankRotation = body.GetAngle()
        const tankPosition = body.GetPosition()
        const tankVelocity = body.GetLinearVelocity()

        const particleOffsetX = transform.transformX(0, 2, 0)
        const particleOffsetY = transform.transformY(0, 2, 0)

        for(let k = 0; k < 8; k++) {
            const angle = tankRotation + (Math.random() - 0.5) * Math.PI / 4;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const vel = 500 + Math.random() * 20;
            const dist = Math.random() * 3;

            const pellet = new Pellet({
                x: tankPosition.x + particleOffsetX + sin * dist,
                y: tankPosition.y + particleOffsetY + cos * dist,
                dx: tankVelocity.x + sin * vel,
                dy: tankVelocity.y + cos * vel,
                lifetime: 150,
                color: new Color(50, 50, 50)
            });

            world.getComponent(ParticleHostComponent).particles.push(pellet)
        }
    }
}