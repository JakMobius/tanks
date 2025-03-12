import { Component } from "src/utils/ecs/component"
import Entity from "src/utils/ecs/entity"
import * as Box2D from "@box2d/core"

export class EditorOutlineBoundsComponent implements Component {
    entity?: Entity
    vertices?: Box2D.XY[] = null

    static defaultVertices = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 } 
    ]
    
    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    setBox(x0: number, y0: number, width: number, height: number) {
        this.vertices = [
            { x: x0, y: y0 },
            { x: x0 + width, y: y0 },
            { x: x0 + width, y: y0 + height },
            { x: x0, y: y0 + height } 
        ]
    }

    static getOutline(entity: Entity) {
        return entity.getComponent(EditorOutlineBoundsComponent)?.vertices ?? EditorOutlineBoundsComponent.defaultVertices
    }
}