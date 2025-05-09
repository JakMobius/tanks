
import Downloader from 'src/client/utils/downloader';
import Uniform from "src/client/graphics/gl/uniform";
import {Progress} from "src/client/utils/progress";

export interface SpriteRect {
    x: number
    y: number
    w: number
    h: number

    [key: string]: number | null
}

export interface TextureAtlas {
    settings: {
        atlasSize: number
    },
    textures: {
        [key: string]: SpriteRect
    }
}

export default class Sprite {
	public rects: SpriteRect[];
	public rect: SpriteRect;
    static sprites = new Map()
    static mipmapatlases: TextureAtlas[] = []
    static mipmapimages: HTMLImageElement[] = []
    static mipmaplevel = 0

    constructor(name: string) {

        // Do not remove
        // Destructuring the sprite
        // description with square brackets to
        // help prop name mangler.

        this.rects = []
        // this.topLeft = {}
        // this.topRight = {}
        // this.bottomLeft = {}
        // this.bottomRight = {}

        this.rect = null

        for(let mipmap of Sprite.mipmapatlases) {
            let source = mipmap.textures[name]
            this.rects.push({
                x: source["x"],
                y: source["y"],
                w: source["w"],
                h: source["h"]
            })
        }

        this.updateRect(this.rects[0])
    }

    updateRect(rect: SpriteRect) {
        this.rect = rect
        // this.topLeft.x = rect.x
        // this.topLeft.y = rect.y
        // this.topRight.x = rect.x + rect.w
        // this.topRight.y = rect.y
        // this.bottomLeft.x = rect.x
        // this.bottomLeft.y = rect.y + rect.h
        // this.bottomRight.x = rect.x + rect.w
        // this.bottomRight.y = rect.y + rect.h
        // this.centerLeft.x =
    }

    static setMipMapLevel(level: number) {
        this.mipmaplevel = level

        for(let sprite of this.sprites.values()) {
            sprite.updateRect(sprite.rects[level])
        }
    }

    static setGLMipMapLevel(gl: WebGLRenderingContext, uniform: Uniform, level: number) {
        uniform.set1i(level)
    }

    static applyTexture(gl: WebGLRenderingContext) {
        gl.activeTexture(gl.TEXTURE0)
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.mipmapimages[0]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return texture
    }

    static cleanupTexture(gl: WebGLRenderingContext, texture: WebGLTexture) {
        gl.deleteTexture(texture)
    }

    static setSmoothing(gl: WebGLRenderingContext, enabled: boolean) {
        if(enabled) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
    }

    static download(): Progress {
        let textureProgress = Sprite.mipmapimages[0] ? 
            Progress.completed() : 
            Downloader.downloadImage("/static/textures/atlas.png", (image) => {
                Sprite.mipmapimages[0] = image
            })

        let atlasProgress = Sprite.mipmapatlases[0] ? 
            Progress.completed() :
            Downloader.download("/static/textures/atlas.json", (response: TextureAtlas) => {
                Sprite.mipmapatlases[0] = response

                for(let key in response.textures) {
                    if(response.textures.hasOwnProperty(key)) {
                        Sprite.sprites.set(key, new Sprite(key))
                    }
                }
            })

        return Progress.parallel([textureProgress, atlasProgress])
    }

    /**
     * @param name Name of the sprite, like "tanks/sniper/body-bright"
     * @returns The sprite associated with this name
     */

    static named(name: string): Sprite {
        return Sprite.sprites.get(name)
    }
}