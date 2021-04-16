/* @load-resource: '../shaders/fragment/particle-fragment.glsl' */
/* @load-resource: '../shaders/vertex/particle-vertex.glsl' */

import Program from '../program';

import Shader from '../shader';
import GLBuffer from '../glbuffer';
import Particle from "../../particles/particle";

class ParticleProgram extends Program {
	public vertexBuffer: GLBuffer<Float32Array>;
	public colorBuffer: GLBuffer<Uint32Array>;
	public indexBuffer: any;
	public vertexPositionAttribute: any;
	public colorAttribute: any;
	public matrixUniform: any;
	public vertexLength: any;
	public particles: any;

    constructor(name: string, ctx: WebGLRenderingContext) {

        let vertexShader = new Shader("src/client/graphics/shaders/vertex/particle-vertex.glsl", Shader.VERTEX).compile(ctx)
        let fragmentShader = new Shader("src/client/graphics/shaders/fragment/particle-fragment.glsl", Shader.FRAGMENT).compile(ctx)
        super(name, vertexShader, fragmentShader)

        this.link(ctx)

        this.ctx = ctx
        this.vertexBuffer = new GLBuffer({
            clazz: Float32Array,
            gl: ctx,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.colorBuffer = new GLBuffer<Uint32Array>({
            gl: ctx,
            clazz: Uint32Array,
            drawMode: this.ctx.STATIC_DRAW
        }).createBuffer()

        this.indexBuffer = this.createIndexBuffer()

        this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
        this.colorAttribute = this.getAttribute("a_color");
        this.matrixUniform = this.getUniform("u_matrix")
        this.vertexLength = 2
        this.particles = 0
    }

    prepare() {
        this.indexBuffer.reset()

        this.vertexBuffer.bind()
        this.vertexBuffer.reset()

        const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT
        const stride = this.vertexLength * bytes

        this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);

        this.colorBuffer.bind()
        this.colorBuffer.reset()

        const colorBytes = this.colorBuffer.clazz.BYTES_PER_ELEMENT

        this.ctx.enableVertexAttribArray(this.colorAttribute);
        this.ctx.vertexAttribPointer(this.colorAttribute, 4, this.ctx.UNSIGNED_BYTE, true, colorBytes, 0);
    }

    drawParticle(particle: Particle) {

        let alpha = particle.color.getAlpha()

        if(alpha <= 0) {
            return
        }

        const w = particle.width / 2
        const h = particle.height / 2

        const r = particle.color.getRed() & 0xff
        const g = particle.color.getGreen() & 0xff
        const b = particle.color.getRed() & 0xff
        const a = (alpha * 255) & 0xff
        const data = a << 24 | b << 16 | g << 8 | r

        for(let i = 0; i < 4; i++) {
            this.colorBuffer.push(data)
        }

        this.vertexBuffer.appendArray([
            particle.x - w, particle.y - h,
            particle.x - w, particle.y + h,
            particle.x + w, particle.y - h,
            particle.x + w, particle.y + h,
        ])

        const baseIndex = this.particles * 4

        this.indexBuffer.appendArray([
            baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3
        ])

        this.particles++
    }

    draw() {
        //this.ctx.blendFunc(this.ctx.ONE, this.ctx.ONE_MINUS_SRC_COLOR)

        this.indexBuffer.updateData()
        this.vertexBuffer.updateData()
        this.colorBuffer.updateData()

        this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);

        this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
        this.ctx.disableVertexAttribArray(this.colorAttribute);

        this.particles = 0

        //this.ctx.blendFuncSeparate(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA);
    }
}

export default ParticleProgram;