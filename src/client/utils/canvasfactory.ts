
export default function() {
    const canvas = document.createElement("canvas")

    let ctx
    try {
        ctx = canvas.getContext("webgl")
    } catch(ignored) {}
    try {
        ctx = canvas.getContext("experimental-webgl")
    } catch(ignored) {}

    if(!ctx) throw new Error("WebGL not supported")

    ctx.clearColor(1.0, 1.0, 1.0, 1.0);
    ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
    ctx.enable(ctx.BLEND);

    return {
        canvas: canvas,
        ctx: ctx
    }
};