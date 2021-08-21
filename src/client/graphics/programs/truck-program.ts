/* @load-resource: '../shaders/fragment/truck-fragment.glsl' */
/* @load-resource: '../shaders/vertex/truck-vertex.glsl' */

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Sprite from "../../sprite";
import CameraProgram from "./camera-program";
import {Quadrangle} from "../../../utils/quadrangle";
import WorldDrawer from "../drawers/world-drawer";

export const vertexShaderPath = "src/client/graphics/shaders/vertex/truck-vertex.glsl"
export const fragmentShaderPath = "src/client/graphics/shaders/fragment/truck-fragment.glsl"

export default class TruckProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint16Array>;
	public trucks: number;

    constructor(ctx: WebGLRenderingContext) {

        let vertexShader = new Shader(vertexShaderPath, Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader(fragmentShaderPath, Shader.FRAGMENT).compile(ctx)
        super(vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx

        this.matrixUniform = this.getUniform("u_matrix")

        this.indexBuffer = new GLBuffer({
            clazz: Uint16Array,
            gl: ctx,
            bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
            drawMode: this.ctx.DYNAMIC_DRAW
        }).createBuffer()

        this.vertexBuffer = this.registerBuffer(
            new GLBuffer<Float32Array>({
                gl: ctx,
                clazz: Float32Array,
                drawMode: this.ctx.DYNAMIC_DRAW
            }).createBuffer(),
            [
                { name: "a_vertex_position", size: 3 },
                { name: "a_truck_position",  size: 2 },
                { name: "a_truck_distance",  size: 1 },
                { name: "a_radius",          size: 1 },
                { name: "a_truck_texture",   size: 4 },
                { name: "a_truck_length",    size: 1 },
            ]
        ).glBuffer

        this.trucks = 0
    }

    drawTruck(quadrangle: Quadrangle, distance: number, radius: number, texture: Sprite, lengthInTextures: number, speedCoefficient: number, z?: number) {

        if(z === undefined) z = WorldDrawer.depths.tankTrack

        distance = -((distance * speedCoefficient) % lengthInTextures)

        const r = texture.rect

        // vertexPosition, truckPosition, truckDistance, radius, truckTexture, truckLength

        this.vertexBuffer.appendArray([
            quadrangle.x1, quadrangle.y1, z, 1, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x2, quadrangle.y2, z, 1, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x3, quadrangle.y3, z, 0, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            quadrangle.x4, quadrangle.y4, z, 0, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
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

        this.enableAttributes()
        this.setVertexAttributePointers()

        this.ctx.disable(this.ctx.BLEND)
    }

    draw() {
        this.ctx.enable(this.ctx.BLEND)
        
        if(this.indexBuffer.pointer !== 0) {
            this.ctx.enable(this.ctx.DEPTH_TEST)
            this.ctx.disable(this.ctx.BLEND)

            this.indexBuffer.sendDataToGPU()
            this.vertexBuffer.sendDataToGPU()

            this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
        }

        this.disableAttributes()

        this.trucks = 0
    }
}