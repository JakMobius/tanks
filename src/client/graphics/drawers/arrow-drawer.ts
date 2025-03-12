import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import LineDrawer from "./line-drawer";

export interface ArrowParameters {
    start: { x: number, y: number },
    end: { x: number, y: number }
    headLength: number,
    headWidth: number,
    color: number,
    thickness: number
}

export default class ArrowDrawer {

    static drawArrow(phase: DrawPhase, parameters: ArrowParameters) {
        let dx = parameters.end.x - parameters.start.x
        let dy = parameters.end.y - parameters.start.y

        let length = Math.sqrt(dx * dx + dy * dy)

        let lateralDx = dy / length * parameters.headWidth
        let lateralDy = -dx / length * parameters.headWidth
        
        let headDistanceFraction = (length - parameters.headLength) / length

        let headBaseX = parameters.start.x + dx * headDistanceFraction
        let headBaseY = parameters.start.y + dy * headDistanceFraction

        let headLeftX = headBaseX + lateralDx
        let headLeftY = headBaseY + lateralDy

        let headRightX = headBaseX - lateralDx
        let headRightY = headBaseY - lateralDy

        LineDrawer.drawLine(phase, parameters.start.x, parameters.start.y, parameters.end.x, parameters.end.y, parameters.color, parameters.thickness)
        LineDrawer.drawLine(phase, headLeftX, headLeftY, parameters.end.x, parameters.end.y, parameters.color, parameters.thickness)
        LineDrawer.drawLine(phase, headRightX, headRightY, parameters.end.x, parameters.end.y, parameters.color, parameters.thickness)
    }
}