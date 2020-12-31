
import EntityDrawer from './entitydrawer';
import Sprite from '../../sprite';
import Matrix3 from '../matrix3';

class BasicEntityDrawer extends EntityDrawer {
	public sprites: any;
	public spriteNames: any;
	public matrix: any;
    static spriteNames = []

    static getSprite(i) {
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

    constructor(entity) {
        super(entity);

        this.matrix = new Matrix3()
    }

    drawSprite(sprite, width, height, program) {
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