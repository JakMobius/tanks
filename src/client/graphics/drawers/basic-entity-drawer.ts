
import EntityDrawer from './entity-drawer';
import Sprite from '../../sprite';
import ClientEntity from "../../entity/client-entity";
import TextureProgram from "../programs/texture-program";
import DrawPhase from "./draw-phase";
import Matrix3 from "../../../utils/matrix3";
import {squareQuadrangle, translateQuadrangle, turnQuadrangle} from "../../../utils/quadrangle";
import PhysicalComponent from "../../../entity/physics-component";

export default class BasicEntityDrawer extends EntityDrawer {
	public matrix: Matrix3;
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

    constructor(entity: ClientEntity) {
        super(entity);

        this.matrix = new Matrix3()
    }

    drawSprite(sprite: Sprite, width: number, height: number, phase: DrawPhase, z: number = 1) {
        let program = phase.getProgram(TextureProgram)
        const entityBody = this.entity.model.getComponent(PhysicalComponent).getBody()
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