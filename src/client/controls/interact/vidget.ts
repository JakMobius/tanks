
import { Touch } from "./touchcontroller";

export default class Vidget {
    id: number
    hidden: boolean
    touched: boolean;
    x: number
    y: number
    width: number
    height: number

    touchStarted(x: number, y: number) {

    }

    touchMoved(x: number, y: number) {

    }

    touchEnded() {

    }

    draw(ctx: WebGLRenderingContext, dt: number) {

    }
}