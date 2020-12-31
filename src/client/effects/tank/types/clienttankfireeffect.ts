
// const FX = require("../../sound/fx")
import FireParticle from '../../../particles/fireparticle';

import ClientTankEffect from '../clienttankeffect';
import TankFireEffectModel from '@/effects/tank/tankfireeffectmodel';

class ClientTankFireEffect extends ClientTankEffect {
	public queue: any;
	public frequency: any;
	public sound: any;
	public dead: any;

    constructor(model, tank) {
        super(model, tank);

        this.queue = 0
        this.frequency = 20
    }

    stop() {
        this.sound.stop()
        this.dead = true
    }

    tick(dt) {

        const position = this.tank.model.body.GetPosition()
        const velocity = this.tank.model.body.GetLinearVelocity()
        const angle = this.tank.model.body.GetAngle()

        const tank = this.tank;

        this.queue += dt * this.frequency

        while(this.queue > 0) {
            for(let k = 0; k < 20; k++) {
                const heading = -angle + (Math.random() - 0.5) * Math.PI / 4;
                const sin = Math.sin(heading);
                const cos = Math.cos(heading);
                const vel = 240 + Math.random() * 20;
                const dist = Math.random() * 6;

                const smoke = new FireParticle({
                    x: position.x - tank.model.matrix.sin * 10 + sin * dist,
                    y: position.y + tank.model.matrix.cos * 10 + cos * dist,
                    dx: velocity.x + sin * vel,
                    dy: velocity.y + cos * vel,
                    width: 4,
                    height: 4,
                    scaling: 1.5,
                    decelerating: 0.95,
                    lifetime: 0.4 + Math.random() * 0.1,
                });
                this.tank.world.particles.push(smoke)
            }
            this.queue -= 1
        }
    }
}

ClientTankEffect.associate(TankFireEffectModel, ClientTankFireEffect)

export default ClientTankFireEffect;