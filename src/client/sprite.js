
const Progress = require("./utils/progress")
const Downloader = require("./utils/downloader")

class Sprite {

    static sprites = new Map()
    static mipmapatlases = []
    static mipmapimages = []
    static mipmaplevel = 0

    constructor(name) {

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
            let source = mipmap[name]
            this.rects.push({
                x: source["x"],
                y: source["y"],
                w: source["w"],
                h: source["h"]
            })
        }

        this.updateRect(this.rects[0])
    }

    updateRect(rect) {
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

    static setMipMapLevel(level) {
        this.mipmaplevel = level

        for(let sprite of this.sprites.values()) {
            sprite.updateRect(sprite.rects[level])
        }
    }

    static setGLMipMapLevel(gl, uniform, level) {
        uniform.set1i(level)
    }

    static applyTexture(gl) {
        let i = 0
        for(let image of this.mipmapimages) {
            gl.activeTexture(gl["TEXTURE" + i])
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            i++
        }
    }

    static setSmoothing(gl, enabled) {
        if(enabled) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
    }

    static download(progress, gl, options) {
        options = Object.assign( {
            mipMapLevels: 3
        }, options)

        return new Promise((resolve, reject) => {
            let mipMapLevels = options.mipMapLevels
            let succeededMipmapLevels = mipMapLevels
            let awaiting = succeededMipmapLevels * 2
            const assetReady = () => {
                if(!--awaiting) {
                    let root = Sprite.mipmapatlases[0]

                    for(let key in root) {
                        if(root.hasOwnProperty(key)) {
                            Sprite.sprites.set(key, new Sprite(key))
                        }
                    }

                    resolve()
                }
            }

            for(let level = 0; level < mipMapLevels; level++) {
                (function(level) {
                    /** @type Progress */
                    let textureProgress = null

                    /** @type Progress */
                    let atlasProgress = null

                    if(progress) {
                        textureProgress = new Progress()
                        atlasProgress = new Progress()

                        progress.addSubtask(textureProgress)
                        progress.addSubtask(atlasProgress)
                    }

                    let levelPath = "atlas-mipmap-level-" + level;

                    $(new Image()).attr({
                        src: "../assets/img/" + levelPath + ".png"
                    }).on("load", function(){
                        if (this.complete) {
                            if(succeededMipmapLevels > level) {
                                Sprite.mipmapimages[level] = this
                                textureProgress.complete()
                            }

                            assetReady()
                        } else {
                            if(level === 0) {
                                reject("Failed to load first mipmap level")
                            } else {
                                succeededMipmapLevels = Math.min(succeededMipmapLevels, level)
                                assetReady()
                            }
                        }
                    })

                    $.ajax({
                        url: "../assets/img/" + levelPath + ".json",
                        xhr: Downloader.getXHR(null, atlasProgress)
                    }).done((data) => {
                        if(succeededMipmapLevels > level) {
                            Sprite.mipmapatlases[level] = data
                        }
                        assetReady()
                    }).fail((response, status, error) => {
                        if(level === 0) {
                            reject("Failed to load first mipmap level atlas descriptor: " + error)
                        } else {
                            succeededMipmapLevels = Math.min(succeededMipmapLevels, level)
                            assetReady()
                        }
                    })
                })(level)
            }
        })
    }

    /**
     * @param name Name of the sprite, like "tanks/sniper/body-bright"
     * @returns {Sprite} The sprite associated with this name
     */

    static named(name) {
        return Sprite.sprites.get(name)
    }
}

module.exports = Sprite