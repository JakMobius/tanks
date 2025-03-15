import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program"
import DrawPhase from "./draw-phase"
import LineDrawer from "./line-drawer"

export interface CircleParameters {
    radius: number,
    strokeColor?: number,
    fillColor?: number,
    strokeWidth?: number,
    steps?: number,
    startAngle?: number,
    endAngle?: number,
}

export default class CircleDrawer {
    static drawCircle(phase: DrawPhase, x: number, y: number, parameters: CircleParameters) {
        const steps = parameters.steps ?? 24

        const startAngle = parameters.startAngle ?? 0
        const endAngle = parameters.endAngle ?? Math.PI * 2

        let shape: number[] = []
        const dPhi = (endAngle - startAngle) / (steps - 1)

        for(let angle = startAngle, i = 0; i < steps; angle += dPhi, i++) {
            const currentX = Math.cos(angle) * parameters.radius + x
            const currentY = Math.sin(angle) * parameters.radius + y
            
            shape.push(currentX)
            shape.push(currentY)
        }

        if(parameters.fillColor) {
            let program = phase.getProgram(ConvexShapeProgram)
            program.drawConvexShape(shape, parameters.fillColor)
        }

        if(parameters.strokeColor && parameters.strokeWidth) {
            LineDrawer.strokeShape(phase, shape, parameters.strokeColor, parameters.strokeWidth, false)
        }
    }
}