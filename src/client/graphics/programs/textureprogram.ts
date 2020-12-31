/* @load-resource: '../shaders/fragment/texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/texture-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';

class TextureProgram extends Program {
	public indexBufferType: any;
	public vertexBuffer: any;
	public indexBuffer: any;
	public vertexPositionAttribute: any;
	public texturePositionAttribute: any;
	public textureUniform: any;
	public matrixUniform: any;
	public vertexLength: any;
	public textures: any;
	public transform: any;

    constructor(name, ctx, options?) {
        options = Object.assign({
            largeIndices: false
        }, options)

        let vertexShader = new Shader("texture-vertex", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("texture-fragment", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        if(options.largeIndices) {
            let uintsForIndices = ctx.getExtension("OES_element_index_uint");
            if(!uintsForIndices) {
                throw new Error("No WebGL Extension: OES_element_index_uint. Please, update the browser.")
            }
        }

        const arrayType = options.largeIndices ? Uint32Array : Uint16Array
        this.indexBufferType = options.largeIndices ? ctx.UNSIGNED_INT : ctx.UNSIGNED_SHORT

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128 // Rare reallocation
        }).createBuffer()

        this.indexBuffer = new GLBuffer({
            gl: ctx,
            clazz: arrayType,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128 // As well
        }).createBuffer()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.texturePositionAttribute = this.getAttribute("a_texture_position");
        this.textureUniform = this.getUniform("u_texture")

        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 4

        this.textures = 0

        /**
         * @type {Matrix3}
         */
        this.transform = null
    }

    setTransform(transform) {
        this.transform = transform
    }

    drawTexture(x1, y1, x2, y2, x3, y3, x4, y4, sx, sy, sw, sh) {
        if(this.transform) {
            /*
                Not using arrays/objects here because it will lead to
                allocation/garbage collector overhead. These functions
                will probably get inlined
             */

            let a, b

            x1 = this.transform.transformX((a = x1), (b = y1))
            y1 = this.transform.transformY(a, b)
            x2 = this.transform.transformX((a = x2), (b = y2))
            y2 = this.transform.transformY(a, b)
            x3 = this.transform.transformX((a = x3), (b = y3))
            y3 = this.transform.transformY(a, b)
            x4 = this.transform.transformX((a = x4), (b = y4))
            y4 = this.transform.transformY(a, b)
        }

        this.vertexBuffer.appendArray([
            x1, y1, sx, sy,
            x2, y2, sx + sw, sy,
            x3, y3, sx, sy + sh,
            x4, y4, sx + sw, sy + sh,
        ])

        const baseIndex = this.textures * 4

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.textures ++
    }

    tightenTexture(sprite, x1, y1, x2, y2, x3, y3, x4, y4) {
        let r = sprite.rect
        this.drawTexture(x1, y1, x2, y2, x3, y3, x4, y4, r.x, r.y, r.w, r.h)
    }

    drawSprite(sprite, x, y, width, height, sx, sy, sw, sh) {
        const r = sprite.rect;

        if (sx === undefined) sx = r.x
        else sx += r.x

        if (sy === undefined) sy = r.y
        else sy += r.y

        if (sw === undefined) sw = r.w
        if (sh === undefined) sh = r.h

        this.drawTexture(
            x, y,
            x + width, y,
            x, y + height,
            x + width, y + height,
            sx, sy, sw, sh
        )
    }

    prepare(update) {
        this.vertexBuffer.bind()

        if(update === true || update === undefined) {
            this.indexBuffer.reset()
            this.vertexBuffer.reset()
        }

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.texturePositionAttribute);

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.texturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
    }

    draw(update) {
        if(update === true || update === undefined) {
            this.indexBuffer.updateData()
            this.vertexBuffer.updateData()
        } else {
            this.indexBuffer.bind()
        }

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBufferType, 0);

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.texturePositionAttribute);

        this.textures = 0
    }
}

export default TextureProgram;