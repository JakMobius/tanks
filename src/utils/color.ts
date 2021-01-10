class Color {
	private r: number;
	private g: number;
	private b: number;
	private alpha: number;
	private string: string | null;

    constructor(red: number, green: number, blue: number, alpha: number = 1.0) {
        this.r = red
        this.g = green
        this.b = blue
        this.alpha = alpha
    }

    setRed(r: number) {
        this.r = r
        this.string = null
    }

    setGreen(g: number) {
        this.g = g
        this.string = null
    }

    setBlue(b: number) {
        this.b = b
        this.string = null
    }

    setAlpha(a: number) {
        this.alpha = a
        this.string = null
    }

    /**
     * Returns chat color code with specified RGB values
     */

    static chatColor(r: number, g: number, b: number, bold= false): string {
        let color: string
        if (
            (r & 0xF) === ((r >> 4) & 0xF) &&
            (g & 0xF) === ((g >> 4) & 0xF) &&
            (b & 0xF) === ((b >> 4) & 0xF)
        ) {
            color = r.toString(16) + g.toString(16) + b.toString(16)
        } else {
            color = r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0")
        }

        if(bold) {
            return "§!" + color + ";"
        } else {
            return "§" + color + ";"
        }
    }

    static replace(text: string, replace: (color: string, bold: boolean, text: string) => string) {
        return text.replace(/(§!?[0-9A-F]{0,6};)?[^§\n]*/gi, function(a) {
            let prefix = ""

            let index = a.indexOf(";")
            let color = a.substr(1, index - 1)
            let text = a.substr(index + 1)
            let bold = color.startsWith("!")
            if(bold) color = color.substr(1)
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

            r = Math.round(this.r).toString(16);
            g = Math.round(this.g).toString(16);
            b = Math.round(this.b).toString(16);

            (r.length === 1) && (r = "0" + r);
            (g.length === 1) && (g = "0" + g);
            (b.length === 1) && (b = "0" + b);

            this.string = "#" + r + g + b
        } else {
            this.string = "rgba(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + "," + (Math.round(this.alpha * 100) / 100) + ")"
        }

        return this.string
    }

    static saturateChannel(c: number, saturation: number) {
        return Math.round((c - 127) * saturation + 127)
    }

    applyingSaturation(saturation: number): Color {
        return new Color(
            Color.saturateChannel(this.r, saturation),
            Color.saturateChannel(this.g, saturation),
            Color.saturateChannel(this.b, saturation),
            this.alpha
        )
    }

    withAlpha(alpha: number): Color {
        return new Color(this.r, this.g, this.b, alpha)
    }

    static red(): Color {
        return new Color(255, 0, 0)
    }

    static green(): Color {
        return new Color(0, 255, 0)
    }

    static blue(): Color {
        return new Color(0, 0, 255)
    }

    static gray(): Color {
        return new Color(127, 127, 127)
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

export default Color;