import GpmClient, {GPMEvent} from "../gpmclient";
import {MouseEvent} from "../widgets/screen";
import Program from "../program";
import {StringDecoder} from "string_decoder";

export interface MouseOptions {
    gpmMouse?: boolean;
    jsbtermMouse?: boolean;
    ptermMouse?: boolean;
    decMouse?: boolean;
    urxvtMouse?: boolean;
    sgrMouse?: boolean;
    utfMouse?: boolean;
    sendFocus?: boolean;
    cellMotion?: boolean;
    x10Mouse?: boolean;
    vt200Hilite?: boolean;
    hiliteTracking?: boolean;
    allMotion?: boolean;
    vt200Mouse?: boolean;
    normalMouse?: boolean;
}

export class MouseController {
    public gpm: GpmClient;
    public program: Program;
    public currentMouseConfig: MouseOptions;
    public mouseEnabled: boolean;
    public boundMouse: boolean;
    public lastPressedXTermButton: string;

    constructor(program: Program) {
        this.program = program
    }

    enableMouse() {
        // NOTE:
        // Cell Motion isn't normally need for anything below here, but we'll
        // activate it for tmux (whether using it or not) in case our all-motion
        // passthrough does not work. It can't hurt.

        if (this.program.term('rxvt-unicode')) {
            return this.setMouse({
                urxvtMouse: true,
                cellMotion: true,
                allMotion: true
            }, true);
        }

        // rxvt does not support the X10 UTF extensions
        if (this.program.term('rxvt')) {
            return this.setMouse({
                vt200Mouse: true,
                x10Mouse: true,
                cellMotion: true,
                allMotion: true
            }, true);
        }

        // libvte is broken. Older versions do not support the
        // X10 UTF extension. However, later versions do support
        // SGR/URXVT.
        if (this.program.isVTE) {
            return this.setMouse({
                // NOTE: Could also use urxvtMouse here.
                sgrMouse: true,
                cellMotion: true,
                allMotion: true
            }, true);
        }

        if (this.program.term('linux')) {
            return this.setMouse({
                vt200Mouse: true,
                gpmMouse: true
            }, true);
        }

        if (this.program.term('xterm')
            || this.program.term('screen')
            || (this.program.tput && this.program.tput.terminfo.strings.key_mouse)) {
            return this.setMouse({
                vt200Mouse: true,
                utfMouse: true,
                cellMotion: true,
                allMotion: true
            }, true);
        }
    }

