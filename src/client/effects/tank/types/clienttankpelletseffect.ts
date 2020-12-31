
import ClientTankEffect from '../clienttankeffect';

//const AbstractTankPelletsEffect = require("/src/effects/tank/abstracttankpelletseffect")
import Pellet from '@/client/particles/pellet';

import Color from '@/utils/color';

class ClientTankPelletsEffect extends ClientTankEffect {
	public player: any;
	public game: any;

    start(player) {
        this.player = player
    }

    draw(ctx) {
        const game = this.game;
        const player = this.player;

        const tank = player.tank;

        for(let k = 0; k < 8; k++) {
            const angle = tank.model.rotation + (Math.random() - 0.5) * Math.PI / 4;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const vel = 500 + Math.random() * 20;
            const dist = Math.random() * 3;

            const pellet = new Pellet({
                x: tank.model.x + tank.model.matrix.sin * 2 + sin * dist,
                y: tank.model.y + tank.model.matrix.cos * 2 + cos * dist,
                dx: (tank.model.body.m_linearVelocity.x + sin * vel) / game.tps,
                dy: (tank.model.body.m_linearVelocity.y + cos * vel) / game.tps,
                lifetime: 150,
                color: new Color(50, 50, 50)
            });
            game.particles.push(pellet)
        }
    }
}

//ClientTankEffect.register(AbstractTankPelletsEffect, ClientTankPelletsEffect)
export default ClientTankPelletsEffect;