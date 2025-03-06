import GLBuffer from 'src/client/graphics/gl/glbuffer';
import Sprite from "src/client/graphics/sprite";
import CameraProgram from "./camera-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

import vertexShaderSource from "src/client/graphics/shaders/vertex/truck-vertex.glsl"
import fragmentShaderSource from "src/client/graphics/shaders/fragment/truck-fragment.glsl"
import { Matrix3 } from 'src/utils/matrix3';
import { copyQuadrangle, Quadrangle, transformQuadrangle } from 'src/utils/quadrangle';

export default class TruckProgram extends CameraProgram {
	public vertexBuffer: GLBuffer<Float32Array>;
	public indexBuffer: GLBuffer<Uint16Array>;
	public vertices: number;
    public transform = new Matrix3()

    constructor(ctx: WebGLRenderingContext) {

        super(vertexShaderSource, fragmentShaderSource, ctx)

        this.vertexBuffer = this.createVertexArrayBuffer({
            clazz: Float32Array,
            drawMode: this.ctx.DYNAMIC_DRAW,
            attributes: this.createVertexArrayAttributes([
                { name: "a_vertex_position", size: 3 },
                { name: "a_truck_position",  size: 2 },
                { name: "a_truck_distance",  size: 1 },
                { name: "a_radius",          size: 1 },
                { name: "a_truck_texture",   size: 4 },
                { name: "a_truck_length",    size: 1 }
            ])
        })

        this.indexBuffer = this.createIndexBuffer(Uint16Array)
    }

    drawTruck(quadrangle: Quadrangle, distance: number, radius: number, texture: Sprite, lengthInTextures: number, speedCoefficient: number, z?: number) {

        if(z === undefined) z = WorldDrawerComponent.depths.tankTrack

        distance = -((distance * speedCoefficient) % lengthInTextures)

        const r = texture.rect

        const copy = copyQuadrangle(quadrangle)
        transformQuadrangle(copy, this.transform)

        this.vertexBuffer.appendArray([
            copy.x1, copy.y1, z, 1, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            copy.x2, copy.y2, z, 1, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            copy.x3, copy.y3, z, 0, 1, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
            copy.x4, copy.y4, z, 0, 0, distance, radius, r.x, r.y, r.w, r.h, lengthInTextures,
        ])

        const baseIndex = this.vertices

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.vertices += 4
    }

    reset() {
        this.vertices = 0
        this.indexBuffer.reset()
        this.vertexBuffer.reset()
    }

    shouldDraw() {
        return this.indexBuffer.pointer !== 0
    }

    draw() {
        this.ctx.enable(this.ctx.DEPTH_TEST)
        this.ctx.disable(this.ctx.BLEND)

        this.indexBuffer.bindAndSendDataToGPU()
        this.vertexBuffer.bindAndSendDataToGPU()

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBuffer.glType, 0);
    }
}