    disableMouse() {
        if (!this.currentMouseConfig) return;
        return this.setMouse(this.currentMouseConfig, false);
    }

// Set Mouse
    setMouse(opt: MouseOptions, enable?: boolean) {
        if (opt.normalMouse != null) {
            opt.vt200Mouse = opt.normalMouse;
            opt.allMotion = opt.normalMouse;
        }

        if (opt.hiliteTracking != null) {
            opt.vt200Hilite = opt.hiliteTracking;
        }

        if (enable === true) {
            if (this.currentMouseConfig) {
                this.setMouse(opt);
                Object.assign(this.currentMouseConfig, opt)
                return;
            }
            this.currentMouseConfig = opt;
            this.mouseEnabled = true;
        } else if (enable === false) {
            this.currentMouseConfig = null;
            this.mouseEnabled = false;
        }

        //     Ps = 9  -> Send Mouse X & Y on button press.  See the sec-
        //     tion Mouse Tracking.
        //     Ps = 9  -> Don't send Mouse X & Y on button press.
        // x10 mouse
        if (opt.x10Mouse != null) {
            if (enable) this.program.setMode('?9');
            else this.program.resetMode('?9');
        }

        //     Ps = 1 0 0 0  -> Send Mouse X & Y on button press and
        //     release.  See the section Mouse Tracking.
        //     Ps = 1 0 0 0  -> Don't send Mouse X & Y on button press and
        //     release.  See the section Mouse Tracking.
        // vt200 mouse
        if (opt.vt200Mouse != null) {
            if (enable) this.program.setMode('?1000');
            else this.program.resetMode('?1000');
        }

        //     Ps = 1 0 0 1  -> Use Hilite Mouse Tracking.
        //     Ps = 1 0 0 1  -> Don't use Hilite Mouse Tracking.
        if (opt.vt200Hilite != null) {
            if (enable) this.program.setMode('?1001');
            else this.program.resetMode('?1001');
        }

        //     Ps = 1 0 0 2  -> Use Cell Motion Mouse Tracking.
        //     Ps = 1 0 0 2  -> Don't use Cell Motion Mouse Tracking.
        // button event mouse
        if (opt.cellMotion != null) {
            if (enable) this.program.setMode('?1002');
            else this.program.resetMode('?1002');
        }

        //     Ps = 1 0 0 3  -> Use All Motion Mouse Tracking.
        //     Ps = 1 0 0 3  -> Don't use All Motion Mouse Tracking.
        // any event mouse
        if (opt.allMotion != null) {
            // NOTE: Latest versions of tmux seem to only support cellMotion (not
            // allMotion). We pass all motion through to the terminal.
            if (this.program.tmux && this.program.tmuxVersion >= 2) {
                if (enable) this.program._twrite('\x1b[?1003h');
                else this.program._twrite('\x1b[?1003l');
            } else {
                if (enable) this.program.setMode('?1003');
                else this.program.resetMode('?1003');
            }
        }

        //     Ps = 1 0 0 4  -> Send FocusIn/FocusOut events.
        //     Ps = 1 0 0 4  -> Don't send FocusIn/FocusOut events.
        if (opt.sendFocus != null) {
            if (enable) this.program.setMode('?1004');
            else this.program.resetMode('?1004');
        }

        //     Ps = 1 0 0 5  -> Enable Extended Mouse Mode.
        //     Ps = 1 0 0 5  -> Disable Extended Mouse Mode.
        if (opt.utfMouse != null) {
            if (enable) this.program.setMode('?1005');
            else this.program.resetMode('?1005');
        }

        // sgr mouse
        if (opt.sgrMouse != null) {
            if (enable) this.program.setMode('?1006');
            else this.program.resetMode('?1006');
        }

        // urxvt mouse
        if (opt.urxvtMouse != null) {
            if (enable) this.program.setMode('?1015');
            else this.program.resetMode('?1015');
        }

        // dec mouse
        if (opt.decMouse != null) {
            if (enable) this.program._write('\x1b[1;2\'z\x1b[1;3\'{');
            else this.program._write('\x1b[\'z');
        }

        // pterm mouse
        if (opt.ptermMouse != null) {
            if (enable) this.program._write('\x1b[>1h\x1b[>6h\x1b[>7h\x1b[>1h\x1b[>9l');
            else this.program._write('\x1b[>1l\x1b[>6l\x1b[>7l\x1b[>1l\x1b[>9h');
        }

        // jsbterm mouse
        if (opt.jsbtermMouse != null) {
            // + = advanced mode
            if (enable) this.program._write('\x1b[0~ZwLMRK+1Q\x1b\\');
            else this.program._write('\x1b[0~ZwQ\x1b\\');
        }

        // gpm mouse
        if (opt.gpmMouse != null) {
            if (enable) this.enableGpm();
            else this.disableGpm();
        }
    }

    private getEvent(name: string, event: GPMEvent): MouseEvent {
        return {
            name: 'mouse',
            type: 'GPM',
            action: name,
            button: this.gpm.ButtonName(event.buttons),
            raw: event,
            x: event.x,
            y: event.y,
            dx: event.wdx,
            dy: event.wdy,
            shift: this.gpm.hasShiftKey(event.modifiers),
            meta: this.gpm.hasMetaKey(event.modifiers),
            ctrl: this.gpm.hasCtrlKey(event.modifiers)
        }
    }

    private emitMouseEvent(name: string, event: GPMEvent) {
        this.program.emit('mouse', this.getEvent(name, event));
    }

