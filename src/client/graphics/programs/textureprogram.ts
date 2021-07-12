/* @load-resource: '../shaders/fragment/texture-fragment.glsl' */
/* @load-resource: '../shaders/vertex/texture-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Sprite from "../../sprite";
import Matrix3 from "../matrix3";
import {ByteArray} from "../../../serialization/binary/buffer";
import {Constructor} from "../../../serialization/binary/serializable";
import Uniform from "../uniform";

export interface TextureProgramConfig {
    largeIndices: boolean
}

class TextureProgram extends Program {
	public indexBufferType: number
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<ByteArray>;
	public vertexPositionAttribute: number;
	public texturePositionAttribute: number;
	public textureUniform: Uniform;
	public matrixUniform: Uniform;
	public vertexLength: number;
	public textures: number;
	public transform: Matrix3;

    constructor(name: string, ctx: WebGLRenderingContext, options?: TextureProgramConfig) {
        options = Object.assign({
            largeIndices: false
        }, options)

        let vertexShader = new Shader("src/client/graphics/shaders/vertex/texture-vertex.glsl", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("src/client/graphics/shaders/fragment/texture-fragment.glsl", Shader.FRAGMENT).compile(ctx)
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
            clazz: Float32Array,
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW,
            capacity: options.largeIndices ? 16384 : 128
        }).createBuffer()

        this.indexBuffer = new GLBuffer<ByteArray>({
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
        this.transform = null
    }

    setTransform(transform: Matrix3) {
        this.transform = transform
    }

    drawTexture(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, sx: number, sy: number, sw: number, sh: number) {
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

    tightenTexture(sprite: Sprite, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
        let r = sprite.rect
        this.drawTexture(x1, y1, x2, y2, x3, y3, x4, y4, r.x, r.y, r.w, r.h)
    }

    drawSprite(sprite: Sprite, x: number, y: number, width: number, height: number, sx?: number, sy?: number, sw?: number, sh?: number) {
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

    prepare(update: boolean = true) {
        this.vertexBuffer.bind()

        if(update === true) {
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

    draw(update: boolean = true) {
        if(update === true) {
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