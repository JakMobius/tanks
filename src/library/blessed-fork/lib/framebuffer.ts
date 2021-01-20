import {ScreenLine} from "./widgets/screen";
import * as unicode from "./unicode";
import {utoa} from "./terminal/characters";
import {Screen} from "./widgets/screen";
import colors from "./colors";

export class Framebuffer {

    lines: ScreenLine[]
    oldlines: ScreenLine[]
    width: number
    height: number
    backgroundAttribute: number;
    screen: Screen

    constructor(screen: Screen) {
        this.screen = screen
        this.backgroundAttribute = ((0 << 18) | (0x1ff << 9)) | 0x1ff;
    }

    private reallocBuffer(buffer: ScreenLine[], width: number, height: number, dirty?: boolean) {
        for (let y = 0; y < height; y++) {
            buffer[y] = [] as ScreenLine;
            for (let x = 0; x < width; x++) {
                buffer[y][x] = [this.backgroundAttribute, ' '];
            }
            buffer[y].dirty = !!dirty;
        }
    }

    resize(width: number, height: number, dirty?: boolean) {
        this.width = width
        this.height = height

        this.lines = []
        this.oldlines = []
        this.reallocBuffer(this.lines, width, height, dirty)
        this.reallocBuffer(this.oldlines, width, height, dirty)

        this.screen.program._write(this.screen.tput.terminfo.methods.clear());
    }

    private reduceColor(color: number) {
        return colors.reduce(color, this.screen.tput.terminfo.numbers.max_colors);
    }

    private charFlagsToString(data: number): string {
        let out = ''

        let bg = data & 0x1ff;
        let fg = (data >> 9) & 0x1ff;
        let flags = data >> 18;

        if (flags & 1) out += '1;'; // bold
        if (flags & 2) out += '4;'; // underline
        if (flags & 4) out += '5;'; // blink
        if (flags & 8) out += '7;'; // inverse
        if (flags & 16) out += '8;'; // invisible

        if (bg !== 0x1ff) {
            bg = this.reduceColor(bg);
            if (bg < 16) {
                if (bg < 8) {
                    bg += 40;
                } else if (bg < 16) {
                    bg -= 8;
                    bg += 100;
                }
                out += bg + ';';
            } else {
                out += '48;5;' + bg + ';';
            }
        }

        if (fg !== 0x1ff) {
            fg = this.reduceColor(fg);
            if (fg < 16) {
                if (fg < 8) {
                    fg += 30;
                } else if (fg < 16) {
                    fg -= 8;
                    fg += 90;
                }
                out += fg + ';';
            } else {
                out += '38;5;' + fg + ';';
            }
        }

        if (out[out.length - 1] === ';') out = out.slice(0, -1);

        return '\x1b[' + out + 'm';
    }

