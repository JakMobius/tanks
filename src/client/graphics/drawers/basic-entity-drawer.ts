import EntityDrawer from './entity-drawer';
import Sprite from 'src/client/graphics/sprite';
import TextureProgram from "../programs/texture-program";
import DrawPhase from "./draw-phase";
import {squareQuadrangle, transformQuadrangle} from "src/utils/quadrangle";
import TransformComponent from "src/entity/components/transform-component";

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

    drawSprite(sprite: Sprite, width: number, height: number, phase: DrawPhase, z: number = 1) {
        let program = phase.getProgram(TextureProgram)
        this.drawSpriteWithProgram(sprite, width, height, program, z)
    }

    drawSpriteWithProgram(sprite: Sprite, width: number, height: number, program: TextureProgram, z: number = 1) {
        const transform = this.entity.getComponent(TransformComponent)

        const quadrangle = squareQuadrangle(-width / 2, -height / 2, width, height)
        transformQuadrangle(quadrangle, transform.transform)

        program.drawSprite(sprite, quadrangle, z)
    }
}