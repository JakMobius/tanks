import {TTYColor} from "./colors";

export type BlessedCursorShape = 'block' | 'line' | 'underline' | {
    bold?: boolean
    underline?: boolean
    blink?: boolean
    inverse?: boolean
    invisible?: boolean
    fg?: boolean
    bg?: boolean
    ch?: string
}

export interface BlessedCursorConfig {
    artificial?: boolean
    shape?: BlessedCursorShape
    blink?: boolean
    color?: TTYColor
}