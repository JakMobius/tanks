class Color {
	public r: any;
	public g: any;
	public b: any;
	public alpha: any;
	public string: any;

    constructor(red, green, blue, alpha?) {
        this.r = red
        this.g = green
        this.b = blue
        this.alpha = alpha || 1.0
    }

    setRed(r) {
        this.r = r
        this.string = 0
    }

    setGreen(g) {
        this.g = g
        this.string = 0
    }

    setBlue(b) {
        this.b = b
        this.string = 0
    }

    setAlpha(a) {
        this.alpha = a
        this.string = 0
    }

    /**
     * Returns chat color code with specified RGB values
     * @param r {number}
     * @param g {number}
     * @param b {number}
     * @param bold {boolean}
     */

    static chatColor(r, g, b, bold=false) {
        let color = ""
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

    static replace(text, replace) {
        return text.replace(/(§!?[0-9A-F]{0,6};)?[^§\n]*/gi, function(a) {

            // if(!/^\\*(§!?[0-9A-F]{0,6};/.test(a)) {
            //     return replace("", false, a)
            // }
            //
            // // Checking if color sequence is screened
            //
            // let start = a.indexOf("§")
            let prefix = ""
            // if(start % 2 === 1) {
            //     return a.substr(1)
            // } else if(start) {
            //     prefix = a.substr(0, start)
            //     a = a.substr(start)
            // }

            let index = a.indexOf(";")
            let color = a.substr(1, index - 1)
            let text = a.substr(index + 1)
            let bold = color.startsWith("!")
            if(bold) color = color.substr(1)
            return prefix + replace(color, bold, text)
        })
    }

    toChatColor(bold) {
        return Color.chatColor(this.r, this.g, this.b, bold)
    }

    code() {

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

    static saturateChannel(c, saturation) {
        return Math.round((c - 127) * saturation + 127)
    }

    applyingSaturation(saturation) {
        return new Color(
            Color.saturateChannel(this.r, saturation),
            Color.saturateChannel(this.g, saturation),
            Color.saturateChannel(this.b, saturation),
            this.alpha
        )
    }

    withAlpha(alpha) {
        return new Color(this.r, this.g, this.b, alpha)
    }

    static red() {
        return new Color(255, 0, 0)
    }

    static green() {
        return new Color(0, 255, 0)
    }

    static blue() {
        return new Color(0, 0, 255)
    }

    static gray() {
        return new Color(127, 127, 127)
    }
}

export default Color;