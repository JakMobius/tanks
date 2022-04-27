// const FX = require("../../sound/fx")
import FireParticle from '../../particles/fire-particle';

import TankFireEffectModel from 'src/effects/models/tank-fire-effect-model';
import EffectModel from 'src/effects/effect-model';
import ClientTank from "../../entity/tank/client-tank";
import PhysicalComponent from "../../../entity/components/physics-component";
import TransformComponent from "../../../entity/components/transform-component";
import ParticleHost from "../../particle-host";
import ClientEffect from "../client-effect";

export default class ClientTankFireEffect extends ClientEffect {
	public queue: any;
	public frequency: any;
	public sound: any;

	static Model: typeof EffectModel = TankFireEffectModel

    constructor(model: EffectModel) {
        super(model);

        this.queue = 0
        this.frequency = 20
    }

    stop() {
        this.sound.stop()
        this.die()
    }

    tick(dt: number) {

        const entity = this.host.entity
	    const body = entity.getComponent(PhysicalComponent).getBody()
        const transform = entity.getComponent(TransformComponent).transform

        const velocity = body.GetLinearVelocity()
        const angle = body.GetAngle()

        this.queue += dt * this.frequency

        const world = entity.parent
        const particleComponent = world.getComponent(ParticleHost)

        const particlePositionX = transform.transformX(0, 2.5)
        const particlePositionY = transform.transformY(0, 2.5)

        while(this.queue > 0) {
            const heading = -angle + (Math.random() - 0.5) * Math.PI / 4;
            const sin = Math.sin(heading);
            const cos = Math.cos(heading);
            const vel = 60 + Math.random() * 5;
            const dist = Math.random() * 6;

            const smoke = new FireParticle({
                x: particlePositionX + sin * dist,
                y: particlePositionY + cos * dist,
                dx: velocity.x + sin * vel,
                dy: velocity.y + cos * vel,
                width: 1,
                height: 1,
                scaling: 0.375,
                lifetime: 0.4 + Math.random() * 0.1,
            });
            particleComponent.addParticle(smoke)
            this.queue -= 1
        }
    }
}
