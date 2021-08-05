
// const FX = require("../../sound/fx")
import FireParticle from '../../../particles/fireparticle';

import ClientTankEffect from 'src/client/effects/tank/client-tank-effect';
import TankFireEffectModel from 'src/effects/tank/models/tank-fire-effect-model';
import EffectModel from 'src/effects/effect-model';
import ClientTank from "../../../entity/tank/client-tank";

export default class ClientTankFireEffect extends ClientTankEffect {
	public queue: any;
	public frequency: any;
	public sound: any;
	public dead: any;

	static Model: typeof EffectModel = TankFireEffectModel

    constructor(model: EffectModel, tank: ClientTank) {
        super(model, tank);

        this.queue = 0
        this.frequency = 20
    }

    stop() {
        this.sound.stop()
        this.dead = true
    }

    tick(dt: number) {

	    const body = this.tank.model.getBody()
        const velocity = body.GetLinearVelocity()
        const angle = body.GetAngle()

        const tank = this.tank;

        this.queue += dt * this.frequency

        let world = this.tank.getWorld()

        const particlePositionX = tank.model.matrix.transformX(0, 10)
        const particlePositionY = tank.model.matrix.transformY(0, 10)

        while(this.queue > 0) {
            const heading = -angle + (Math.random() - 0.5) * Math.PI / 4;
            const sin = Math.sin(heading);
            const cos = Math.cos(heading);
            const vel = 240 + Math.random() * 20;
            const dist = Math.random() * 6;

            const smoke = new FireParticle({
                x: particlePositionX + sin * dist,
                y: particlePositionY + cos * dist,
                dx: velocity.x + sin * vel,
                dy: velocity.y + cos * vel,
                width: 4,
                height: 4,
                scaling: 1.5,
                lifetime: 0.4 + Math.random() * 0.1,
            });
            world.particles.push(smoke)
            this.queue -= 1
        }
    }
}
