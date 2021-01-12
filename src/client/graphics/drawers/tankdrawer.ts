
import Color from '../../../utils/color';
import Smoke from '../../particles/smoke';
import ClientTank from "../../tanks/clienttank";
import Camera from "../../camera";

 class TankDrawer {
	public smokeTicks: any;

    tank: ClientTank = null

    ctx: WebGLRenderingContextBase = null

    constructor(tank: ClientTank, ctx: WebGLRenderingContext) {

        this.tank = tank
        // TODO перенести эту шнягу куда-то ещё
        this.smokeTicks = 0
        this.ctx = ctx
    }

    drawSmoke(dt: number) {

        if(!this.tank) return
        if(!this.tank.model) return
        if(this.tank.model.health >= 7) return

        let intense = 1 - this.tank.model.health / 7

        this.smokeTicks += intense * dt

        if(this.smokeTicks > 0.2) {
            this.smokeTicks -= 0.2
            const gray = (1 - intense) * 255;

            const color = new Color(gray, gray, gray);
            const position = this.tank.model.body.GetPosition()

            const smoke = new Smoke({
                x: position.x,
                y: position.y,
                dx: (this.tank.model.matrix.sin * 5 + Math.random() - 0.5) * 15,
                dy: (-this.tank.model.matrix.cos * 5 + Math.random() - 0.5) * 15,
                width: 2,
                height: 2,
                scaling: 50,
                color: color
            });

            this.tank.player.game.particles.push(smoke)
        }
    }

    draw(camera: Camera, dt: number): void {}
}

export default TankDrawer;