

export const availableFeatures = {
    webgl: (() => {
        if (!window.WebGLRenderingContext) return false
    
        var canvas = document.createElement("canvas")
        canvas.width = 1;
        canvas.height = 1;
    
        var gl = null;
    
        try {
            gl = canvas.getContext("webgl");
        } catch (x) {}
    
        if (gl == null) {
            try {
                gl = canvas.getContext("experimental-webgl");
            } catch (x) {}
        }
    
        return gl ? true : "disabled"
    })(),
    OffscreenCanvas: (() => {
        if(!window.OffscreenCanvas) return "unavailable"
    
        var canvas = new OffscreenCanvas(1, 1)
        var gl;
    
        try {
            gl = canvas.getContext("webgl");
        } catch (x) {
            gl = null;
        }
    
        return !!gl
    })(),
    ResizeObserver: (() => {
        return typeof ResizeObserver === "function"
    })(),
    Blob: (() => {
        // Blob is used to save files in the map editor. All modern browsers
        // support this, so checking if it's available won't harm anyways.
        try {
            return !!new Blob;
        } catch (e) { return false }
    })
}

export function checkBrowser() {
    if(!availableFeatures.webgl) return false
    if(!availableFeatures.ResizeObserver) return false
    if(!availableFeatures.Blob) return false
    if(availableFeatures.webgl === "disabled") return "webgl-disabled"

    return true
}