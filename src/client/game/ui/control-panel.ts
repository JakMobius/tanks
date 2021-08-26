import Vidget from "../../controls/interact/vidget";
import {Touch} from "../../controls/interact/touch-controller";

class ControlPanel {
	public vidgets: Vidget[] = []

    constructor() {

    }

    addVidget(vidget: Vidget) {
        this.vidgets.push(vidget)
    }

    draw(ctx: WebGLRenderingContext, dt: number) {

        this.vidgets.forEach(function(vidget: Vidget){
            if(vidget.hidden) return

            //ctx.translate(vidget.x, vidget.y)

            vidget.draw(ctx, dt)

            //ctx.translate(-vidget.x, -vidget.y)
        })

    }

    captureTouch(touch: Touch) {
        let x = touch.left
        let y = touch.top

        for(let i = 0, l = this.vidgets.length; i < l; i++) {
            let vidget = this.vidgets[i]

            if(vidget.touched) {
                vidget.touchEnded()
            }
            if(x < vidget.x || x > vidget.x + vidget.width) continue
            if(y < vidget.y || y > vidget.y + vidget.height) continue

            vidget.touchStarted(x - vidget.x, y - vidget.y)
            vidget.touched = true
            touch.vidget = vidget
            touch.captured = this
            return true
        }
        return false
    }

    touchEnded(touch: Touch) {
        if(touch.vidget) {
            touch.vidget.touchEnded()
            touch.vidget.touched = false
        }
    }

    touchMoved(touch: Touch) {

        let vidget = touch.vidget

        if(vidget) {
            let y = touch.top - vidget.y
            let x = touch.left - vidget.x

            vidget.touchMoved(x, y)
        }
    }
}

export default ControlPanel;