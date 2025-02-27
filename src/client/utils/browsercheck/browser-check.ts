

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
    })()
}

export function checkBrowser() {
    if(!availableFeatures.webgl) return false
    if(!availableFeatures.ResizeObserver) return false
    if(availableFeatures.webgl === "disabled") return "webgl-disabled"

    return true
}