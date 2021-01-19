import {TTYColor} from "./colors";

export type BlessedCursorShapes = 'block' | 'line' | 'underline'
export interface BlessedCursorShapeConfig {
    bold?: boolean
    underline?: boolean
    blink?: boolean
    inverse?: boolean
    invisible?: boolean
    fg?: TTYColor
    bg?: TTYColor
    ch?: string
}

export type BlessedCursorShape = BlessedCursorShapes | BlessedCursorShapeConfig

export interface BlessedCursorConfig {
    artificial?: boolean
    shape?: BlessedCursorShape
    blink?: boolean
    color?: TTYColor
}