/* @load-resource: '../shaders/fragment/truck-fragment.glsl' */
/* @load-resource: '../shaders/vertex/truck-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Uniform from "../uniform";
import Sprite from "../../sprite";

class TruckProgram extends Program {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint16Array>;
	public vertexPositionAttribute: number;
	public texturePositionAttribute: number;
	public truckDistanceAttribute: number;
	public truckTextureUniform: Uniform;
	public truckLengthUniform: Uniform;
	public matrixUniform: Uniform;
	public radiusUniform: Uniform;
	public textureUniform: Uniform;
	public vertexLength: number;
	public trucks: number;

    constructor(name: string, ctx: WebGLRenderingContext) {

        let vertexShader = new Shader("truck-vertex", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("truck-fragment", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
            gl: ctx,
            drawMode: this.ctx.DYNAMIC_DRAW
        }).createBuffer()

        this.indexBuffer = new GLBuffer<Uint16Array>({
            gl: ctx,
            clazz: Uint16Array,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.DYNAMIC_DRAW
        }).createBuffer()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.texturePositionAttribute = this.getAttribute("a_truck_position");
        this.truckDistanceAttribute = this.getAttribute("a_truck_distance");

        this.truckTextureUniform = this.getUniform("u_truck_texture")
        this.truckLengthUniform = this.getUniform("u_truck_length")
        this.matrixUniform = this.getUniform("u_matrix")
        this.radiusUniform = this.getUniform("u_radius")
        this.textureUniform = this.getUniform("u_texture")

        this.vertexLength = 5
        this.trucks = 0
    }

    setTruckRadius(radius: number) {
        this.radiusUniform.set1f(radius)
    }

    setTruckLength(length: number) {
        this.truckLengthUniform.set1f(length)
    }

    setSprite(sprite: Sprite) {
        this.truckTextureUniform.set4f(sprite.rect.x, sprite.rect.y, sprite.rect.w, sprite.rect.h)
    }

    drawTruck(x: number, y: number, width: number, height: number, scale: number, distance: number) {

        distance = (distance % height) / height

        this.vertexBuffer.appendArray([
            x + width, y + height, 1, 1, distance,
            x + width, y, 1, 0, distance,
            x, y + height, 0, 1, distance,
            x, y, 0, 0, distance
        ])

        const baseIndex = this.trucks * 4

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.trucks++
    }

    prepare() {
        this.indexBuffer.reset()

        this.vertexBuffer.bind()
        this.vertexBuffer.reset()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.texturePositionAttribute);
        this.ctx.enableVertexAttribArray(this.truckDistanceAttribute);

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.texturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
        this.ctx.vertexAttribPointer(this.truckDistanceAttribute, 1, this.ctx.FLOAT, false, stride, 16);
        this.ctx.disable(this.ctx.BLEND)
    }

    draw() {
        this.ctx.enable(this.ctx.BLEND)
        this.indexBuffer.updateData()
        this.vertexBuffer.updateData()

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.texturePositionAttribute);
        this.ctx.disableVertexAttribArray(this.truckDistanceAttribute);

        this.trucks = 0
    }
}

export default TruckProgram;