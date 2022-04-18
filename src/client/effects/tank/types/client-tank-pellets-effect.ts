import ClientTankEffect from '../client-tank-effect';
import Pellet from 'src/client/particles/pellet-particle'
import Color from 'src/utils/color';
import EffectModel from 'src/effects/effect-model';
import TankPelletsEffectModel from 'src/effects/tank/models/tank-pellets-effect-model';
import ClientPlayer from "../../../client-player";
import PhysicalComponent from "../../../../entity/physics-component";
import TransformComponent from "../../../../entity/transform-component";

export default class ClientTankPelletsEffect extends ClientTankEffect {
	public player: ClientPlayer;
	public game: any;

    static Model: typeof EffectModel = TankPelletsEffectModel

    start(player: ClientPlayer) {
        this.player = player
    }

    draw(ctx: WebGLRenderingContext) {
        const game = this.game;
        const player = this.player;

        const tank = player.tank;
        const body = tank.model.getComponent(PhysicalComponent).getBody()
        const transform = this.tank.model.getComponent(TransformComponent).transform

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
                dx: (tankVelocity.x + sin * vel) / game.tps,
                dy: (tankVelocity.y + cos * vel) / game.tps,
                lifetime: 150,
                color: new Color(50, 50, 50)
            });
            game.particles.push(pellet)
        }
    }
}