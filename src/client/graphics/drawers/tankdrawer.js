
const Color = require("../../../utils/color")
const Smoke = require("../../particles/smoke")

class TankDrawer {

    /**
     * @type {ClientTank}
     */
    tank = null

    /**
     * @type {WebGLRenderingContextBase}
     */
    ctx = null

    /**
     * @param tank {ClientTank}
     * @param ctx {WebGLRenderingContextBase}
     */

    constructor(tank, ctx) {

        this.tank = tank
        // TODO перенести эту шнягу куда-то ещё
        this.smokeTicks = 0
        this.ctx = ctx
    }

    drawSmoke(dt) {

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
                size: 2,
                scaling: 50,
                color: color
            });

            this.tank.player.game.particles.push(smoke)
        }
    }

    draw(camera, dt) {}
}

module.exports = TankDrawer