    enableGpm() {
        if (this.gpm) return;

        this.gpm = new GpmClient();

        this.gpm.on('btndown', (event) => {
            this.emitMouseEvent("mousedown", event)
        });

        this.gpm.on('btnup', (event) => {
            this.emitMouseEvent("mouseup", event);
        });

        this.gpm.on('move', (event) => {
            this.emitMouseEvent("mousemove", event);
        });

        this.gpm.on('drag', (event) => {
            this.emitMouseEvent("mousemove", event);
        });

        this.gpm.on('mousewheel', (event) => {
            this.emitMouseEvent(event.wdy > 0 ? 'wheelup' : 'wheeldown', event);
        });
    }

    disableGpm() {
        if (this.gpm) {
            this.gpm.stop();
            delete this.gpm;
        }
    }

    // XTerm mouse events
// http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#Mouse%20Tracking
// To better understand these
// the xterm code is very helpful:
// Relevant files:
//   button.c, charproc.c, misc.c
// Relevant functions in xterm/button.c:
//   BtnCode, EmitButtonCode, EditorButton, SendMousePosition
// send a mouse event:
// regular/utf8: ^[[M Cb Cx Cy
// urxvt: ^[[ Cb ; Cx ; Cy M
// sgr: ^[[ Cb ; Cx ; Cy M/m
// vt300: ^[[ 24(1/3/5)~ [ Cx , Cy ] \r
// locator: CSI P e ; P b ; P r ; P c ; P p & w
// motion example of a left click:
// ^[[M 3<^[[M@4<^[[M@5<^[[M@6<^[[M@7<^[[M#7<
// mouseup, mousedown, mousewheel
// left click: ^[[M 3<^[[M#3<
// mousewheel up: ^[[M`3>
    bindMouse() {
        if (this.boundMouse) return;
        this.boundMouse = true;

        let decoder = new StringDecoder('utf8')

        this.program.on('data', (data) => {
            let text = decoder.write(data);
            if (!text) return;
            this.mouseData(text, data);
        });
    }

