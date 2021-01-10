
import EntityDrawer from './entitydrawer';
import Sprite from '../../sprite';
import Matrix3 from '../matrix3';
import ClientEntity from "../../entity/cliententity";
import RotationalMatrix from "../../../utils/rotationalmatrix";
import Program from "../program";
import TextureProgram from "../programs/textureprogram";

class BasicEntityDrawer extends EntityDrawer {
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

    drawSprite(sprite: Sprite, width: number, height: number, program: TextureProgram) {
        const x = this.entity.model.x
        const y = this.entity.model.y
        const w = width / 6
        const h = height / 6

        this.matrix.reset()
        this.matrix.translate(x, y)
        this.matrix.rotate(-this.entity.model.rotation)

        program.setTransform(this.matrix)
        program.drawSprite(sprite, -w/2, -h/2, w, h)
        program.setTransform(null)
    }
}

export default BasicEntityDrawer;