    draw(start: number, end: number) {

        let x
        let y
        let line
        let out
        let ch
        let data
        let attr

        let main = ''
        let pre
        let post;

        let clr
        let neq
        let xx;

        let lx = -1
        let ly = -1
        let o;

        let acs;

        if (this.screen._buf) {
            main += this.screen._buf;
            this.screen._buf = '';
        }

        for (y = start; y <= end; y++) {
            line = this.lines[y];
            o = this.oldlines[y];

            if (!line.dirty && !(this.screen.cursor.artificial && y === this.screen.program.cursorY)) {
                continue;
            }
            line.dirty = false;

            out = '';
            attr = this.backgroundAttribute;

            // Unicode, meh

            let terminalX = 0

            for (x = 0; x < line.length; x++) {
                data = line[x][0];
                ch = line[x][1];

                // Render the artificial cursor.
                if (this.screen.cursor.artificial
                    && !this.screen.program.cursorHidden
                    && this.screen.cursor._state
                    && x === this.screen.program.cursorX
                    && y === this.screen.program.cursorY) {
                    var cattr = this.screen._cursorAttr(this.screen.cursor, data);
                    if (cattr.ch) ch = cattr.ch;
                    data = cattr.attr;
                }

                // Take advantage of xterm's back_color_erase feature by using a
                // lookahead. Stop spitting out so many damn spaces. NOTE: Is checking
                // the bg for non BCE terminals worth the overhead?
                if (this.screen.options.useBCE
                    && ch === ' '
                    && (this.screen.tput.terminfo.bools.back_color_erase
                        || (data & 0x1ff) === (this.backgroundAttribute & 0x1ff))
                    && ((data >> 18) & 8) === ((this.backgroundAttribute >> 18) & 8)) {
                    clr = true;
                    neq = false;

                    for (xx = x; xx < line.length; xx++) {
                        if (line[xx][0] !== data || line[xx][1] !== ' ') {
                            clr = false;
                            break;
                        }
                        if (line[xx][0] !== o[xx][0] || line[xx][1] !== o[xx][1]) {
                            neq = true;
                        }
                    }

                    if (clr && neq) {
                        lx = -1
                        ly = -1;
                        if (data !== attr) {
                            out += this.charFlagsToString(data);
                            attr = data;
                        }
                        out += this.screen.tput.terminfo.methods.cup(y, x);
                        out += this.screen.tput.terminfo.methods.el();
                        for (xx = x; xx < line.length; xx++) {
                            o[xx][0] = data;
                            o[xx][1] = ' ';
                        }
                        break;
                    }
                }

                let chLength = unicode.isSurrogate(ch) ? 2 : 1

                // Optimize by comparing the real output
                // buffer to the pending output buffer.
                if (data === o[x][0] && ch === o[x][1]) {
                    if (lx === -1) {
                        lx = terminalX;
                        ly = y;
                    }

                    terminalX += chLength
                    continue;
                } else if (lx !== -1) {
                    if (this.screen.tput.terminfo.strings.parm_right_cursor) {
                        out += y === ly
                            ? this.screen.tput.terminfo.methods.cuf(terminalX - lx)
                            : this.screen.tput.terminfo.methods.cup(y, terminalX);
                    } else {
                        out += this.screen.tput.terminfo.methods.cup(y, terminalX);
                    }
                    lx = -1
                    ly = -1;
                }

                let oldChLength = unicode.isSurrogate(o[x][1]) ? 2 : 1

                if(oldChLength > chLength) {
                    out += this.screen.tput.terminfo.methods.cuf(1)
                    out += this.screen.tput.terminfo.methods.ech(1)
                }

                o[x][0] = data;
                o[x][1] = ch;

                terminalX += chLength

                if (data !== attr) {
                    if (attr !== this.backgroundAttribute) {
                        out += '\x1b[m';
                    }
                    if (data !== this.backgroundAttribute) {
                        out += this.charFlagsToString(data)
                    }
                }

                // If we find a double-width char, eat the next character which should be
                // a space due to parseContent's behavior.
                if (this.screen.fullUnicode) {
                    // If this is a surrogate pair double-width char, we can ignore it
                    // because parseContent already counted it as length=2.
                    if (unicode.charWidth(line[x][1]) === 2) {
                        // NOTE: At cols=44, the bug that is avoided
                        // by the angles check occurs in widget-unicode:
                        // Might also need: `line[x + 1][0] !== line[x][0]`
                        // for borderless boxes?
                        if (x === line.length - 1) {
                            // If we're at the end, we don't have enough space for a
                            // double-width. Overwrite it with a space and ignore.
                            ch = ' ';
                            o[x][1] = '\0';
                        } else {
                            // ALWAYS refresh double-width chars because this special cursor
                            // behavior is needed. There may be a more efficient way of doing
                            // this. See above.
                            o[x][1] = '\0';
                            // Eat the next character by moving forward and marking as a
                            // space (which it is).
                            o[++x][1] = '\0';
                        }
                    }
                }

                // Attempt to use ACS for supported characters.
                // This is not ideal, but it's how ncurses works.
                // There are a lot of terminals that support ACS
                // *and UTF8, but do not declare U8. So ACS ends
                // up being used (slower than utf8). Terminals
                // that do not support ACS and do not explicitly
                // support UTF8 get their unicode characters
                // replaced with really ugly ascii characters.
                // It is possible there is a terminal out there
                // somewhere that does not support ACS, but
                // supports UTF8, but I imagine it's unlikely.
                // Maybe remove !this.screen.tput.unicode check, however,
                // this seems to be the way ncurses does it.
                if (this.screen.tput.terminfo.strings.enter_alt_charset_mode
                    && !this.screen.tput.terminfo.features.brokenACS && (this.screen.tput.terminfo.features.acscr[ch] || acs)) {
                    // Fun fact: even if this.screen.tput.brokenACS wasn't checked here,
                    // the linux console would still work fine because the acs
                    // table would fail the check of: this.screen.tput.terminfo.methods.acscr[ch]
                    if (this.screen.tput.terminfo.features.acscr[ch]) {
                        if (acs) {
                            ch = this.screen.tput.terminfo.features.acscr[ch];
                        } else {
                            ch = this.screen.tput.terminfo.methods.smacs()
                                + this.screen.tput.terminfo.features.acscr[ch];
                            acs = true;
                        }
                    } else if (acs) {
                        ch = this.screen.tput.terminfo.methods.rmacs() + ch;
                        acs = false;
                    }
                } else {
                    // U8 is not consistently correct. Some terminfo's
                    // terminals that do not declare it may actually
                    // support utf8 (e.g. urxvt), but if the terminal
                    // does not declare support for ACS (and U8), chances
                    // are it does not support UTF8. This is probably
                    // the "safest" way to do this. Should fix things
                    // like sun-color.
                    // NOTE: It could be the case that the $LANG
                    // is all that matters in some cases:
                    // if (!this.screen.tput.terminfo.unicode && ch > '~') {
                    if (!this.screen.tput.terminfo.features.unicode && this.screen.tput.terminfo.numbers["U8"] !== 1 && ch > '~') {
                        ch = utoa[ch] || '?';
                    }
                }

                out += ch;
                attr = data;
            }

            if (attr !== this.backgroundAttribute) {
                out += '\x1b[m';
            }

            if (out) {
                main += this.screen.tput.terminfo.methods.cup(y, 0) + out;
            }
        }

        if (acs) {
            main += this.screen.tput.terminfo.methods.rmacs();
        }

        if (main) {
            pre = '';
            post = '';

            pre += this.screen.tput.terminfo.methods.sc();
            post += this.screen.tput.terminfo.methods.rc();

            if (!this.screen.program.cursorHidden) {
                pre += this.screen.tput.terminfo.methods.civis();
                post += this.screen.tput.terminfo.methods.cnorm();
            }

            this.screen.program._write(pre + main + post);
        }
    }
}
