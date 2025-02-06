import * as Box2D from "@box2d/core";

export class SoundStreamPosition {
    position: Box2D.XY | null = null
    velocity: Box2D.XY = { x: 0, y: 0 }
}