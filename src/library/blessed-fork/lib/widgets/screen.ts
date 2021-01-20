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
import {Framebuffer} from "../framebuffer";

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
    program?: Program;
    cursor?: BlessedCursorConfig
    smartCSR?: boolean
    fastCSR?: boolean
    useBCE?: boolean
    fullUnicode?: boolean
    sendFocus?: boolean
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
    public _buf: string;
    public _ci: any;
    public _listenedMouse: any;
    public debugLog: any;
    public _listenedKeys: any;
    public _cursorBlink: any;
    public _needsClickableSort: any;
    public mouseDown: any;
    public cursor: BlessedCursorConfig
    public clickableElements: Element[];
    public keyableElements: Element[];
    public options: ScreenConfig
    public framebuffer: Framebuffer

    /**
     * Screen
     */
    constructor(options: ScreenConfig) {

        options = options || {};

        super(options);

        this.framebuffer = new Framebuffer(this)
        this.options = options
        this.detached = false
        this.screen = this

        let self = this;

        Screen.bind(this);

        this.program = options.program;

        if (this.program) {
            this.program.setupTput();
            this.program.useBuffer = true;
            this.program.zero = true;
        } else {
            this.program = new Program({
                input: options.input,
                output: options.output,
                log: options.log,
                debug: options.debug,
                dump: options.dump,
                terminal: options.terminal,
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

        this.cursor = options.cursor || { shape: 'block' }

        this.program.on('resize', () => {
            this.position.width = this.getwidth()
            this.position.height = this.getheight()
            this.framebuffer.resize(this.position.width, this.position.height)

            for(let child of this.children) {
                child.onResize()
            }

            this.render();
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

        this.program.on("cursorHide", () => {
            if(this.cursor.artificial) {
                if(this.renders) this.render()
            }
        })

        this.program.on("cursorShow", () => {
            if(this.cursor.artificial) {
                if(this.renders) this.render()
            }
        })

        this.setMaxListeners(Infinity);

        this.enter();

        this.type = 'screen';
    }

    enter() {
        if (this.program.isAlt) return;

        if(this.options.cursor) {
            if (this.options.cursor.shape) {
                this.cursorShape(this.cursor.shape, this.cursor.blink);
            }
            if (this.options.cursor.color) {
                this.cursorColor(this.cursor.color);
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

        this.position.width = this.getwidth()
        this.position.height = this.getheight()
        this.framebuffer.resize(this.position.width, this.position.height)

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
        this.framebuffer.resize(this.position.width, this.position.height)
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

            for (; i < self.clickableElements.length; i++) {
                el = self.clickableElements[i];

                if (el.detached || !el.isVisible()) {
                    continue;
                }

                if (data.x >= el.getaleft() && data.x < el.getaright()
                    && data.y >= el.getatop() && data.y < el.getaright()) {
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

            this.emit('keypress', ch, key)
            this.emit('key ' + key.full, ch, key)

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

        this.framebuffer.draw(0, this.framebuffer.lines.length - 1);

        // XXX Workaround to deal with cursor pos before the screen has rendered and
        // lpos is not reliable (stale).
        let focused = this.getfocused()

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
            this.framebuffer.lines.splice(y, 0, this.blankLine());
            this.framebuffer.lines.splice(j, 1);
            this.framebuffer.oldlines.splice(y, 0, this.blankLine());
            this.framebuffer.oldlines.splice(j, 1);
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
            this.framebuffer.lines.splice(j, 0, this.blankLine());
            this.framebuffer.lines.splice(y, 1);
            this.framebuffer.oldlines.splice(j, 0, this.blankLine());
            this.framebuffer.oldlines.splice(y, 1);
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
            this.framebuffer.lines.splice(j, 0, this.blankLine());
            this.framebuffer.lines.splice(y, 1);
            this.framebuffer.oldlines.splice(j, 0, this.blankLine());
            this.framebuffer.oldlines.splice(y, 1);
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
            this.framebuffer.lines.splice(j, 0, this.blankLine());
            this.framebuffer.lines.splice(y, 1);
            this.framebuffer.oldlines.splice(j, 0, this.blankLine());
            this.framebuffer.oldlines.splice(y, 1);
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

        let x1 = el.getaleft()
        let x2 = el.getaright()
        let y1 = el.getatop()
        let y2 = el.getabottom()

        if (x1 <= 0 && x2 >= this.getwidth()) {
            return true;
        }

        if (this.options.fastCSR) {
            // Maybe just do this instead of parsing.
            if (y1 < 0) return false;
            if (y2 > this.getheight()) return false;
            return this.getwidth() - (x2 - x1) < 40;
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
        // if ((pos.y2 - el.ibottom) - (pos.y1 + el.itop) <= 1) {
        //   return pos._cleanSides = false;
        // }

        let contentTop = y1 + el.getitop()
        let contentBottom = y2 - el.getibottom()
        let first
        let ch

        if (y1 < 0) return false;
        if (y2 > this.getheight()) return false;
        if (x1 - 1 < 0) return true;
        if (x2 > this.getwidth()) return true;

        for (let x = x1 - 1; x >= 0; x--) {
            if (!this.framebuffer.oldlines[contentTop]) break;
            first = this.framebuffer.oldlines[contentTop][x];
            for (let y = contentTop; y < contentBottom; y++) {
                if (!this.framebuffer.oldlines[y] || !this.framebuffer.oldlines[y][x]) break;
                ch = this.framebuffer.oldlines[y][x];
                if (ch[0] !== first[0] || ch[1] !== first[1]) {
                    return false;
                }
            }
        }

        for (let x = x2; x < this.getwidth(); x++) {
            if (!this.framebuffer.oldlines[contentTop]) break;
            first = this.framebuffer.oldlines[y1][x];
            for (let y = contentTop; y < contentBottom; y++) {
                if (!this.framebuffer.oldlines[y] || !this.framebuffer.oldlines[y][x]) break;
                ch = this.framebuffer.oldlines[y][x];
                if (ch[0] !== first[0] || ch[1] !== first[1]) {
                    return false;
                }
            }
        }

        return true;
    }

    focusOffset(offset: number) {
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

    _focus(self: Element, old: Element) {
        // // Find a scrollable ancestor if we have one.
        // var el = self;
        // while (el = el.parent) {
        //     if (el) break;
        // }
        //
        // // If we're in a scrollable element,
        // // automatically scroll to the focused element.
        // if (el && !el.detached) {
        //     // NOTE: This is different from the other "visible" values - it needs the
        //     // visible height of the scrolling element itself, not the element within
        //     // it.
        //     var visible = self.screen.getheight() - el.getatop() - el.getitop() - el.getabottom() - el.getibottom();
        //     if (self.getrtop() < el.childBase) {
        //         el.scrollTo(self.getrtop());
        //         self.screen.render();
        //     } else if (self.getrtop() + self.getheight() - self.getibottom() > el.childBase + visible) {
        //         // Explanation for el.itop here: takes into account scrollable elements
        //         // with borders otherwise the element gets covered by the bottom border:
        //         el.scrollTo(self.getrbottom() - (el.getheight() - self.getheight()) + el.getitop(), true);
        //         self.screen.render();
        //     }
        // }

        if (old) {
            old.emit('blur', self);
        }

        self.emit('focus', old);
    }

    clearRegion(x1: number, x2: any, y1: any, y2: any, override?: boolean) {
        return this.fillRegion(this.dattr, ' ', x1, x2, y1, y2, override);
    }

    fillRegion(attr: number, ch: string, x1: number, x2: number, y1: number, y2: number, override?: boolean) {
        let lines = this.framebuffer.lines
            , cell
            , xx;

        if (x1 < 0) x1 = 0;
        if (y1 < 0) y1 = 0;

        for (; y1 < y2; y1++) {
            if (!lines[y1]) break;
            for (xx = x1; xx < x2; xx++) {
                cell = lines[y1][xx];
                if (!cell) break;
                if (override || attr !== cell[0] || ch !== cell[1]) {
                    lines[y1][xx][0] = attr;
                    lines[y1][xx][1] = ch;
                    lines[y1].dirty = true;
                }
            }
        }
    }

    key(key: string | string[], listener: () => void) {
        return this.program.key.apply(this, arguments);
    }

    onceKey(key: string | string[], listener: () => void) {
        return this.program.onceKey.apply(this, arguments);
    }

    unkey(key: string | string[], listener: () => void) {
        return this.program.unkey.apply(this, arguments);
    }

    removeKey(key: string | string[], listener: () => void) {
        return this.program.unkey.apply(this, arguments);
    }

    copyToClipboard(text: string) {
        return this.program.copyToClipboard(text);
    }

    cursorShape(shape: BlessedCursorShape, blink: boolean) {
        let self = this;

        this.cursor.shape = shape || 'block';
        this.cursor.blink = blink || false;

        if (this.cursor.artificial) {
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

    getaleft(): number {
        return 0
    }

    getaright(): number {
        return 0
    }

    getatop(): number {
        return 0
    }

    getabottom(): number {
        return 0
    }
}