import * as Box2D from "@box2d/core"
import DrawPhase from "./draw-phase";
import { Matrix3 } from "src/utils/matrix3";
import ConvexShapeProgram from "../programs/convex-shapes/convex-shape-program";
import LineDrawer from "./line-drawer";

export default class B2DebugDraw implements Box2D.b2Draw {
    private drawPhase: DrawPhase;
    private transform = new Matrix3()

    public thickness = 0.25
    public fillAlpha = 0.5
    public strokeAlpha = 0.8

    constructor(drawPhase: DrawPhase) {
        this.drawPhase = drawPhase
    }

    private getShape(vertices: Box2D.XY[]) {
        let shape = []
        for(let point of vertices) {
            shape.push(this.transform.transformX(point.x, point.y))
            shape.push(this.transform.transformY(point.x, point.y))
        }
        return shape
    }

    private getCircleShape(x: number, y: number, radius: number) {
        let shape: number[] = []

        const maximumStepCircumference = 5
        const circumference = radius * Math.PI * 2
        const steps = Math.max(8, Math.ceil(circumference / maximumStepCircumference))
        const dPhi = Math.PI * 2 / steps

        for(let angle = 0; angle <= Math.PI * 2; angle += dPhi) {
            const currentX = Math.cos(angle) * radius + x
            const currentY = Math.sin(angle) * radius + y
            shape.push(this.transform.transformX(currentX, currentY))
            shape.push(this.transform.transformY(currentX, currentY))
        }

        return shape
    }

    private getColor(color: Box2D.RGBA, alpha: number) {
        return ConvexShapeProgram.getColor(color.r * 255, color.g * 255, color.b * 255, alpha)
    }

    DrawPolygon(vertices: Box2D.XY[], vertexCount: number, color: Box2D.RGBA) {
        if (vertices) {
            const program = this.drawPhase.getProgram(ConvexShapeProgram)
            const shape = this.getShape(vertices)
            program.drawConvexShape(shape, this.getColor(color, this.fillAlpha))
        }
    }

    DrawSolidPolygon(vertices: Box2D.XY[], vertexCount: number, color: Box2D.RGBA) {
        if (vertices) {
            const program = this.drawPhase.getProgram(ConvexShapeProgram)
            const shape = this.getShape(vertices)
            program.drawConvexShape(shape, this.getColor(color, this.fillAlpha))

            LineDrawer.strokeShape(this.drawPhase, shape, this.getColor(color, this.strokeAlpha), this.thickness, true)
        }
    }

    DrawCircle(center: Box2D.XY, radius: number, color: Box2D.RGBA) {
        const shape = this.getCircleShape(center.x, center.y, radius)
        LineDrawer.strokeShape(this.drawPhase, shape, this.getColor(color, this.strokeAlpha), this.thickness, false)
    }

    DrawSolidCircle(center: Box2D.XY, radius: number, axis: Box2D.XY, color: Box2D.RGBA) {
        const program = this.drawPhase.getProgram(ConvexShapeProgram)
        const shape = this.getCircleShape(center.x, center.y, radius)
        program.drawConvexShape(shape, this.getColor(color, this.fillAlpha))

        LineDrawer.strokeShape(this.drawPhase, shape, this.getColor(color, this.strokeAlpha), this.thickness, false)
    }

    DrawSegment(p1: Box2D.XY, p2: Box2D.XY, color: Box2D.RGBA) {
        const shape = [
            this.transform.transformX(p1.x, p1.y),
            this.transform.transformY(p1.x, p1.y),
            this.transform.transformX(p2.x, p2.y),
            this.transform.transformY(p2.x, p2.y)
        ]
        LineDrawer.strokeShape(this.drawPhase, shape, this.getColor(color, this.strokeAlpha), this.thickness, true)
    }

    DrawTransform(G: Box2D.b2Transform) {
        // TODO
    }

    DrawParticles(centers: Box2D.XY[], radius: number, colors: Box2D.RGBA[] | null, count: number): void {
        // TODO
    }

    DrawPoint(p: Box2D.XY, size: number, color: Box2D.RGBA): void {
        const program = this.drawPhase.getProgram(ConvexShapeProgram)

        program.drawConvexShape(this.getShape([
            { x: p.x - size, y: p.y - size },
            { x: p.x + size, y: p.y - size },
            { x: p.x + size, y: p.y + size },
            { x: p.x - size, y: p.y + size }
        ]), this.getColor(color, this.strokeAlpha))
    }

    PopTransform(xf: Box2D.b2Transform): void {
        this.transform.restore()
    }

    PushTransform(xf: Box2D.b2Transform): void {
        this.transform.save()
        let position = xf.GetPosition()
        let rotation = xf.GetAngle()

        this.transform.translate(position.x, position.y)
        this.transform.rotate(rotation)
    }
}

