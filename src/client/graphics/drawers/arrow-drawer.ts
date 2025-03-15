import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import LineDrawer from "./line-drawer";

export enum ArrowEndStyle {
    arrow,
    triangle,
    square,
}

export interface ArrowParameters {
    start: { x: number, y: number },
    end: { x: number, y: number }
    headLength: number,
    headWidth: number,
    strokeColor?: number,
    fillColor?: number,
    strokeWidth?: number,
    endStyle?: ArrowEndStyle
}

export default class ArrowDrawer {

    static drawArrow(phase: DrawPhase, parameters: ArrowParameters) {
        let endStyle = parameters.endStyle ?? ArrowEndStyle.arrow

        let dx = parameters.end.x - parameters.start.x
        let dy = parameters.end.y - parameters.start.y

        let length = Math.sqrt(dx * dx + dy * dy)

        dx /= length
        dy /= length

        let lateralDx = dy * parameters.headWidth / 2
        let lateralDy = -dx * parameters.headWidth / 2
        
        let headDistanceFraction = length - parameters.headLength

        let headBaseX = parameters.start.x + dx * headDistanceFraction
        let headBaseY = parameters.start.y + dy * headDistanceFraction

        let headLeftX = headBaseX + lateralDx
        let headLeftY = headBaseY + lateralDy

        let headRightX = headBaseX - lateralDx
        let headRightY = headBaseY - lateralDy

        let tailLeftX = parameters.end.x + lateralDx
        let tailLeftY = parameters.end.y + lateralDy

        let tailRightX = parameters.end.x - lateralDx
        let tailRightY = parameters.end.y - lateralDy

        let lineEndX = parameters.end.x
        let lineEndY = parameters.end.y
        
        if(parameters.fillColor) {
            let program = phase.getProgram(ConvexShapeProgram)
            if(endStyle === ArrowEndStyle.square) {
                program.drawConvexShape([
                    headLeftX, headLeftY,
                    headRightX, headRightY,
                    tailRightX, tailRightY,
                    tailLeftX, tailLeftY
                ], parameters.fillColor)
            } else {
                program.drawConvexShape([
                    headLeftX, headLeftY,
                    headRightX, headRightY,
                    parameters.end.x, parameters.end.y
                ], parameters.fillColor)
            }

        }

        if(endStyle !== ArrowEndStyle.arrow) {
            lineEndX = parameters.start.x + dx * headDistanceFraction
            lineEndY = parameters.start.y + dy * headDistanceFraction
            if(parameters.strokeColor && parameters.strokeWidth) {
                LineDrawer.drawLine(phase, headLeftX, headLeftY, headRightX, headRightY, parameters.strokeColor, parameters.strokeWidth)
            }
        }
        
        if(parameters.strokeColor && parameters.strokeWidth) {
            LineDrawer.drawLine(phase, parameters.start.x, parameters.start.y, lineEndX, lineEndY, parameters.strokeColor, parameters.strokeWidth)

            if(endStyle === ArrowEndStyle.square) {
                LineDrawer.drawLine(phase, headLeftX, headLeftY, tailLeftX, tailLeftY, parameters.strokeColor, parameters.strokeWidth)
                LineDrawer.drawLine(phase, headRightX, headRightY, tailRightX, tailRightY, parameters.strokeColor, parameters.strokeWidth)
                LineDrawer.drawLine(phase, tailLeftX, tailLeftY, tailRightX, tailRightY, parameters.strokeColor, parameters.strokeWidth)
            } else {
                LineDrawer.drawLine(phase, headLeftX, headLeftY, parameters.end.x, parameters.end.y, parameters.strokeColor, parameters.strokeWidth)
                LineDrawer.drawLine(phase, headRightX, headRightY, parameters.end.x, parameters.end.y, parameters.strokeColor, parameters.strokeWidth)
            }
        }
    }
}