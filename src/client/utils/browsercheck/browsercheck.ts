
export default {
    WebGLAvailablilty: function() {
        if (window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas")
            canvas.width = 1;
            canvas.height = 1;

            var gl;

            try {
                gl = canvas.getContext("webgl");
            } catch (x) {
                gl = null;
            }

            if (gl == null) {
                try {
                    gl = canvas.getContext("experimental-webgl");
                } catch (x) {
                    gl = null;
                }
            }

            if (gl) {
                return "available"
            } else {
                return "disabled"
            }
        } else {
            return "unavailable"
        }
    }
};