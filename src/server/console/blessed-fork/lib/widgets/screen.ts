/**
 * screen.js - screen node for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import cp from 'child_process';
import colors, {TTYColor} from '../colors';
import * as unicode from '../unicode';

var nextTick = global.setImmediate || process.nextTick.bind(process);

import {Node, NodeConfig} from './node';
import { Element } from './element';
import Tput from "../terminal/tput";
import {utoa} from "../terminal/characters";
import Program from "../program";
import * as tty from "tty"
import {BlessedCursorShape, BlessedCursorConfig} from "../cursor";

interface ScreenConfig extends NodeConfig {
    title?: string;
    tabSize?: number;
    autoPadding?: boolean;
    terminal?: string;
    dump?: boolean;
    debug?: boolean;
    log?: string;
    output?: tty.WriteStream;
    input?: tty.ReadStream;
    forceUnicode?: boolean;
    program?: Program;
    cursor?: BlessedCursorConfig
}

export interface BlessedEvent {
    event?: string
    code?: string
    /// Event name
    name?: string

    /// Terminal type
    type?: string

    ctrl?: boolean
    meta?: boolean
    shift?: boolean
}

export interface BlessedKeyEvent extends BlessedEvent {
    sequence?: string
    ch?: string
    full?: string
}

export interface BlessedMouseEvent extends BlessedEvent {
    page?: number;
    raw?: any
    buf?: Buffer
    x?: number
    y?: number
    button?: string
    action?: string
}

export type ScreenLine = [number, string][] & { dirty: boolean }

export class Screen extends Node {

    static instances: Screen[] = []
    static total: number = 0
    static global: Screen = null
    static _bound: boolean

    public program: Program;
    public tput: Tput;
    public autoPadding: boolean;
    public tabc: any;
    public dockBorders: any;
    public _unicode: any;
    public fullUnicode: any;
    public dattr: number;
    public renders: any;
    public padding: any;
    public hover: any;
    public history: Element[];
    public grabKeys: any;
    public lockKeys: any;
    public _buf: any;
    public _ci: any;
    public _listenedMouse: any;
    public debugLog: any;
    public _listenedKeys: any;
    public lines: ScreenLine[];
    public olines: any;
    public _cursorBlink: any;
    public _needsClickableSort: any;
    public mouseDown: any;
    public cursor: BlessedCursorConfig
    public clickableElements: Element[];
    public keyableElements: Element[];

    /**
     * Screen
     */
    constructor(options: ScreenConfig) {

        options = options || {};

        super(options);

        this.detached = false
        this.screen = this

        let self = this;

        Screen.bind(this);

        this.program = options.program;``

        if (this.program) {
            this.program.setupTput();
            this.program.useBuffer = true;
            this.program.zero = true;
            if (options.forceUnicode != null) {
                this.program.tput.features.unicode = options.forceUnicode;
                this.program.tput.unicode = options.forceUnicode;
            }
        } else {
            this.program = new Program({
                input: options.input,
                output: options.output,
                log: options.log,
                debug: options.debug,
                dump: options.dump,
                terminal: options.terminal,
                forceUnicode: options.forceUnicode,
                tput: true,
                buffer: true,
                zero: true
            });
        }

        this.tput = this.program.tput;
        this.autoPadding = options.autoPadding !== false;
        this.tabc = Array((options.tabSize || 4) + 1).join(' ');

        this._unicode = this.tput.terminfo.features.unicode || this.tput.terminfo.numbers["U8"] === 1;
        this.fullUnicode = this.options.fullUnicode && this._unicode;

        this.dattr = ((0 << 18) | (0x1ff << 9)) | 0x1ff;

        this.renders = 0;

        this.position = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        this.padding = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };

        this.history = [];
        this.clickableElements = [];
        this.keyableElements = [];
        this.grabKeys = false;
        this.lockKeys = false;
        this._buf = '';

        this._ci = -1;

        if (options.title) {
            this.settitle(options.title);
        }

        this.cursor = options.cursor

        this.program.on('resize', function() {
            self.alloc();
            self.render();
            (function emit(el) {
                el.onResize()
                el.children.forEach(emit);
            })(self);
        });

        this.program.on('focus', function() {
            self.emit('focus');
        });

        this.program.on('blur', function() {
            self.emit('blur');
        });

        this.program.on('warning', function(text: string) {
            self.emit('warning', text);
        });

        this.on('newListener', function fn(type: string) {
            if (type === 'keypress' || type.indexOf('key ') === 0 || type === 'mouse') {
                if (type === 'keypress' || type.indexOf('key ') === 0) self._listenKeys();
                if (type === 'mouse') self._listenMouse();
            }
            if (type === 'mouse'
                || type === 'click'
                || type === 'mouseover'
                || type === 'mouseout'
                || type === 'mousedown'
                || type === 'mouseup'
                || type === 'mousewheel'
                || type === 'wheeldown'
                || type === 'wheelup'
                || type === 'mousemove') {
                self._listenMouse();
            }
        });

        this.setMaxListeners(Infinity);

        this.enter();

        this.type = 'screen';
    }

    enter() {
        if (this.program.isAlt) return;
        if (!this.cursor._set) {
            if(this.options.cursor) {
                if (this.options.cursor.shape) {
                    this.cursorShape(this.cursor.shape, this.cursor.blink);
                }
                if (this.options.cursor.color) {
                    this.cursorColor(this.cursor.color);
                }
            }
        }
        if (process.platform === 'win32') {
            try {
                cp.execSync('cls', { stdio: 'ignore', timeout: 1000 });
            } catch (e) {

            }
        }
        this.program.alternateBuffer();
        this.program._write(this.program.tput.terminfo.methods.keypad_xmit())
        this.program.setScrollRegion(0, this.getheight() - 1);
        this.program.hideCursor();
        this.program.cursorPos(0, 0);
        // We need this for tmux now:
        if (this.tput.terminfo.strings.ena_acs) {
            this.program._write(this.tput.terminfo.methods.enacs());
        }
        this.alloc();
    }

    leave() {
        if (!this.program.isAlt) return;
        this.program._write(this.program.tput.terminfo.methods.keypad_local())
        if (this.program.scrollTop !== 0
            || this.program.scrollBottom !== this.getheight() - 1) {
            this.program.setScrollRegion(0, this.getheight() - 1);
        }
        // XXX For some reason if alloc/clear() is before this
        // line, it doesn't work on linux console.
        this.program.showCursor();
        this.alloc();
        if (this._listenedMouse) {
            this.program.disableMouse();
        }
        this.program.normalBuffer();
        this.resetCursor();
        this.program.flush();
        if (process.platform === 'win32') {
            try {
                cp.execSync('cls', { stdio: 'ignore', timeout: 1000 });
            } catch (e) {

            }
        }
    }

    destroy() {
        this.leave();

        var index = Screen.instances.indexOf(this);
        if (~index) {
            Screen.instances.splice(index, 1);
            Screen.total--;

            Screen.global = Screen.instances[0];

            if (Screen.total === 0) {
                Screen.global = null;

                process.removeListener('uncaughtException', Screen._exceptionHandler);
                process.removeListener('exit', Screen._exitHandler);
            }

            this.destroyed = true;
            this.emit('destroy');
            super.destroy();
        }

        this.program.destroy();
    }

    log() {
        return this.program.log.apply(this.program, arguments);
    }

    debug() {
        if (this.debugLog) {
            this.debugLog.log.apply(this.debugLog, arguments);
        }
        return this.program.debug.apply(this.program, arguments);
    }

    _unlistenMouse(el?: Element) {
        let i = this.clickableElements.indexOf(el);
        if (~i) this.clickableElements.splice(i, 1);
    }

    _listenMouse(el?: Element) {
        var self = this;

        if (el && !~this.clickableElements.indexOf(el)) {
            el.isClickable = true;
            this.clickableElements.push(el);
        }

        if (this._listenedMouse) return;
        this._listenedMouse = true;

        this.program.enableMouse();
        if (this.options.sendFocus) {
            this.program.setMouse({ sendFocus: true }, true);
        }

        this.on('render', function() {
            self._needsClickableSort = true;
        });

        this.program.on('mouse', function(data: BlessedMouseEvent) {
            if (self.lockKeys) return;

            if (self._needsClickableSort) {

                self.clickableElements = self.clickableElements.sort(function(a, b) {
                    return b.index - a.index;
                });
                self._needsClickableSort = false;
            }

            var i = 0
                , el
                , set
                , pos;

            for (; i < self.clickableElements.length; i++) {
                el = self.clickableElements[i];

                if (el.detached || !el.isVisible()) {
                    continue;
                }

                // if (self.grabMouse && self.focused !== el
                //     && !el.hasAncestor(self.focused)) continue;

                pos = el.lpos;
                if (!pos) continue;

                if (data.x >= pos.xi && data.x < pos.xl
                    && data.y >= pos.yi && data.y < pos.yl) {
                    el.emit('mouse', data);
                    if (data.action === 'mousedown') {
                        self.mouseDown = el;
                    } else if (data.action === 'mouseup') {
                        (self.mouseDown || el).emit('click', data);
                        self.mouseDown = null;
                    } else if (data.action === 'mousemove') {
                        if (self.hover && el.index > self.hover.index) {
                            set = false;
                        }
                        if (self.hover !== el && !set) {
                            if (self.hover) {
                                self.hover.emit('mouseout', data);
                            }
                            el.emit('mouseover', data);
                            self.hover = el;
                        }
                        set = true;
                    }
                    el.emit(data.action, data);
                    break;
                }
            }

            // Just mouseover?
            if ((data.action === 'mousemove'
                || data.action === 'mousedown'
                || data.action === 'mouseup')
                && self.hover
                && !set) {
                self.hover.emit('mouseout', data);
                self.hover = null;
            }

            self.emit('mouse', data);
            self.emit(data.action, data);
        });
    }

    enableMouse(el: Element) {
        this._listenMouse(el);
    }

    _unlistenKeys(el?: Element) {
        let i = this.keyableElements.indexOf(el);
        if (~i) this.keyableElements.splice(i, 1);
    }

    _listenKeys(el?: Element) {
        if (el && !~this.keyableElements.indexOf(el)) {
            el.isKeyable = true;
            this.keyableElements.push(el);
        }

        if (this._listenedKeys) return;
        this._listenedKeys = true;

        // NOTE: The event emissions used to be reversed:
        // element + screen
        // They are now:
        // screen + element
        // After the first keypress emitted, the handler
        // checks to make sure grabKeys, lockKeys, and focused
        // weren't changed, and handles those situations appropriately.
        this.program.on('keypress', (ch: string, key: BlessedKeyEvent) => {

            let focused = this.getfocused()
            let grabKeys = this.grabKeys;

            // If something changed from the screen key handler, stop.
            if (this.grabKeys !== grabKeys || this.lockKeys) {
                return;
            }

            if (focused && focused.isKeyable) {
                focused.emit('keypress', ch, key);
                focused.emit('key ' + key.full, ch, key);
            }
        });
    }

    enableKeys(el: Element) {
        this._listenKeys(el);
    }

    enableInput(el: Element) {
        this._listenMouse(el);
        this._listenKeys(el);
    }

    alloc(dirty?: boolean) {
        var x, y;

        let width = this.getwidth()
        let height = this.getheight()

        this.lines = [];
        for (y = 0; y < height; y++) {
            this.lines[y] = [] as ScreenLine;
            for (x = 0; x < width; x++) {
                this.lines[y][x] = [this.dattr, ' '];
            }
            this.lines[y].dirty = !!dirty;
        }

        this.olines = [];
        for (y = 0; y < height; y++) {
            this.olines[y] = [];
            for (x = 0; x < width; x++) {
                this.olines[y][x] = [this.dattr, ' '];
            }
        }

        this.program.clear();
    }

    render() {
        var self = this;

        if (this.destroyed) return;

        this.emit('prerender');

        // TODO: Possibly get rid of .dirty altogether.
        // TODO: Could possibly drop .dirty and just clear the `lines` buffer every
        // time before a screen.render. This way clearRegion doesn't have to be
        // called in arbitrary places for the sake of clearing a spot where an
        // element used to be (e.g. when an element moves or is hidden). There could
        // be some overhead though.
        // this.screen.clearRegion(0, this.cols, 0, this.rows);
        this._ci = 0;
        this.children.forEach(function(el) {
            el.index = self._ci++;
            //el._rendering = true;
            el.render();
            //el._rendering = false;
        });
        this._ci = -1;

        this.draw(0, this.lines.length - 1);

        // XXX Workaround to deal with cursor pos before the screen has rendered and
        // lpos is not reliable (stale).
        let focused = this.getfocused()
        if (focused && focused._updateCursor) {
            focused._updateCursor(true);
        }

        this.renders++;

        this.emit('render');
    }

    blankLine(ch?: string, dirty?: boolean): ScreenLine {
        let out: ScreenLine = [] as ScreenLine;
        let width = this.getwidth()
        for (var x = 0; x < width; x++) {
            out[x] = [this.dattr, ch || ' '];
        }
        out.dirty = dirty;
        return out;
    }

    insertLine(n: number, y: number, top: number, bottom: number) {
        // if (y === top) return this.insertLineNC(n, y, top, bottom);

        if (!this.tput.terminfo.strings.change_scroll_region
            || !this.tput.terminfo.strings.delete_line
            || !this.tput.terminfo.strings.insert_line) return;

        this._buf += this.tput.terminfo.methods.csr(top, bottom);
        this._buf += this.tput.terminfo.methods.cup(y, 0);
        this._buf += this.tput.terminfo.methods.il(n);
        this._buf += this.tput.terminfo.methods.csr(0, this.getheight() - 1);

        var j = bottom + 1;

        while (n--) {
            this.lines.splice(y, 0, this.blankLine());
            this.lines.splice(j, 1);
            this.olines.splice(y, 0, this.blankLine());
            this.olines.splice(j, 1);
        }
    }

    deleteLine(n: number, y: number, top: number, bottom: number) {
        // if (y === top) return this.deleteLineNC(n, y, top, bottom);

        if (!this.tput.terminfo.strings.change_scroll_region
            || !this.tput.terminfo.strings.delete_line
            || !this.tput.terminfo.strings.insert_line) return;

        this._buf += this.tput.terminfo.methods.csr(top, bottom);
        this._buf += this.tput.terminfo.methods.cup(y, 0);
        this._buf += this.tput.terminfo.methods.dl(n);
        this._buf += this.tput.terminfo.methods.csr(0, this.getheight() - 1);

        var j = bottom + 1;

        while (n--) {
            this.lines.splice(j, 0, this.blankLine());
            this.lines.splice(y, 1);
            this.olines.splice(j, 0, this.blankLine());
            this.olines.splice(y, 1);
        }
    }

    // This is how ncurses does it.
    // Scroll down (up cursor-wise).
    // This will only work for top line deletion as opposed to arbitrary lines.
    insertLineNC(n: number, y: number, top: number, bottom: number) {
        if (!this.tput.terminfo.strings.change_scroll_region
            || !this.tput.terminfo.strings.delete_line) return;

        this._buf += this.tput.terminfo.methods.csr(top, bottom);
        this._buf += this.tput.terminfo.methods.cup(top, 0);
        this._buf += this.tput.terminfo.methods.dl(n);
        this._buf += this.tput.terminfo.methods.csr(0, this.getheight() - 1);

        var j = bottom + 1;

        while (n--) {
            this.lines.splice(j, 0, this.blankLine());
            this.lines.splice(y, 1);
            this.olines.splice(j, 0, this.blankLine());
            this.olines.splice(y, 1);
        }
    }

    // This is how ncurses does it.
    // Scroll up (down cursor-wise).
    // This will only work for bottom line deletion as opposed to arbitrary lines.
    deleteLineNC(n: number, y: number, top: number, bottom: number) {
        if (!this.tput.terminfo.strings.change_scroll_region
            || !this.tput.terminfo.strings.delete_line) return;

        this._buf += this.tput.terminfo.methods.csr(top, bottom);
        this._buf += this.tput.terminfo.methods.cup(bottom, 0);
        this._buf += Array(n + 1).join('\n');
        this._buf += this.tput.terminfo.methods.csr(0, this.getheight() - 1);

        var j = bottom + 1;

        while (n--) {
            this.lines.splice(j, 0, this.blankLine());
            this.lines.splice(y, 1);
            this.olines.splice(j, 0, this.blankLine());
            this.olines.splice(y, 1);
        }
    }

    insertBottom(top: number, bottom: number): void {
        this.deleteLine(1, top, top, bottom);
    }

    insertTop(top: number, bottom: number): void {
        this.insertLine(1, top, top, bottom);
    }

    deleteBottom(top: number, bottom: number): void {
        this.clearRegion(0, this.getwidth(), bottom, bottom);
    }

    deleteTop(top: number, bottom: number): void {
        // Same as: return this.insertBottom(top, bottom);
        this.deleteLine(1, top, top, bottom);
    }

    // Parse the sides of an element to determine
    // whether an element has uniform cells on
    // both sides. If it does, we can use CSR to
    // optimize scrolling on a scrollable element.
    // Not exactly sure how worthwile this is.
    // This will cause a performance/cpu-usage hit,
    // but will it be less or greater than the
    // performance hit of slow-rendering scrollable
    // boxes with clean sides?
    cleanSides(el: Element) {
        var pos = el.lpos;

        if (!pos) {
            return false;
        }

        if (pos._cleanSides != null) {
            return pos._cleanSides;
        }

        if (pos.xi <= 0 && pos.xl >= this.getwidth()) {
            return pos._cleanSides = true;
        }

        if (this.options.fastCSR) {
            // Maybe just do this instead of parsing.
            if (pos.yi < 0) return pos._cleanSides = false;
            if (pos.yl > this.getheight()) return pos._cleanSides = false;
            if (this.getwidth() - (pos.xl - pos.xi) < 40) {
                return pos._cleanSides = true;
            }
            return pos._cleanSides = false;
        }

        if (!this.options.smartCSR) {
            return false;
        }

        // The scrollbar can't update properly, and there's also a
        // chance that the scrollbar may get moved around senselessly.
        // NOTE: In pratice, this doesn't seem to be the case.
        // if (this.scrollbar) {
        //   return pos._cleanSides = false;
        // }

        // Doesn't matter if we're only a height of 1.
        // if ((pos.yl - el.ibottom) - (pos.yi + el.itop) <= 1) {
        //   return pos._cleanSides = false;
        // }

        let yi = pos.yi + el.getitop()
        let yl = pos.yl - el.getibottom()
        let first
        let ch

        if (pos.yi < 0) return pos._cleanSides = false;
        if (pos.yl > this.getheight()) return pos._cleanSides = false;
        if (pos.xi - 1 < 0) return pos._cleanSides = true;
        if (pos.xl > this.getwidth()) return pos._cleanSides = true;

        for (let x = pos.xi - 1; x >= 0; x--) {
            if (!this.olines[yi]) break;
            first = this.olines[yi][x];
            for (let y = yi; y < yl; y++) {
                if (!this.olines[y] || !this.olines[y][x]) break;
                ch = this.olines[y][x];
                if (ch[0] !== first[0] || ch[1] !== first[1]) {
                    return pos._cleanSides = false;
                }
            }
        }

        for (let x = pos.xl; x < this.getwidth(); x++) {
            if (!this.olines[yi]) break;
            first = this.olines[yi][x];
            for (let y = yi; y < yl; y++) {
                if (!this.olines[y] || !this.olines[y][x]) break;
                ch = this.olines[y][x];
                if (ch[0] !== first[0] || ch[1] !== first[1]) {
                    return pos._cleanSides = false;
                }
            }
        }

        return pos._cleanSides = true;
    }

    draw(start: number, end: number) {
        // this.emit('predraw');

        let x
        let y
        let line
        let out
        let ch
        let data
        let attr
        let fg
        let bg
        let flags;

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

        if (this._buf) {
            main += this._buf;
            this._buf = '';
        }

        for (y = start; y <= end; y++) {
            line = this.lines[y];
            o = this.olines[y];

            if (!line.dirty && !(this.cursor.artificial && y === this.program.y)) {
                continue;
            }
            line.dirty = false;

            out = '';
            attr = this.dattr;

            for (x = 0; x < line.length; x++) {
                data = line[x][0];
                ch = line[x][1];

                // Render the artificial cursor.
                if (this.cursor.artificial
                    && !this.cursor._hidden
                    && this.cursor._state
                    && x === this.program.x
                    && y === this.program.y) {
                    var cattr = this._cursorAttr(this.cursor, data);
                    if (cattr.ch) ch = cattr.ch;
                    data = cattr.attr;
                }

                // Take advantage of xterm's back_color_erase feature by using a
                // lookahead. Stop spitting out so many damn spaces. NOTE: Is checking
                // the bg for non BCE terminals worth the overhead?
                if (this.options.useBCE
                    && ch === ' '
                    && (this.tput.terminfo.bools.back_color_erase
                        || (data & 0x1ff) === (this.dattr & 0x1ff))
                    && ((data >> 18) & 8) === ((this.dattr >> 18) & 8)) {
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
                            out += this.codeAttr(data);
                            attr = data;
                        }
                        out += this.tput.terminfo.methods.cup(y, x);
                        out += this.tput.terminfo.methods.el();
                        for (xx = x; xx < line.length; xx++) {
                            o[xx][0] = data;
                            o[xx][1] = ' ';
                        }
                        break;
                    }

                    // If there's more than 10 spaces, use EL regardless
                    // and start over drawing the rest of line. Might
                    // not be worth it. Try to use ECH if the terminal
                    // supports it. Maybe only try to use ECH here.
                    // //if (this.tput.terminfo.strings.erase_chars)
                    // if (!clr && neq && (xx - x) > 10) {
                    //   lx = -1, ly = -1;
                    //   if (data !== attr) {
                    //     out += this.codeAttr(data);
                    //     attr = data;
                    //   }
                    //   out += this.tput.cup(y, x);
                    //   if (this.tput.terminfo.strings.erase_chars) {
                    //     // Use erase_chars to avoid erasing the whole line.
                    //     out += this.tput.ech(xx - x);
                    //   } else {
                    //     out += this.tput.el();
                    //   }
                    //   if (this.tput.terminfo.strings.parm_right_cursor) {
                    //     out += this.tput.cuf(xx - x);
                    //   } else {
                    //     out += this.tput.cup(y, xx);
                    //   }
                    //   this.fillRegion(data, ' ',
                    //     x, this.tput.terminfo.strings.erase_chars ? xx : line.length,
                    //     y, y + 1);
                    //   x = xx - 1;
                    //   continue;
                    // }

                    // Skip to the next line if the
                    // rest of the line is already drawn.
                    // if (!neq) {
                    //   for (; xx < line.length; xx++) {
                    //     if (line[xx][0] !== o[xx][0] || line[xx][1] !== o[xx][1]) {
                    //       neq = true;
                    //       break;
                    //     }
                    //   }
                    //   if (!neq) {
                    //     attr = data;
                    //     break;
                    //   }
                    // }
                }

                // Optimize by comparing the real output
                // buffer to the pending output buffer.
                if (data === o[x][0] && ch === o[x][1]) {
                    if (lx === -1) {
                        lx = x;
                        ly = y;
                    }
                    continue;
                } else if (lx !== -1) {
                    if (this.tput.terminfo.strings.parm_right_cursor) {
                        out += y === ly
                            ? this.tput.terminfo.methods.cuf(x - lx)
                            : this.tput.terminfo.methods.cup(y, x);
                    } else {
                        out += this.tput.terminfo.methods.cup(y, x);
                    }
                    lx = -1, ly = -1;
                }
                o[x][0] = data;
                o[x][1] = ch;

                if (data !== attr) {
                    if (attr !== this.dattr) {
                        out += '\x1b[m';
                    }
                    if (data !== this.dattr) {
                        out += '\x1b[';

                        bg = data & 0x1ff;
                        fg = (data >> 9) & 0x1ff;
                        flags = data >> 18;

                        // bold
                        if (flags & 1) {
                            out += '1;';
                        }

                        // underline
                        if (flags & 2) {
                            out += '4;';
                        }

                        // blink
                        if (flags & 4) {
                            out += '5;';
                        }

                        // inverse
                        if (flags & 8) {
                            out += '7;';
                        }

                        // invisible
                        if (flags & 16) {
                            out += '8;';
                        }

                        if (bg !== 0x1ff) {
                            bg = this._reduceColor(bg);
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
                            fg = this._reduceColor(fg);
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

                        out += 'm';
                    }
                }

                // If we find a double-width char, eat the next character which should be
                // a space due to parseContent's behavior.
                if (this.fullUnicode) {
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
                // Maybe remove !this.tput.unicode check, however,
                // this seems to be the way ncurses does it.
                if (this.tput.terminfo.strings.enter_alt_charset_mode
                    && !this.tput.terminfo.features.brokenACS && (this.tput.terminfo.features.acscr[ch] || acs)) {
                    // Fun fact: even if this.tput.brokenACS wasn't checked here,
                    // the linux console would still work fine because the acs
                    // table would fail the check of: this.tput.terminfo.methods.acscr[ch]
                    if (this.tput.terminfo.features.acscr[ch]) {
                        if (acs) {
                            ch = this.tput.terminfo.features.acscr[ch];
                        } else {
                            ch = this.tput.terminfo.methods.smacs()
                                + this.tput.terminfo.features.acscr[ch];
                            acs = true;
                        }
                    } else if (acs) {
                        ch = this.tput.terminfo.methods.rmacs() + ch;
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
                    // if (!this.tput.terminfo.unicode && ch > '~') {
                    if (!this.tput.terminfo.features.unicode && this.tput.terminfo.numbers["U8"] !== 1 && ch > '~') {
                        ch = utoa[ch] || '?';
                    }
                }

                out += ch;
                attr = data;
            }

            if (attr !== this.dattr) {
                out += '\x1b[m';
            }

            if (out) {
                main += this.tput.terminfo.methods.cup(y, 0) + out;
            }
        }

        if (acs) {
            main += this.tput.terminfo.methods.rmacs();
            acs = false;
        }

        if (main) {
            pre = '';
            post = '';

            pre += this.tput.terminfo.methods.sc();
            post += this.tput.terminfo.methods.rc();

            if (!this.program.cursorHidden) {
                pre += this.tput.terminfo.methods.civis();
                post += this.tput.terminfo.methods.cnorm();
            }

            // this.program.flush();
            // this.program._owrite(pre + main + post);
            this.program._write(pre + main + post);
        }

        // this.emit('draw');
    }

    _reduceColor(color: number) {
        return colors.reduce(color, this.tput.terminfo.numbers.max_colors);
    }

// Convert an SGR string to our own attribute format.
    attrCode(code, cur, def) {
        var flags = (cur >> 18) & 0x1ff
            , fg = (cur >> 9) & 0x1ff
            , bg = cur & 0x1ff
            , c
            , i;

        code = code.slice(2, -1).split(';');
        if (!code[0]) code[0] = '0';

        for (i = 0; i < code.length; i++) {
            c = +code[i] || 0;
            switch (c) {
                case 0: // normal
                    bg = def & 0x1ff;
                    fg = (def >> 9) & 0x1ff;
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 1: // bold
                    flags |= 1;
                    break;
                case 22:
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 4: // underline
                    flags |= 2;
                    break;
                case 24:
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 5: // blink
                    flags |= 4;
                    break;
                case 25:
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 7: // inverse
                    flags |= 8;
                    break;
                case 27:
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 8: // invisible
                    flags |= 16;
                    break;
                case 28:
                    flags = (def >> 18) & 0x1ff;
                    break;
                case 39: // default fg
                    fg = (def >> 9) & 0x1ff;
                    break;
                case 49: // default bg
                    bg = def & 0x1ff;
                    break;
                case 100: // default fg/bg
                    fg = (def >> 9) & 0x1ff;
                    bg = def & 0x1ff;
                    break;
                default: // color
                    if (c === 48 && +code[i+1] === 5) {
                        i += 2;
                        bg = +code[i];
                        break;
                    } else if (c === 48 && +code[i+1] === 2) {
                        i += 2;
                        bg = colors.match(+code[i], +code[i+1], +code[i+2]);
                        if (bg === -1) bg = def & 0x1ff;
                        i += 2;
                        break;
                    } else if (c === 38 && +code[i+1] === 5) {
                        i += 2;
                        fg = +code[i];
                        break;
                    } else if (c === 38 && +code[i+1] === 2) {
                        i += 2;
                        fg = colors.match(+code[i], +code[i+1], +code[i+2]);
                        if (fg === -1) fg = (def >> 9) & 0x1ff;
                        i += 2;
                        break;
                    }
                    if (c >= 40 && c <= 47) {
                        bg = c - 40;
                    } else if (c >= 100 && c <= 107) {
                        bg = c - 100;
                        bg += 8;
                    } else if (c === 49) {
                        bg = def & 0x1ff;
                    } else if (c >= 30 && c <= 37) {
                        fg = c - 30;
                    } else if (c >= 90 && c <= 97) {
                        fg = c - 90;
                        fg += 8;
                    } else if (c === 39) {
                        fg = (def >> 9) & 0x1ff;
                    } else if (c === 100) {
                        fg = (def >> 9) & 0x1ff;
                        bg = def & 0x1ff;
                    }
                    break;
            }
        }

        return (flags << 18) | (fg << 9) | bg;
    }

// Convert our own attribute format to an SGR string.
    codeAttr(code: number) {
        var flags = (code >> 18) & 0x1ff
            , fg = (code >> 9) & 0x1ff
            , bg = code & 0x1ff
            , out = '';

        // bold
        if (flags & 1) {
            out += '1;';
        }

        // underline
        if (flags & 2) {
            out += '4;';
        }

        // blink
        if (flags & 4) {
            out += '5;';
        }

        // inverse
        if (flags & 8) {
            out += '7;';
        }

        // invisible
        if (flags & 16) {
            out += '8;';
        }

        if (bg !== 0x1ff) {
            bg = this._reduceColor(bg);
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
            fg = this._reduceColor(fg);
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

    focusOffset(offset) {
        var shown = this.keyableElements.filter(function(el) {
            return !el.detached && el.isVisible();
        }).length;

        if (!shown || !offset) {
            return;
        }

        var i = this.keyableElements.indexOf(this.getfocused());
        if (!~i) return;

        if (offset > 0) {
            while (offset--) {
                if (++i > this.keyableElements.length - 1) i = 0;
                if (this.keyableElements[i].detached || !this.keyableElements[i].isVisible()) offset++;
            }
        } else {
            offset = -offset;
            while (offset--) {
                if (--i < 0) i = this.keyableElements.length - 1;
                if (this.keyableElements[i].detached || !this.keyableElements[i].isVisible()) offset++;
            }
        }

        return this.keyableElements[i].focus();
    }

    focusPrev() {
        return this.focusOffset(-1);
    }

    focusPrevious() {
        return this.focusOffset(-1);
    }

    focusNext() {
        return this.focusOffset(1);
    }

    focusPush(el: Element) {
        if (!el) return;
        var old = this.history[this.history.length - 1];
        if (this.history.length === 10) {
            this.history.shift();
        }
        this.history.push(el);
        this._focus(el, old);
    }

    focusPop() {
        var old = this.history.pop();
        if (this.history.length) {
            this._focus(this.history[this.history.length - 1], old);
        }
        return old;
    }

    rewindFocus() {
        var old = this.history.pop()
            , el;

        while (this.history.length) {
            el = this.history.pop();
            if (!el.detached && el.isVisible()) {
                this.history.push(el);
                this._focus(el, old);
                return el;
            }
        }

        if (old) {
            old.emit('blur');
        }

        return null
    }

    _focus(self, old) {
        // Find a scrollable ancestor if we have one.
        var el = self;
        while (el = el.parent) {
            if (el.scrollable) break;
        }

        // If we're in a scrollable element,
        // automatically scroll to the focused element.
        if (el && !el.detached) {
            // NOTE: This is different from the other "visible" values - it needs the
            // visible height of the scrolling element itself, not the element within
            // it.
            var visible = self.screen.getheight() - el.atop - el.getitop() - el.abottom - el.getibottom();
            if (self.rtop < el.childBase) {
                el.scrollTo(self.rtop);
                self.screen.render();
            } else if (self.rtop + self.getheight() - self.getibottom() > el.childBase + visible) {
                // Explanation for el.itop here: takes into account scrollable elements
                // with borders otherwise the element gets covered by the bottom border:
                el.scrollTo(self.rtop - (el.getheight() - self.getheight()) + el.getitop(), true);
                self.screen.render();
            }
        }

        if (old) {
            old.emit('blur', self);
        }

        self.emit('focus', old);
    }

    clearRegion(xi: number, xl: any, yi: any, yl: any, override?: boolean) {
        return this.fillRegion(this.dattr, ' ', xi, xl, yi, yl, override);
    }

    fillRegion(attr: number, ch: string, xi: number, xl: number, yi: number, yl: number, override: boolean) {
        let lines = this.lines
            , cell
            , xx;

        if (xi < 0) xi = 0;
        if (yi < 0) yi = 0;

        for (; yi < yl; yi++) {
            if (!lines[yi]) break;
            for (xx = xi; xx < xl; xx++) {
                cell = lines[yi][xx];
                if (!cell) break;
                if (override || attr !== cell[0] || ch !== cell[1]) {
                    lines[yi][xx][0] = attr;
                    lines[yi][xx][1] = ch;
                    lines[yi].dirty = true;
                }
            }
        }
    }

    key() {
        return this.program.key.apply(this, arguments);
    }

    onceKey() {
        return this.program.onceKey.apply(this, arguments);
    }

    unkey() {
        return this.program.unkey.apply(this, arguments);
    }

    removeKey() {
        return this.program.unkey.apply(this, arguments);
    }

    sigtstp(callback: () => void) {
        var self = this;
        this.program.sigtstp(function() {
            self.alloc();
            self.render();
            self.program.lrestoreCursor('pause', true);
            if (callback) callback();
        });
    }

    copyToClipboard(text: string) {
        return this.program.copyToClipboard(text);
    }

    cursorShape(shape: BlessedCursorShape, blink: boolean) {
        let self = this;

        this.cursor.shape = shape || 'block';
        this.cursor.blink = blink || false;

        if (this.cursor.artificial) {
            if (!this.program.hideCursor_old) {
                var hideCursor = this.program.hideCursor;
                this.program.hideCursor_old = this.program.hideCursor;
                this.program.hideCursor = function() {
                    hideCursor.call(self.program);
                    self.cursor._hidden = true;
                    if (self.renders) self.render();
                };
            }
            if (!this.program.showCursor_old) {
                var showCursor = this.program.showCursor;
                this.program.showCursor_old = this.program.showCursor;
                this.program.showCursor = function() {
                    self.cursor._hidden = false;
                    if (self.program._exiting) showCursor.call(self.program);
                    if (self.renders) self.render();
                };
            }
            if (!this._cursorBlink) {
                this._cursorBlink = setInterval(function() {
                    if (!self.cursor.blink) return;
                    self.cursor._state ^= 1;
                    if (self.renders) self.render();
                }, 500);
            }
            return true;
        }

        return this.program.cursorShape(this.cursor.shape, this.cursor.blink);
    }

    cursorColor(color: TTYColor) {
        if (color == null) {
            this.cursor.color = null;
            return true
        } else {
            this.cursor.color = color
        }

        if (this.cursor.artificial) {
            return true;
        }

        return this.program.cursorColor(colors.ncolors[this.cursor.color.code]);
    }

    resetCursor() {
        this.cursor.shape = 'block';
        this.cursor.blink = false;
        this.cursor.color = null;

        if (this.cursor.artificial) {
            this.cursor.artificial = false;

            if (this._cursorBlink) {
                clearInterval(this._cursorBlink);
            }
            return true;
        }

        return this.program.resetCursor()
    }

    _cursorAttr(cursor: BlessedCursorConfig, dattr: number) {
        let attr = dattr || this.dattr
        let cattr
        let ch;

        if (cursor.shape === 'line') {
            attr &= ~(0x1ff << 9);
            attr |= 7 << 9;
            ch = '\u2502';
        } else if (cursor.shape === 'underline') {
            attr &= ~(0x1ff << 9);
            attr |= 7 << 9;
            attr |= 2 << 18;
        } else if (cursor.shape === 'block') {
            attr &= ~(0x1ff << 9);
            attr |= 7 << 9;
            attr |= 8 << 18;
        } else if (typeof cursor.shape === 'object' && cursor.shape) {
            cattr = Element.prototype.sattr.call(cursor, cursor.shape);

            if (cursor.shape.bold || cursor.shape.underline
                || cursor.shape.blink || cursor.shape.inverse
                || cursor.shape.invisible) {
                attr &= ~(0x1ff << 18);
                attr |= ((cattr >> 18) & 0x1ff) << 18;
            }

            if (cursor.shape.fg) {
                attr &= ~(0x1ff << 9);
                attr |= ((cattr >> 9) & 0x1ff) << 9;
            }

            if (cursor.shape.bg) {
                attr &= ~(0x1ff << 0);
                attr |= cattr & 0x1ff;
            }

            if (cursor.shape.ch) {
                ch = cursor.shape.ch;
            }
        }

        if (cursor.color != null) {
            attr &= ~(0x1ff << 9);
            attr |= cursor.color.code << 9;
        }

        return {
            ch: ch,
            attr: attr
        };
    }

    static bind(screen: Screen) {
        if (!Screen.global) {
            Screen.global = screen;
        }

        if (!~Screen.instances.indexOf(screen)) {
            Screen.instances.push(screen);
            screen.index = Screen.total;
            Screen.total++;
        }

        if (Screen._bound) return;
        Screen._bound = true;

        process.on('uncaughtException', Screen._exceptionHandler = function(err) {
            if (process.listeners('uncaughtException').length > 1) {
                return;
            }
            Screen.instances.slice().forEach(function(screen) {
                screen.destroy();
            });
            err = err || new Error('Uncaught Exception.');
            console.log(err.stack ? err.stack + '' : err + '');
            nextTick(function() {
                process.exit(1);
            });
        });

        process.on('exit', Screen._exitHandler = function() {
            Screen.instances.slice().forEach(function(screen) {
                screen.destroy();
            });
        });
    }

    _getPos() {
        return this;
    }

    static _exceptionHandler(err: Error) {
        if (process.listeners('uncaughtException').length > 1) {
            return;
        }
        this._exitHandler()
    }

    static _exitHandler() {
        Screen.instances.slice().forEach(function(screen) {
            screen.destroy();
        });
    }

    getwidth(): number {
        return this.program.cols
    }

    getheight(): number {
        return this.program.rows
    }

    gettitle(): string {
        return this.program.title
    }

    settitle(title: string) {
        this.program.setTitle(title)
    }

    getterminal() {
        return this.program.terminal
    }

    getfocused() {
        return this.history[this.history.length - 1];
    }

    setfocused(el: Element) {
        return this.focusPush(el);
    }
}