import * as Box2D from "src/library/box2d";

export class SoundStreamPosition {
    position: Box2D.XY | null = null
    velocity: Box2D.XY = { x: 0, y: 0 }
}