
export default class Color {
    private r: number = 0;
    private g: number = 0;
    private b: number = 0;
    private alpha: number = 1;
    private string: string | null;

    setHSL(h: number, s: number, l: number, a: number = 1) {
        this.alpha = a
        this.string = null
        if (s === 0) {
            this.r = this.g = this.b = l
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            this.r = hue2rgb(p, q, h + 1 / 3);
            this.g = hue2rgb(p, q, h);
            this.b = hue2rgb(p, q, h - 1 / 3);
        }
        return this
    }

    setRGB(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1.0) {
        this.r = red
        this.g = green
        this.b = blue
        this.alpha = alpha
        this.string = null
        return this
    }

    setRed(r: number) {
        this.r = r
        this.string = null
        return this
    }

    setGreen(g: number) {
        this.g = g
        this.string = null
        return this
    }

    setBlue(b: number) {
        this.b = b
        this.string = null
        return this
    }

    setAlpha(a: number) {
        this.alpha = a
        this.string = null
        return this
    }

    /**
     * Returns chat color code with specified RGB values
     */

    static chatColor(r: number, g: number, b: number, bold = false): string {
        let color: string
        r = Math.round(r * 255)
        g = Math.round(g * 255)
        b = Math.round(b * 255)

        if (
            (r & 0xF) === ((r >> 4) & 0xF) &&
            (g & 0xF) === ((g >> 4) & 0xF) &&
            (b & 0xF) === ((b >> 4) & 0xF)
        ) {
            color = (r & 0xF).toString(16) + (g & 0xF).toString(16) + (b & 0xF).toString(16)
        } else {
            color = r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0")
        }

        if (bold) {
            return "§!" + color + ";"
        } else {
            return "§" + color + ";"
        }
    }

    static replace(text: string, replace: (color: string, bold: boolean, text: string) => string) {
        return text.replace(/§(!?[\dA-F]{0,6};)?[^§\n]*/gi, function (a) {
            let prefix = ""

            let index = a.indexOf(";")
            let color = a.substr(1, index - 1)
            let text = a.substr(index + 1)
            let bold = color.startsWith("!")
            if (bold) color = color.substr(1)
            return prefix + replace(color, bold, text)
        })
    }

    toChatColor(bold: boolean) {
        return Color.chatColor(this.r, this.g, this.b, bold)
    }

    code(): string {

        if (this.string) return this.string

        if (this.alpha === 1) {
            let r, g, b;

            r = Math.round(this.r * 255).toString(16);
            g = Math.round(this.g * 255).toString(16);
            b = Math.round(this.b * 255).toString(16);

            (r.length === 1) && (r = "0" + r);
            (g.length === 1) && (g = "0" + g);
            (b.length === 1) && (b = "0" + b);

            this.string = "#" + r + g + b
        } else {
            this.string = "rgba(" + Math.round(this.r * 255) + "," + Math.round(this.g * 255) + "," + Math.round(this.b * 255) + "," + (Math.round(this.alpha * 100) / 100) + ")"
        }

        return this.string
    }

    static saturateChannel(c: number, saturation: number) {
        return Math.round((c - 127) * saturation + 127)
    }

    applyingSaturation(saturation: number): Color {
        return new Color().setRGB(
            Color.saturateChannel(this.r, saturation),
            Color.saturateChannel(this.g, saturation),
            Color.saturateChannel(this.b, saturation),
            this.alpha
        )
    }

    withAlpha(alpha: number): Color {
        return new Color().setRGB(this.r, this.g, this.b, alpha)
    }

    static red(): Color {
        return new Color().setRGB(1, 0, 0)
    }

    static green(): Color {
        return new Color().setRGB(0, 1, 0)
    }

    static blue(): Color {
        return new Color().setRGB(0, 0, 1)
    }

    static gray(): Color {
        return new Color().setRGB(0.5, 0.5, 0.5)
    }

    getRed() {
        return this.r
    }

    getGreen() {
        return this.g
    }

    getBlue() {
        return this.b
    }

    getAlpha() {
        return this.alpha
    }
}

function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}