    private mouseData(s: string, buf: Buffer) {
        let button: number;
        let y: number;
        let x: number;
        let b: number;
        let mod: number;
        const self = this;

        let key: MouseEvent = {
            name: undefined,
            ctrl: false,
            meta: false,
            shift: false
        };

        // XTerm / X10 for buggy VTE
        // VTE can only send unsigned chars and no unicode for coords. This limits
        // them to 0xff. However, normally the x10 protocol does not allow a byte
        // under 0x20, but since VTE can have the bytes overflow, we can consider
        // bytes below 0x20 to be up to 0xff + 0x20. This gives a limit of 287. Since
        // characters ranging from 223 to 248 confuse javascript's utf parser, we
        // need to parse the raw binary. We can detect whether the terminal is using
        // a bugged VTE version by examining the coordinates and seeing whether they
        // are a value they would never otherwise be with a properly implemented x10
        // protocol. This method of detecting VTE is only 99% reliable because we
        // can't check if the coords are 0x00 (255) since that is a valid x10 coord
        // technically.
        const bx = s.charCodeAt(4);
        const by = s.charCodeAt(5);
        if (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d
            && (this.program.isVTE
                || bx >= 65533 || by >= 65533
                || (bx > 0x00 && bx < 0x20)
                || (by > 0x00 && by < 0x20)
                || (buf[4] > 223 && buf[4] < 248 && buf.length === 6)
                || (buf[5] > 223 && buf[5] < 248 && buf.length === 6))) {
            b = buf[3];
            x = buf[4];
            y = buf[5]; // unsigned char overflow.
            if (x < 0x20) x += 0xff;
            if (y < 0x20) y += 0xff;

            // Convert the coordinates into a
            // properly formatted x10 utf8 sequence.
            s = '\x1b[M'
                + String.fromCharCode(b)
                + String.fromCharCode(x)
                + String.fromCharCode(y);
        }

        // XTerm / X10
        let parts = /^\x1b\[M([\x00\u0020-\uffff]{3})/.exec(s);
        if (parts) {
            b = parts[1].charCodeAt(0);
            x = parts[1].charCodeAt(1);
            y = parts[1].charCodeAt(2);

            key.name = 'mouse';
            key.type = 'X10';

            key.raw = [b, x, y, parts[0]];
            key.buf = buf;
            key.x = x - 32;
            key.y = y - 32;

            if (this.program.zero) {
                key.x--
                key.y--
            }

            if (x === 0) key.x = 255;
            if (y === 0) key.y = 255;

            mod = b >> 2;
            key.shift = !!(mod & 1);
            key.meta = !!((mod >> 1) & 1);
            key.ctrl = !!((mod >> 2) & 1);

            b -= 32;

            if ((b >> 6) & 1) {
                key.action = b & 1 ? 'wheeldown' : 'wheelup';
                key.button = 'middle';
            } else if (b === 3) {
                // NOTE: x10 and urxvt have no way
                // of telling which button mouseup used.
                key.action = 'mouseup';
                key.button = this.lastPressedXTermButton || 'unknown';
                this.lastPressedXTermButton = null;
            } else {
                key.action = 'mousedown';
                button = b & 3;
                if (button === 0) {
                    key.button = 'left';
                } else if (button === 1) {
                    key.button = 'middle';
                } else if (button === 2) {
                    key.button = 'right';
                } else {
                    key.button = 'unknown';
                }
                this.lastPressedXTermButton = key.button;
            }

            // Probably a movement.
            // The *newer* VTE gets mouse movements comepletely wrong.
            // This presents a problem: older versions of VTE that get it right might
            // be confused by the second conditional in the if statement.
            // NOTE: Possibly just switch back to the if statement below.
            // none, shift, ctrl, alt
            // gnome: 32, 36, 48, 40
            // xterm: 35, _, 51, _
            // urxvt: 35, _, _, _
            // if (key.action === 'mousedown' && key.button === 'unknown') {
            if (b === 35 || b === 39 || b === 51 || b === 43
                || (this.program.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
                key.button = null
                key.action = 'mousemove';
            }

            self.program.emit('mouse', key);

            return;
        }

        // URxvt
        if (parts = /^\x1b\[(\d+;\d+;\d+)M/.exec(s)) {
            let params = parts[1].split(';');
            b = +params[0];
            x = +params[1];
            y = +params[2];

            key.name = 'mouse';
            key.type = 'urxvt';

            key.raw = [b, x, y, parts[0]];
            key.buf = buf;
            key.x = x;
            key.y = y;

            if (this.program.zero) {
                key.x--
                key.y--
            }

            mod = b >> 2;
            key.shift = !!(mod & 1);
            key.meta = !!((mod >> 1) & 1);
            key.ctrl = !!((mod >> 2) & 1);

            // XXX Bug in urxvt after wheelup/down on mousemove
            // NOTE: This may be different than 128/129 depending
            // on mod keys.
            if (b === 128 || b === 129) {
                b = 67;
            }

            b -= 32;

            if ((b >> 6) & 1) {
                key.action = b & 1 ? 'wheeldown' : 'wheelup';
                key.button = 'middle';
            } else if (b === 3) {
                // NOTE: x10 and urxvt have no way
                // of telling which button mouseup used.
                key.action = 'mouseup';
                key.button = this.lastPressedXTermButton || 'unknown';
                this.lastPressedXTermButton = null;
            } else {
                key.action = 'mousedown';
                button = b & 3;
                if (button === 0) {
                    key.button = 'left';
                } else if (button === 1) {
                    key.button = 'middle';
                } else if (button === 2) {
                    key.button = 'right';
                } else {
                    key.button = 'unknown';
                }
                // NOTE: 0/32 = mousemove, 32/64 = mousemove with left down
                // if ((b >> 1) === 32)
                this.lastPressedXTermButton = key.button;
            }

            // Probably a movement.
            // The *newer* VTE gets mouse movements comepletely wrong.
            // This presents a problem: older versions of VTE that get it right might
            // be confused by the second conditional in the if statement.
            // NOTE: Possibly just switch back to the if statement below.
            // none, shift, ctrl, alt
            // urxvt: 35, _, _, _
            // gnome: 32, 36, 48, 40
            // if (key.action === 'mousedown' && key.button === 'unknown') {
            if (b === 35 || b === 39 || b === 51 || b === 43
                || (this.program.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
                key.button = null;
                key.action = 'mousemove';
            }

            self.program.emit('mouse', key);

            return;
        }

        // SGR
        if (parts = /^\x1b\[<(\d+;\d+;\d+)([mM])/.exec(s)) {
            const down = parts[2] === 'M';
            let params = parts[1].split(';');
            b = +params[0];
            x = +params[1];
            y = +params[2];

            key.name = 'mouse';
            key.type = 'sgr';

            key.raw = [b, x, y, parts[0]];
            key.buf = buf;
            key.x = x;
            key.y = y;

            if (this.program.zero) {
                key.x--
                key.y--
            }

            mod = b >> 2;
            key.shift = !!(mod & 1);
            key.meta = !!((mod >> 1) & 1);
            key.ctrl = !!((mod >> 2) & 1);

            if ((b >> 6) & 1) {
                key.action = b & 1 ? 'wheeldown' : 'wheelup';
                key.button = 'middle';
            } else {
                key.action = down
                    ? 'mousedown'
                    : 'mouseup';
                button = b & 3;
                if (button === 0) {
                    key.button = 'left';
                } else if (button === 1) {
                    key.button = 'middle';
                } else if (button === 2) {
                    key.button = 'right';
                } else {
                    key.button = 'unknown';
                }
            }

            // Probably a movement.
            // The *newer* VTE gets mouse movements comepletely wrong.
            // This presents a problem: older versions of VTE that get it right might
            // be confused by the second conditional in the if statement.
            // NOTE: Possibly just switch back to the if statement below.
            // none, shift, ctrl, alt
            // xterm: 35, _, 51, _
            // gnome: 32, 36, 48, 40
            // if (key.action === 'mousedown' && key.button === 'unknown') {
            if (b === 35 || b === 39 || b === 51 || b === 43
                || (this.program.isVTE && (b === 32 || b === 36 || b === 48 || b === 40))) {
                key.action = 'mousemove';
                key.button = null
            }

            self.program.emit('mouse', key);

            return;
        }

        // DEC
        // The xterm mouse documentation says there is a
        // `<` prefix, the DECRQLP says there is no prefix.
        if (parts = /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.exec(s)) {
            let params = parts[1].split(';');
            b = +params[0];
            x = +params[1];
            y = +params[2];
            const page = +params[3];
            key.name = 'mouse';
            key.type = 'dec';

            key.raw = [b, x, y, parts[0]];
            key.buf = buf;
            key.x = x;
            key.y = y;
            key.page = page;

            if (this.program.zero) {
                key.x--
                key.y--
            }

            key.action = b === 3
                ? 'mouseup'
                : 'mousedown';

            if (b === 2) {
                key.button = 'left';
            } else if (b === 4) {
                key.button = 'middle';
            } else if (b === 6) {
                key.button = 'right';
            } else {
                key.button = 'unknown';
            }

            self.program.emit('mouse', key);

            return;
        }

        // vt300
        if (parts = /^\x1b\[24([0135])~\[(\d+),(\d+)]\r/.exec(s)) {
            b = +parts[1];
            x = +parts[2];
            y = +parts[3];

            key.name = 'mouse';
            key.type = 'vt300';

            key.raw = [b, x, y, parts[0]];
            key.buf = buf;
            key.x = x;
            key.y = y;

            if (this.program.zero) {
                key.x--
                key.y--;
            }

            key.action = 'mousedown';
            if (b === 1) {
                key.button = 'left';
            } else if (b === 2) {
                key.button = 'middle';
            } else if (b === 5) {
                key.button = 'right';
            } else {
                key.button = 'unknown';
            }

            self.program.emit('mouse', key);

            return;
        }

        if (parts = /^\x1b\[([OI])/.exec(s)) {
            key.action = parts[1] === 'I'
                ? 'focus'
                : 'blur';

            self.program.emit('mouse', key);
            self.program.emit(key.action);

            return;
        }
    }
}