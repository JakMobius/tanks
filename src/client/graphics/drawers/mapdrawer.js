
const Sprite = require("../../sprite")
const TextureProgram = require("../../graphics/programs/textureprogram")

class MapDrawer {

    static registerBlockLoader(id, drawer) {
        this.RegisteredDrawers.set(id, drawer)
    }
    static RegisteredDrawers = new Map()

    constructor(camera, ctx) {
        this.camera = camera
        this.ctx = ctx

        this.program = new TextureProgram("map-drawer-program", ctx, {
            largeIndices: true
        })
        this.reset()
    }

    reset() {
        this.oldBounds = {
            x0: 0,
            x1: 0,
            y0: 0,
            y1: 0
        }
    }

    draw(map) {
        const scale = this.camera.scale;

        let mipmaplevel =  Math.ceil(1 / scale) - 1
        let oldmipmaplevel = Sprite.mipmaplevel
        if(mipmaplevel >= Sprite.mipmapimages.length) {
            mipmaplevel = Sprite.mipmapimages.length - 1
        }
        if(mipmaplevel !== oldmipmaplevel) {
            Sprite.setMipMapLevel(mipmaplevel)
        }

        const visibleWidth = this.camera.viewport.x / scale;
        const visibleHeight = this.camera.viewport.y / scale;

        const cx = this.camera.position.x + this.camera.shaking.x
        const cy = this.camera.position.y + this.camera.shaking.y

        let x0 = cx - visibleWidth / 2, y0 = cy - visibleHeight / 2;
        let x1 = x0 + visibleWidth, y1 = y0 + visibleHeight;

        const maxWidth = map.width * 20;
        const maxHeight = map.height * 20;

        x0 = Math.floor(Math.max(0, x0) / 20)
        y0 = Math.floor(Math.max(0, y0) / 20)
        x1 = Math.ceil(Math.min(maxWidth, x1) / 20)
        y1 = Math.ceil(Math.min(maxHeight, y1) / 20)

        if(x0 !== this.oldBounds.x0 || x1 !== this.oldBounds.x1 ||
            y0 !== this.oldBounds.y0 || y1 !== this.oldBounds.y1 || mipmaplevel !== oldmipmaplevel) {

            this.oldBounds.x0 = x0
            this.oldBounds.x1 = x1
            this.oldBounds.y0 = y0
            this.oldBounds.y1 = y1

            this.program.prepare()
            this.program.use(this.ctx)
            Sprite.setGLMipMapLevel(this.ctx, this.program.textureUniform, mipmaplevel)
            this.program.matrixUniform.setMatrix(this.camera.matrix.m)

            for(let x = x0; x <= x1; x ++) {
                for(let y = y0; y <= y1; y++) {
                    const block = map.getBlock(x, y);

                    if(block) this.drawBlock(block, x, y, map)
                }
            }

            this.program.draw()
        } else {
            this.program.prepare(false)
            this.program.use(this.ctx)
            this.program.matrixUniform.setMatrix(this.camera.matrix.m)
            Sprite.setGLMipMapLevel(this.ctx, this.program.textureUniform, mipmaplevel)
            this.program.draw(false)
        }

        if(mipmaplevel !== oldmipmaplevel) {
            Sprite.setMipMapLevel(oldmipmaplevel)
        }
    }

    drawBlock(block, x, y, map) {
        let id = block.constructor.typeId

        if(id === 0) return

        let drawer = MapDrawer.RegisteredDrawers.get(id)

        if(drawer) {
            drawer.draw(this.program, x, y, block, map)
        }
    }
}

module.exports = MapDrawer