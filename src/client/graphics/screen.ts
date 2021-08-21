
import "../animation-frame-polyfill"
import SoundEngine from "../sound/soundengine";
import CanvasFactory from '../utils/canvasfactory'
import Sprite from "../sprite";

export interface ScreenConfig {
    scale?: number
    root: JQuery
    fitRoot?: boolean
    width?: number
    height?: number
}

export default class Screen {
	public config: ScreenConfig;
	public root: JQuery;
	public width: number;
	public height: number;
	public framebufferTextures: WebGLTexture[];
	public framebuffers: WebGLFramebuffer[];
	public activeFramebufferIndex: number;
	public inactiveFramebufferIndex: number;

    public canvas: HTMLCanvasElement = null
    public ctx: WebGLRenderingContext = null
    private resizeHandler: () => void;
    soundEngine: SoundEngine;

    constructor(config: ScreenConfig) {
        config = Object.assign({
            scale: window.devicePixelRatio,
            fitRoot: true
        }, config)

        this.config = config
        this.root = config.root
        //this.soundEngine = new SoundEngine()

        this.width = null
        this.height = null

        this.initCanvas()
        if(this.config.fitRoot) {
            this.initResizeHandling()
        } else {
            this.setSize(this.config.width ?? 300, this.config.height ?? 150)
        }
        this.initialize()
    }

    initialize(): void {
        for(let texture of this.framebufferTextures) {
            let framebuffer = this.ctx.createFramebuffer()
            this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, framebuffer)
            this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.COLOR_ATTACHMENT0, this.ctx.TEXTURE_2D, texture, 0);
            this.framebuffers.push(framebuffer)
        }

        this.setScreenFramebuffer()
    }

    initCanvas(): void {
        Object.assign(this, CanvasFactory())

        this.root.append($(this.canvas))

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
        if(this.activeFramebufferIndex === null) return null
        return this.framebufferTextures[this.activeFramebufferIndex]
    }

    inactiveFramebufferTexture(): WebGLTexture {
        if(this.inactiveFramebufferIndex === null) return null
        return this.framebufferTextures[this.inactiveFramebufferIndex]
    }

    swapFramebuffers(): void {
        if(this.activeFramebufferIndex === null) {
            this.activeFramebufferIndex = 0
            this.inactiveFramebufferIndex = 1
        }
        let oldActive = this.activeFramebufferIndex
        this.activeFramebufferIndex = this.inactiveFramebufferIndex
        this.inactiveFramebufferIndex = oldActive
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.framebuffers[this.activeFramebufferIndex])
    }

    clear(): void {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
    }

    setScreenFramebuffer(): void {
        this.inactiveFramebufferIndex = this.activeFramebufferIndex
        this.activeFramebufferIndex = null
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null)
    }

    initResizeHandling(): void {
        this.resizeHandler = () => this.fitRoot()

        window.addEventListener("resize", this.resizeHandler)
        this.resizeHandler()
    }

    setSize(width: number, height: number) {
        this.width = width
        this.height = height

        this.canvas.width = this.width * this.config.scale
        this.canvas.height = this.height * this.config.scale

        this.canvas.style.width = this.width + "px"
        this.canvas.style.height = this.height + "px"

        this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);

        for(let texture of this.framebufferTextures) {
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture)
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, null);

            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        }
    }

    fitRoot() {
        this.setSize(this.root.width(), this.root.height())
    }

    destroy() {
        window.removeEventListener("resize", this.resizeHandler)
    }
}