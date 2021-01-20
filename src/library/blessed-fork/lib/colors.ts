/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

class colors {
    static colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
        return Math.pow(30 * (r1 - r2), 2)
            + Math.pow(59 * (g1 - g2), 2)
            + Math.pow(11 * (b1 - b2), 2);
    }

    private static matchCache = new Map<number, number>()

    static match(color: number[]): number
    static match(color: string): number
    static match(red: number, green: number, blue: number): number
    static match(arg1: string | number | number[], arg2?: number, arg3?: number): number {

        let r1: number
        let g1: number
        let b1: number

        if (typeof arg1 === 'string') {
            if (arg1[0] !== '#') {
                return -1;
            }
            let hex = colors.hexToRGB(arg1);
            r1 = hex[0]
            g1 = hex[1]
            b1 = hex[2];
        } else if (Array.isArray(arg1)) {
            r1 = arg1[0]
            g1 = arg1[1]
            b1 = arg1[2]
        } else {
            r1 = arg1 as number
            g1 = arg2 as number
            b1 = arg3 as number
        }

        let hash = (r1 << 16) | (g1 << 8) | b1;

        let cached = colors.matchCache.get(hash)
        if (cached !== undefined) return cached

        let ldiff = Infinity
        let li = -1

        for (let i = 0; i < colors.vcolors.length; i++) {

            let c = colors.vcolors[i];
            let r2 = c[0];
            let g2 = c[1];
            let b2 = c[2];

            let diff = colors.colorDistance(r1, g1, b1, r2, g2, b2);

            if (diff === 0) {
                li = i;
                break;
            }

            if (diff < ldiff) {
                ldiff = diff;
                li = i;
            }
        }

        colors.matchCache.set(hash, li);

        return li
    }

    static hex(n: number) {
        let string = n.toString(16);
        if (string.length < 2) string = '0' + string;
        return string;
    }

    static RGBToHex(color: number[]): string
    static RGBToHex(r: number, g: number, b: number): string
    static RGBToHex(arg1: number | number[], arg2?: number, arg3?: number): string {
        let r: number
        let g: number
        let b: number

        if (Array.isArray(arg1)) {
            b = arg1[2]
            g = arg1[1]
            r = arg1[0]
        } else {
            r = arg1
            g = arg2
            b = arg3
        }

        return '#' + colors.hex(r) + colors.hex(g) + colors.hex(b);
    }

    static hexToRGB(hex: string): number[] {
        if (hex.length === 4) {
            hex = hex[0]
                + hex[1] + hex[1]
                + hex[2] + hex[2]
                + hex[3] + hex[3];
        }

        let col = parseInt(hex.substring(1), 16)
            , r = (col >> 16) & 0xff
            , g = (col >> 8) & 0xff
            , b = col & 0xff;

        return [r, g, b];
    }

    static mixColors(c1: number, c2: number, alpha: number) {
        if (c1 === 0x1ff) c1 = 0;
        if (c2 === 0x1ff) c2 = 0;
        if (alpha == null) alpha = 0.5;

        let color1 = colors.vcolors[c1];
        let r1 = color1[0];
        let g1 = color1[1];
        let b1 = color1[2];

        let color2 = colors.vcolors[c2];
        let r2 = color2[0];
        let g2 = color2[1];
        let b2 = color2[2];

        r1 += (r2 - r1) * alpha | 0;
        g1 += (g2 - g1) * alpha | 0;
        b1 += (b2 - b1) * alpha | 0;

        return colors.match([r1, g1, b1]);
    }

    private static blendCache: any = {}

    private static blendGround(ground: number): number {
        if (colors.blendCache[ground] != null) {
            ground = colors.blendCache[ground]
        } else if (ground >= 8 && ground <= 15) {
            ground -= 8;
        } else {
            let name = colors.ncolors[ground];
            if (name) {
                for (let i = 0; i < colors.ncolors.length; i++) {
                    if (name === colors.ncolors[i] && i !== ground) {
                        let color = colors.vcolors[ground];
                        let newColor = colors.vcolors[i];
                        if (newColor[0] + newColor[1] + newColor[2] < color[0] + color[1] + color[2]) {
                            colors.blendCache[ground] = i;
                            ground = i;
                            return ground
                        }
                    }
                }
            }
        }

        return ground
    }

    static blend(attr: number, attr2?: number, alpha?: number): number {
        let bg = attr & 0x1ff;
        if (attr2 == null) {
            bg = colors.blendGround(bg)
        } else {
            let bg2 = attr2 & 0x1ff;
            if (bg === 0x1ff) bg = 0;
            if (bg2 === 0x1ff) bg2 = 0;
            bg = colors.mixColors(bg, bg2, alpha);
        }

        attr &= ~0x1ff;
        attr |= bg;

        let fg = (attr >> 9) & 0x1ff;
        if (attr2 == null) {
            fg = colors.blendGround(fg)
        } else {
            let fg2 = (attr2 >> 9) & 0x1ff;
            // 0, 7, 188, 231, 251
            if (fg === 0x1ff) {
                // XXX workaround
                fg = 248;
            } else {
                if (fg === 0x1ff) fg = 7;
                if (fg2 === 0x1ff) fg2 = 7;
                fg = colors.mixColors(fg, fg2, alpha);
            }
        }

        attr &= ~(0x1ff << 9);
        attr |= fg << 9;

        return attr;
    }

    static reduce(color: number, total: number): number {
        if (color >= 16 && total <= 16) {
            color = colors.ccolors[color];
        } else if (color >= 8 && total <= 8) {
            color -= 8;
        } else if (color >= 2 && total <= 2) {
            color %= 2;
        }
        return color;
    }

    static xterm = [
        '#000000', // black
        '#cd0000', // red3
        '#00cd00', // green3
        '#cdcd00', // yellow3
        '#0000ee', // blue2
        '#cd00cd', // magenta3
        '#00cdcd', // cyan3
        '#e5e5e5', // gray90
        '#7f7f7f', // gray50
        '#ff0000', // red
        '#00ff00', // green
        '#ffff00', // yellow
        '#5c5cff', // rgb:5c/5c/ff
        '#ff00ff', // magenta
        '#00ffff', // cyan
        '#ffffff'  // white
    ]

    static generateXTermColors(): number[][] {
        let result: number[][] = []

        function push(i: number, r: number, g: number, b: number) {
            result[i] = [r, g, b];
        }

        // 0 - 15
        colors.xterm.forEach(function (c, i) {
            let number = parseInt(c.substring(1), 16);
            push(i, (number >> 16) & 0xff, (number >> 8) & 0xff, number & 0xff);
        });

        // 16 - 231
        for (let r = 0; r < 6; r++) {
            for (let g = 0; g < 6; g++) {
                for (let b = 0; b < 6; b++) {
                    let i = 16 + (r * 36) + (g * 6) + b;
                    push(i,
                        r ? (r * 40 + 55) : 0,
                        g ? (g * 40 + 55) : 0,
                        b ? (b * 40 + 55) : 0);
                }
            }
        }

        // 232 - 255 are grey.
        for (let g = 0; g < 24; g++) {
            let l = (g * 10) + 8;
            let i = 232 + g;
            push(i, l, l, l);
        }

        return result
    }

    static colorNames: any = {
        // special
        default: -1,
        normal: -1,
        bg: -1,
        fg: -1,
        // normal
        black: 0,
        red: 1,
        green: 2,
        yellow: 3,
        blue: 4,
        magenta: 5,
        cyan: 6,
        white: 7,
        // light
        lightblack: 8,
        lightred: 9,
        lightgreen: 10,
        lightyellow: 11,
        lightblue: 12,
        lightmagenta: 13,
        lightcyan: 14,
        lightwhite: 15,
        // bright
        brightblack: 8,
        brightred: 9,
        brightgreen: 10,
        brightyellow: 11,
        brightblue: 12,
        brightmagenta: 13,
        brightcyan: 14,
        brightwhite: 15,
        // alternate spellings
        grey: 8,
        gray: 8,
        lightgrey: 7,
        lightgray: 7,
        brightgrey: 7,
        brightgray: 7
    }

    private static colorCodes: any = {
        0: "black",
        1: "red",
        2: "green",
        3: "yellow",
        4: "blue",
        5: "magenta",
        6: "cyan",
        7: "white",
    }

    static convert(color: string | number | number[]) {
        let result: number
        if(typeof color != 'number') {
            if (typeof color === 'string') {
                color = color.replace(/[\- ]/g, '');
                if (colors.colorNames[color] == null) {
                    result = colors.match(color);
                } else {
                    result = colors.colorNames[color];
                }
            } else if (Array.isArray(color)) {
                result = colors.match(color);
            } else {
                result = -1;
            }
        }
        return result === -1 ? 0x1ff : result;
    }

    // Seed all 256 colors. Assume xterm defaults.
    // Ported from the xterm color generation script.
    static vcolors = colors.generateXTermColors()
    static colors = colors.vcolors.map(color => colors.RGBToHex(color))
    // Map higher colors to the first 8 colors.
    // This allows translation of high colors to low colors on 8-color terminals.
    static ccolorsOrigin = [
        0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,
        0, 4, 4, 4, 4, 4, 2, 6, 4, 4, 4, 4, 2, 2, 6, 4,
        4, 4, 2, 2, 2, 6, 4, 4, 2, 2, 2, 2, 6, 4, 2, 2,
        2, 2, 2, 6, 1, 5, 4, 4, 4, 4, 3, 0, 4, 4, 4, 4,
        2, 2, 6, 4, 4, 4, 2, 2, 2, 6, 4, 4, 2, 2, 2, 2,
        6, 4, 2, 2, 2, 2, 2, 6, 1, 1, 5, 4, 4, 4, 1, 1,
        5, 4, 4, 4, 3, 3, 0, 4, 4, 4, 2, 2, 2, 6, 4, 4,
        2, 2, 2, 2, 6, 4, 2, 2, 2, 2, 2, 6, 1, 1, 1, 5,
        4, 4, 1, 1, 1, 5, 4, 4, 1, 1, 1, 5, 4, 4, 3, 3,
        3, 7, 4, 4, 2, 2, 2, 2, 6, 4, 2, 2, 2, 2, 2, 6,
        1, 1, 1, 1, 5, 4, 1, 1, 1, 1, 5, 4, 1, 1, 1, 1,
        5, 4, 1, 1, 1, 1, 5, 4, 3, 3, 3, 3, 7, 4, 2, 2,
        2, 2, 2, 6, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 5,
        1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1,
        1, 5, 3, 3, 3, 3, 3, 7, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7
    ]
    static ccolors = (function() {
        let result: any = {}
        for(let i = 0; i < 256; i++) {
            result[String(i)] = colors.ccolorsOrigin[i]
        }
        return result
    })()
    static ncolors: string[] = colors.ccolorsOrigin.map(color => colors.colorCodes[color])
}

export class TTYColor {
    public readonly code: number;

    constructor(colorCode: number)
    constructor(colorName: string)
    constructor(colorComponents: [number, number, number])
    constructor(color: string | number | number[]) {
        this.code = colors.convert(color)
    }
}

export default colors