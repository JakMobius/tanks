/* @load-resource: '../shaders/fragment/truck-fragment.glsl' */
/* @load-resource: '../shaders/vertex/truck-vertex.glsl' */

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Uniform from "../uniform";
import Sprite from "../../sprite";
import CameraProgram from "./camera-program";
import {Quadrangle} from "../../../utils/quadrangle";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/truck-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/truck-fragment.glsl"

export default class TruckProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint16Array>;
	public vertexPositionAttribute: number;
	public truckPositionAttribute: number;
	public truckDistanceAttribute: number;
	public truckTextureAttribute: number;
	public truckLengthAttribute: number;
	public radiusAttribute: number;
	public textureAttribute: number;
	public vertexLength: number;
	public trucks: number;

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

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
        this.truckPositionAttribute = this.getAttribute("a_truck_position");
        this.truckDistanceAttribute = this.getAttribute("a_truck_distance");
        this.truckTextureAttribute = this.getAttribute("a_truck_texture")
        this.truckLengthAttribute = this.getAttribute("a_truck_length")
        this.radiusAttribute = this.getAttribute("a_radius")
        this.textureAttribute = this.getAttribute("a_texture")

        this.matrixUniform = this.getUniform("u_matrix")

        this.vertexLength = 11
        this.trucks = 0
    }

    drawTruck(quadrangle: Quadrangle, distance: number, radius: number, texture: Sprite, lengthInTextures: number, speedCoefficient: number) {

        distance = -((distance * speedCoefficient) % lengthInTextures)

        const r = texture.rect

        // vertexPosition, truckPosition, truckDistance, radius, truckTexture, truckLength

        this.vertexBuffer.appendArray([
            quadrangle.x1, quadrangle.y1, 1, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x2, quadrangle.y2, 1, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x3, quadrangle.y3, 0, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x4, quadrangle.y4, 0, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
        ])

        const baseIndex = this.trucks * 4

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.trucks++
    }

    reset() {
        this.indexBuffer.reset()
        this.vertexBuffer.reset()
    }

    bind() {
        super.bind()
        this.vertexBuffer.bind()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.enableVertexAttribArray(this.truckPositionAttribute);
        this.ctx.enableVertexAttribArray(this.truckDistanceAttribute);
        this.ctx.enableVertexAttribArray(this.radiusAttribute);
        this.ctx.enableVertexAttribArray(this.truckTextureAttribute);
        this.ctx.enableVertexAttribArray(this.truckPositionAttribute);
        this.ctx.enableVertexAttribArray(this.truckLengthAttribute)

        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
        this.ctx.vertexAttribPointer(this.truckPositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
        this.ctx.vertexAttribPointer(this.truckDistanceAttribute, 1, this.ctx.FLOAT, false, stride, 16);
        this.ctx.vertexAttribPointer(this.radiusAttribute, 1, this.ctx.FLOAT, false, stride, 20);
        this.ctx.vertexAttribPointer(this.truckTextureAttribute, 4, this.ctx.FLOAT, false, stride, 24);
        this.ctx.vertexAttribPointer(this.truckLengthAttribute, 1, this.ctx.FLOAT, false, stride, 40);
        this.ctx.disable(this.ctx.BLEND)
    }

    draw() {
        this.ctx.enable(this.ctx.BLEND)
        
        if(this.indexBuffer.pointer !== 0) {
            this.indexBuffer.updateData()
            this.vertexBuffer.updateData()

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
        }

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.truckPositionAttribute);
        this.ctx.disableVertexAttribArray(this.truckDistanceAttribute);
        this.ctx.disableVertexAttribArray(this.radiusAttribute);
        this.ctx.disableVertexAttribArray(this.truckTextureAttribute);
        this.ctx.disableVertexAttribArray(this.truckPositionAttribute);

        this.trucks = 0
    }
}