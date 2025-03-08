
import * as Box2D from "@box2d/core";

export class b2ScaledPolygonShape extends Box2D.b2PolygonShape {
    scale = new Box2D.b2Vec2(1, 1)
    originalVertices: Box2D.XY[]
    originalCount: number
    originalCentroid = new Box2D.b2Vec2()
    originalNormals: Box2D.XY[]

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
        this.scale
        this.updateOriginal()
        return this
    }

    SetHull(hull: Readonly<Box2D.b2Hull>, count: number): Box2D.b2PolygonShape {
        let result = super.SetHull(hull, count)
        if(!result) return null
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
        this.originalCentroid.Copy(this.m_centroid)
        this.originalNormals = this.m_normals.map(v => v.Clone())
        this.SetScale(this.scale)
    }

    SetScale(scale: Box2D.XY) {
        this.scale.Set(scale.x, scale.y)
        
        for(let i = 0; i < this.originalCount; i++) {
            this.m_vertices[i].Set(this.originalVertices[i].x * scale.x, this.originalVertices[i].y * scale.y)
        }

        for(let i = 0; i < this.originalCount; i++) {
            this.m_normals[i].Set(this.originalNormals[i].x * scale.x, this.originalNormals[i].y * scale.y)
            this.m_normals[i].Normalize()
        }

        this.m_centroid.Set(this.originalCentroid.x * scale.x, this.originalCentroid.y * scale.y)
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
        this.SetScale(this.scale)
        return this
    }

    SetScale(scale: Box2D.XY) {
        this.scale.Set(scale.x, scale.y)
        this.m_p.Set(this.originalPosition.x * scale.x, this.originalPosition.y * scale.y)
        this.m_radius = this.originalRadius * Math.max(scale.x, scale.y)
    }
}

// TODO: Implement b2ScaledEdgeShape and b2ScaledChainShape