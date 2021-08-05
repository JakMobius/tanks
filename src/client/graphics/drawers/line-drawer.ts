
import DrawPhase from "./draw-phase";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";

export default class LineDrawer {

    static drawLine(phase: DrawPhase, aX: number, aY: number, bX: number, bY: number, color: number, thickness: number) {
        let program = phase.getProgram(ConvexShapeProgram)
        let dx = bX - aX
        let dy = bY - aY

        let length = Math.sqrt(dx * dx + dy * dy)
        dx *= thickness / length / 2
        dy *= thickness / length / 2

        program.drawConvexShape([
            aX - dy, aY + dx,
            bX - dy, bY + dx,
            bX + dy, bY - dx,
            aX + dy, aY - dx
        ], color)
    }

    static strokeShape(phase: DrawPhase, vertices: number[], color: number, thickness: number, close: boolean = false) {
        for(let i = 2; i <= vertices.length; i += 2) {
            let oldX = vertices[i - 2]
            let oldY = vertices[i - 1]
            let currentX
            let currentY

            if(i == vertices.length) {
                if(!close) break;
                currentX = vertices[0]
                currentY = vertices[1]
            } else {
                currentX = vertices[i]
                currentY = vertices[i + 1]
            }

            this.drawLine(phase, oldX, oldY, currentX, currentY, color, thickness)
        }
    }
}