
import * as Box2D from "@box2d/core";

export class b2ScaledPolygonShape extends Box2D.b2PolygonShape {
    scale = new Box2D.b2Vec2(1, 1)
    originalVertices: Box2D.b2Vec2[]
    originalCount: number

    /*
    Set(vertices: Box2D.XY[], count: number): Box2D.b2PolygonShape {
        // Set() uses SetHull() inside anyways.
        // https://github.com/Lusito/box2d.ts/blob/9dc8ba553a97b4d299e95e417d43d1caa71c4131/packages/core/src/collision/b2_polygon_shape.ts#L179
        super.Set(vertices, count)
    }
    */

    Clone(): b2ScaledPolygonShape {
        return new b2ScaledPolygonShape().Copy(this)
    }

    Copy(other: b2ScaledPolygonShape): b2ScaledPolygonShape {
        let result = super.Copy(other)
        if(!result) return null
        this.scale.Copy(other.scale)
        this.updateOriginal()
        return this
    }

    SetHull(hull: Readonly<Box2D.b2Hull>, count: number): Box2D.b2PolygonShape {
        let result = super.SetHull(hull, count)
        if(!result) return this
        this.updateOriginal()
        return this
    }

    SetAsBox(hx: number, hy: number, center?: Box2D.XY, angle?: number): Box2D.b2PolygonShape {
        let result = super.SetAsBox(hx, hy, center, angle)
        if(!result) return null
        this.updateOriginal()
        return this
    }

    private updateOriginal() {
        this.originalVertices = this.m_vertices.map(v => v.Clone())
        this.originalCount = this.m_count
        this.SetScale(this.scale, true)
    }

    SetScale(scale: Box2D.XY, force = false) {
        if(!force && this.scale.x === scale.x && this.scale.y === scale.y) return
        this.scale.Set(scale.x, scale.y)

        let scaled = this.originalVertices.map(v => {
            let result = v.Clone()
            result.Set(result.x * scale.x, result.y * scale.y)
            return result
        })
        super.SetHull(scaled, this.originalCount)
    }
}

export class b2ScaledCircleShape extends Box2D.b2CircleShape {
    scale = new Box2D.b2Vec2(1, 1)
    originalPosition = new Box2D.b2Vec2()
    originalRadius: number

    Clone(): b2ScaledCircleShape {
        return new b2ScaledCircleShape().Copy(this)
    }

    Copy(other: b2ScaledCircleShape): b2ScaledCircleShape {
        let result = super.Copy(other)
        if(!result) return null
        this.scale.Set(other.scale.x, other.scale.y)
        return this
    }

    Set(position: Box2D.XY, radius: number = this.originalRadius): this {
        this.m_p.Set(position.x, position.y)
        this.originalRadius = radius
        this.SetScale(this.scale, true)
        return this
    }

    SetScale(scale: Box2D.XY, force = false) {
        if(!force && this.scale.x === scale.x && this.scale.y === scale.y) return
        this.scale.Set(scale.x, scale.y)
        this.m_p.Set(this.originalPosition.x * scale.x, this.originalPosition.y * scale.y)
        this.m_radius = this.originalRadius * Math.max(scale.x, scale.y)
    }
}

// TODO: Implement b2ScaledEdgeShape and b2ScaledChainShape