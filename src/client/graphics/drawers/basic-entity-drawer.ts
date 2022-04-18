import EntityDrawer from './entity-drawer';
import Sprite from '../../sprite';
import TextureProgram from "../programs/texture-program";
import DrawPhase from "./draw-phase";
import {squareQuadrangle, translateQuadrangle, turnQuadrangle} from "../../../utils/quadrangle";
import PhysicalComponent from "../../../entity/physics-component";

export default class BasicEntityDrawer extends EntityDrawer {
    static sprites: Sprite[];
    static spriteNames: string[] = []

    static getSprite(i: number): Sprite {
        if(!this.sprites) {
            Object.defineProperty(this,"sprites", {
                enumerable: false,
                value: []
            })
        }
        if(!this.sprites[i]) {
            this.sprites[i] = Sprite.named(this.spriteNames[i])
        }
        return this.sprites[i]
    }

    constructor() {
        super()
    }

    drawSprite(sprite: Sprite, width: number, height: number, phase: DrawPhase, z: number = 1) {
        let program = phase.getProgram(TextureProgram)
        const entityBody = this.entity.getComponent(PhysicalComponent).getBody()
        const entityPosition = entityBody.GetPosition()
        const entityAngle = entityBody.GetAngle()
        const sine = Math.sin(entityAngle)
        const cos = Math.cos(entityAngle)

        const quadrangle = squareQuadrangle(-width / 2, -height / 2, width, height)
        turnQuadrangle(quadrangle, sine, cos)
        translateQuadrangle(quadrangle, entityPosition.x, entityPosition.y)

        program.drawSprite(sprite, quadrangle, z)
    }
}