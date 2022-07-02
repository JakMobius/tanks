
type RequestAnimationFrameHolder = { [key: string]: ((callback: FrameRequestCallback) => number) }

let holder = window as any as RequestAnimationFrameHolder

export default window.requestAnimationFrame =
    holder["requestAnimationFrame"] ||
    holder["mozRequestAnimationFrame"] ||
    holder["webkitRequestAnimationFrame"] ||
    holder["msRequestAnimationFrame"]