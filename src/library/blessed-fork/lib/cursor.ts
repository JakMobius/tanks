import {TTYColor} from "./colors";

export type CursorShapes = 'block' | 'line' | 'underline'
export interface CursorShapeConfig {
    bold?: boolean
    underline?: boolean
    blink?: boolean
    inverse?: boolean
    invisible?: boolean
    fg?: TTYColor
    bg?: TTYColor
    ch?: string
}

export type CursorShape = CursorShapes | CursorShapeConfig

export interface CursorConfig {
    artificial?: boolean
    shape?: CursorShape
    blink?: boolean
    color?: TTYColor
}