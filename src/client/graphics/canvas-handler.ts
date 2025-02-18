
export default class CanvasHandler {
    public width: number;
    public height: number;
    
    public framebufferTextures: WebGLTexture[];
    public framebuffers: WebGLFramebuffer[];
    public activeFramebufferIndex: number;
    public inactiveFramebufferIndex: number;

    public ctx: WebGLRenderingContext = null
    public canvas: HTMLCanvasElement = null

    public scale: number
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.initCanvas()
        this.ctx = this.getContext()
        this.scale = window.devicePixelRatio || 1
    }

    getContext() {
        let ctx: WebGLRenderingContext
        try {
            ctx = this.canvas.getContext("webgl")
        } catch(ignored) {}
        try {
            ctx = this.canvas.getContext("experimental-webgl") as WebGLRenderingContext
        } catch(ignored) {}

        if(!ctx) throw new Error("WebGL not supported")

        ctx.clearColor(1.0, 1.0, 1.0, 1.0);
        ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
        ctx.depthFunc(ctx.LEQUAL)
        return ctx
    }

    updateSize() {
        this.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    }

    setSize(width: number, height: number) {
        if(width === this.width && height === this.height) return

        this.width = width
        this.height = height

        this.canvas.width = this.width * this.scale
        this.canvas.height = this.height * this.scale

        this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);

        for (let texture of this.framebufferTextures) {
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture)
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, null);

            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        }
    }

    initialize(): void {
        for (let texture of this.framebufferTextures) {
            let framebuffer = this.ctx.createFramebuffer()
            this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, framebuffer)
            this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.COLOR_ATTACHMENT0, this.ctx.TEXTURE_2D, texture, 0);
            this.framebuffers.push(framebuffer)
        }

        this.setScreenFramebuffer()
    }

    initCanvas(): void {
        this.framebufferTextures = []
        this.framebuffers = []

        // for(let i = 0; i < 2; i++) {
        //     let texture = this.ctx.createTexture()
        //     this.framebufferTextures.push(texture)
        // }

        this.activeFramebufferIndex = null
        this.inactiveFramebufferIndex = null
    }

    activeFramebufferTexture(): WebGLTexture {
        if (this.activeFramebufferIndex === null) return null
        return this.framebufferTextures[this.activeFramebufferIndex]
    }

    inactiveFramebufferTexture(): WebGLTexture {
        if (this.inactiveFramebufferIndex === null) return null
        return this.framebufferTextures[this.inactiveFramebufferIndex]
    }

    swapFramebuffers(): void {
        if (this.activeFramebufferIndex === null) {
            this.activeFramebufferIndex = 0
            this.inactiveFramebufferIndex = 1
        }
        let oldActive = this.activeFramebufferIndex
        this.activeFramebufferIndex = this.inactiveFramebufferIndex
        this.inactiveFramebufferIndex = oldActive
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.framebuffers[this.activeFramebufferIndex])
    }

    setScreenFramebuffer(): void {
        this.inactiveFramebufferIndex = this.activeFramebufferIndex
        this.activeFramebufferIndex = null
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null)
    }

    clear(): void {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
    }
}