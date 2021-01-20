/**
 * element.js - base element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import assert from 'assert';
import colors, {TTYColor} from '../colors'
import * as unicode from '../unicode';
import * as helpers from '../helpers';
import {Node, NodeConfig} from "./node"
import { Screen } from './screen'
import {BlessedCursorShapeConfig} from "../cursor";

type ElementHAlign = 'left' | 'center' | 'right'
type ElementVAlign = 'top' | 'middle' | 'bottom'

interface CharStyle {
    transparent?: boolean;
    bold?: boolean
    underline?: boolean
    blink?: boolean
    inverse?: boolean
    invisible?: boolean
    fg?: TTYColor
    bg?: TTYColor
}

interface ElementStyle extends CharStyle {
    border?: ElementBorder
}

interface ElementEdgeOffset {
    left: number
    top: number
    bottom: number
    right: number
}

interface ElementBorder extends CharStyle {
    left?: boolean
    top?: boolean
    bottom?: boolean
    right?: boolean
    type: string
    ch?: string
}

export interface ElementConfig extends NodeConfig {
    noOverflow?: boolean;
    name?: string,
    style?: ElementStyle
    shadow?: boolean
    dockBorders?: boolean
    fixed?: boolean
    align?: ElementHAlign
    valign?: ElementVAlign
    hidden?: boolean
    wrap?: boolean
    ch?: string
    padding?: Partial<ElementEdgeOffset> | number
    clickable?: boolean
    content?: string
    focused?: boolean
}

interface WrappedContent extends Array<string> {
    rtof?: number[];
    ftor?: number[][];
    fake?: string[];
    mwidth?: number;
    width?: number;
    content?: string
    attr?: number[]
    ci?: number[];
}

export class Element extends Node {

    public name: string
    public noOverflow: boolean
    public style: ElementStyle;
    public dockBorders: boolean
    public shadow: boolean
    public hidden: boolean
    public fixed: boolean
    public wrap: boolean
    public ch: string
    public padding: ElementEdgeOffset
    public input: boolean
    public content: string
    public childBase: number
    public _clines: WrappedContent;
    public isClickable: boolean;
    public isKeyable: boolean
    public align: ElementHAlign
    public valign: ElementVAlign

    constructor(options?: ElementConfig) {
        super(options);

        options = options || {};

        this.name = options.name;

        this.noOverflow = options.noOverflow;
        this.dockBorders = options.dockBorders;
        this.shadow = options.shadow;

        this.style = options.style || {};

        this.hidden = options.hidden || false;
        this.fixed = options.fixed || false;
        this.align = options.align || 'left';
        this.valign = options.valign || 'top';
        this.wrap = options.wrap !== false;
        this.fixed = options.fixed;
        this.ch = options.ch || ' ';

        if (typeof options.padding === 'number' || !options.padding) {
            let padding: number = options.padding as number || 0
            this.padding = {
                left: padding,
                top: padding,
                right: padding,
                bottom: padding
            };
        } else {
            this.padding = {
                left: options.padding.left || 0,
                top: options.padding.top || 0,
                right: options.padding.right || 0,
                bottom: options.padding.bottom || 0
            };
        }

        this.setContent(options.content || '', true);

        // TODO: Possibly move this to Node for onScreenEvent('mouse', ...).
        this.on('newListener', (type: string) => {

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
                this.onMouseListener()
            } else if (type === 'keypress' || type.indexOf('key ') === 0) {
                this.onKeyboardListener()
            }
        });

        this.type = 'element';
    }

    onResize() {
        super.onResize()
        this.parseContent();
    }

    onMouseListener() {
        if(this.isClickable) return
        this.isClickable = true
        if(this.screen) this.screen._listenMouse(this)
    }

    onKeyboardListener() {
        if(this.isKeyable) return
        this.isKeyable = true
        if(this.screen) this.screen._listenKeys(this)
    }

    onAttach() {
        super.onAttach()
        this.parseContent();
        if (this.isClickable) this.screen._listenMouse(this);
        if (this.isKeyable) this.screen._listenKeys(this);
    }
c
    onDetach() {
        super.onDetach()
        if(this.isClickable) this.screen._unlistenMouse(this)
        if(this.isKeyable) this.screen._unlistenKeys(this)
    }

    sattr(style: CharStyle, fg?: TTYColor, bg?: TTYColor): number {
        var bold = style.bold
            , underline = style.underline
            , blink = style.blink
            , inverse = style.inverse
            , invisible = style.invisible;

        // if (arguments.length === 1) {
        if (fg == null) {
            fg = style.fg;
        }

        if(bg == null) {
            bg = style.bg;
        }

        let fgCode = fg ? fg.code : 0
        let bgCode = bg ? bg.code : 0

        // return (this.uid << 24)
        //   | ((this.dockBorders ? 32 : 0) << 18)
        let result = ((invisible ? 16 : 0) << 18)
            | ((inverse ? 8 : 0) << 18)
            | ((blink ? 4 : 0) << 18)
            | ((underline ? 2 : 0) << 18)
            | ((bold ? 1 : 0) << 18)
            | (fgCode << 9)
            | bgCode

        return result
    }

    free() {

    }

    hide() {
        if (this.hidden) return;
        this.clearPos();
        this.hidden = true;
        this.emit('hide');
        if (this.screen.getfocused() === this) {
            this.screen.rewindFocus();
        }
    }

    show() {
        if (!this.hidden) return;
        this.hidden = false;
        this.emit('show');
    }

    toggle() {
        return this.hidden ? this.show() : this.hide();
    }

    focus() {
        return this.screen.setfocused(this);
    }

    setContent(content: string, noClear?: boolean) {
        if (!noClear) this.clearPos();
        this.content = content || '';
        this.parseContent();
        this.emit('set content');
    }

    getContent() {
        if (!this._clines) return '';
        return this._clines.fake.join('\n');
    }

    setText(content: string, noClear: boolean) {
        content = content || '';
        content = content.replace(/\x1b\[[\d;]*m/g, '');
        return this.setContent(content, noClear);
    }

    getText() {
        return this.getContent().replace(/\x1b\[[\d;]*m/g, '');
    }

    parseContent(): boolean {
        if(!this.screen) return false
        if (this.detached) return false;

        var width = this.getwidth() - this.getiwidth();
        if (this._clines == null
            || this._clines.width !== width
            || this._clines.content !== this.content) {
            var content = this.content;

            content = content
                .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '')
                .replace(/\x1b(?!\[[\d;]*m)/g, '')
                .replace(/\r\n|\r/g, '\n')
                .replace(/\t/g, this.screen.tabc);

            if (this.screen.fullUnicode) {
                // double-width chars will eat the next char after render. create a
                // blank character after it so it doesn't eat the real next char.
                content = content.replace(unicode.chars.all, '$1\x03');
                // iTerm2 cannot render combining characters properly.
                if (this.screen.program.isiTerm2) {
                    content = content.replace(unicode.chars.combining, '');
                }
            } else {
                // no double-width: replace them with question-marks.
                content = content.replace(unicode.chars.all, '??');
                // delete combining characters since they're 0-width anyway.
                // NOTE: We could drop this, the non-surrogates would get changed to ? by
                // the unicode filter, and surrogates changed to ? by the surrogate
                // regex. however, the user might expect them to be 0-width.
                // NOTE: Might be better for performance to drop!
                content = content.replace(unicode.chars.combining, '');
                // no surrogate pairs: replace them with question-marks.
                content = content.replace(unicode.chars.surrogate, '?');
                // XXX Deduplicate code here:
                // content = helpers.dropUnicode(content);
            }

            this._clines = this._wrapContent(content, width);
            this._clines.width = width;
            this._clines.content = this.content;
            this._clines.attr = this._parseAttr(this._clines);
            this._clines.ci = [];
            this._clines.reduce((total, line) => {
                this._clines.ci.push(total);
                return total + line.length + 1;
            }, 0);

            this._pcontent = this._clines.join('\n');
            this.emit('parsed content');

            return true;
        }

        // Need to calculate this every time because the default fg/bg may change.
        this._clines.attr = this._parseAttr(this._clines) || this._clines.attr;

        return false;
    }

    _parseAttr(lines: string[]) {
        let dattr = this.sattr(this.style)
        let attr = dattr
        let attrs = []
        let line
        let i
        let j
        let c;

        if (lines[0].attr === attr) {
            return null;
        }

        for (j = 0; j < lines.length; j++) {
            line = lines[j];
            attrs[j] = attr;
            for (i = 0; i < line.length; i++) {
                if (line[i] === '\x1b') {
                    if (c = /^\x1b\[[\d;]*m/.exec(line.substring(i))) {
                        attr = this.screen.attrCode(c[0], attr, dattr);
                        i += c[0].length - 1;
                    }
                }
            }
        }

        return attrs;
    }

    _align(line, width, align) {
        if (!align) return line;
        //if (!align && !~line.indexOf('{|}')) return line;

        var cline = line.replace(/\x1b\[[\d;]*m/g, '')
            , len = cline.length
            , s = width - len;

        if (len === 0) return line;
        if (s < 0) return line;

        if (align === 'center') {
            let pad = Array(((s / 2) | 0) + 1).join(' ');
            return pad + line + pad
        } else if (align === 'right') {
            let pad = Array(s + 1).join(' ');
            return pad + line;
        }

        return line;
    }

    _wrapContent(content: string, width: number): WrappedContent {
        let state = this.align
        let wrap = this.wrap
        let margin = 0
        let rtof = []
        let ftor = []
        let out: WrappedContent = []
        let no = 0
            ;

        let lines = content.split('\n');
        if (!content) {
            out.push(content);
            out.rtof = [0];
            out.ftor = [[0]];
            out.fake = lines;
            out.mwidth = 0;
            return out;
        }

        if (width > margin) width -= margin;


        main:
            for (; no < lines.length; no++) {
                var line = lines[no];
                var align = state;
                ftor.push([]);

                // If the string is apparently too long, wrap it.
                while (line.length > width) {
                    // Measure the real width of the string.
                    let total = 0;
                    let i = 0

                    for (; i < line.length; i++) {
                        while (line[i] === '\x1b') {
                            while (line[i] && line[i++] !== 'm') ;
                        }
                        if (!line[i]) break;
                        if (++total === width) {
                            // If we're not wrapping the text, we have to finish up the rest of
                            // the control sequences before cutting off the line.
                            i++;
                            if (!wrap) {
                                let rest = line.substring(i).match(/\x1b\[[^m]*m/g);
                                let joined = rest ? rest.join('') : '';
                                out.push(this._align(line.substring(0, i) + joined, width, align));
                                ftor[no].push(out.length - 1);
                                rtof.push(no);
                                continue main;
                            }
                            if (this.screen.fullUnicode) {
                                // Try to find a character to break on.
                                if (i !== line.length) {
                                    // <XXX>
                                    // Compensate for surrogate length
                                    // counts on wrapping (experimental):
                                    // NOTE: Could optimize this by putting
                                    // it in the parent for loop.
                                    let s = 0
                                    let n = 0
                                    if (unicode.isSurrogate(line, i)) i--;
                                    for (; n < i; n++) {
                                        if (unicode.isSurrogate(line, n)) s++, n++;
                                    }
                                    i += s;
                                    // </XXX>
                                    var j = i; // Break _past_ space. // Break _past_ double-width chars. // Break _past_ surrogate pairs. // Break _past_ combining chars.
                                    while (j > i - 10 && j > 0) {
                                        j--;
                                        if (line[j] === ' '
                                            || line[j] === '\x03'
                                            || (unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03')
                                            || unicode.isCombining(line, j)) {
                                            break;
                                        }
                                    }
                                    if (line[j] === ' '
                                        || line[j] === '\x03'
                                        || (unicode.isSurrogate(line, j - 1) && line[j + 1] !== '\x03')
                                        || unicode.isCombining(line, j)) {
                                        i = j + 1;
                                    }
                                }
                            } else {
                                // Try to find a space to break on.
                                if (i !== line.length) {
                                    j = i;
                                    while (j > i - 10 && j > 0 && line[--j] !== ' ') ;
                                    if (line[j] === ' ') i = j + 1;
                                }
                            }
                            break;
                        }
                    }

                    var part = line.substring(0, i);
                    line = line.substring(i);

                    out.push(this._align(part, width, align));
                    ftor[no].push(out.length - 1);
                    rtof.push(no);

                    // Make sure we didn't wrap the line to the very end, otherwise
                    // we get a pointless empty line after a newline.
                    if (line === '') continue main;

                    // If only an escape code got cut off, at it to `part`.
                    if (/^(?:\x1b[\[\d;]*m)+$/.test(line)) {
                        out[out.length - 1] += line;
                        continue main;
                    }
                }

                out.push(this._align(line, width, align));
                ftor[no].push(out.length - 1);
                rtof.push(no);
            }

        out.rtof = rtof;
        out.ftor = ftor;
        out.fake = lines;

        out.mwidth = out.reduce(function (current, line) {
            line = line.replace(/\x1b\[[\d;]*m/g, '');
            return line.length > current
                ? line.length
                : current;
        }, 0);

        return out;
    }

    enableMouse() {
        this.screen._listenMouse(this);
    }

    enableKeys() {
        this.screen._listenKeys(this);
    }

    enableInput() {
        this.screen._listenMouse(this);
        this.screen._listenKeys(this);
    }

    key(key: string | string[], listener: () => void) {
        return this.screen.program.key.apply(this, arguments);
    }

    onceKey(key: string | string[], listener: () => void) {
        return this.screen.program.onceKey.apply(this, arguments);
    }

    unkey(key: string | string[], listener: () => void) {
        return this.screen.program.unkey.apply(this, arguments);
    }

    removeKey(key: string | string[], listener: () => void) {
        return this.screen.program.unkey.apply(this, arguments);
    }

    setIndex(index: number) {
        if (!this.parent) return;

        if (index < 0) {
            index = this.parent.children.length + index;
        }

        index = Math.max(index, 0);
        index = Math.min(index, this.parent.children.length - 1);

        var i = this.parent.children.indexOf(this);
        if (!~i) return;

        var item = this.parent.children.splice(i, 1)[0];
        this.parent.children.splice(index, 0, item);
    }

    setFront() {
        return this.setIndex(-1);
    }

    setBack() {
        return this.setIndex(0);
    }

    clearPos() {
        if (this.detached) return;

        let x1 = this.getaleft()
        let x2 = x1 + this.getwidth()
        let y1 = this.getatop()
        let y2 = y1 + this.getheight()

        this.screen.clearRegion(x1, x2, y1, y2);
    }

    render() {
        if(this.detached) return

        this._emit('prerender');

        this.parseContent();

        var lines = this.screen.framebuffer.lines
            , x1 = this.getaleft()
            , x2 = this.getaright()
            , y1 = this.getatop()
            , y2 = this.getabottom()
            , x
            , y
            , cell
            , attr
            , ch
            , content = this._pcontent
            , base = this.childBase || 0
            , ci = this._clines.ci[this.childBase || 0]
            , battr
            , dattr
            , c
            , visible
            , i
            , bch = this.ch;

        if (base >= this._clines.ci.length) {
            ci = this._pcontent.length;
        }

        dattr = this.sattr(this.style);
        attr = dattr;

        // If we're in a scrollable text box, check to
        // see which attributes this line starts with.
        if (ci > 0) {
            attr = this._clines.attr[Math.min(base, this._clines.length - 1)];
        }

        if (this.style.border) {
            x1++
            x2--
            y1++
            y2--
        }

        // If we have padding/valign, that means the
        // content-drawing loop will skip a few cells/lines.
        // To deal with this, we can just fill the whole thing
        // ahead of time. This could be optimized.

        let padding = this.padding

        let paddingExists = padding.left ||
                            padding.top ||
                            padding.right ||
                            padding.bottom

        if (paddingExists || (this.valign && this.valign !== 'top')) {
            if (this.style.transparent) {
                for (y = Math.max(y1, 0); y < y2; y++) {
                    if (!lines[y]) break;
                    for (x = Math.max(x1, 0); x < x2; x++) {
                        if (!lines[y][x]) break;
                        lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
                        // lines[y][cursorX][1] = bch;
                        lines[y].dirty = true;
                    }
                }
            } else {
                this.screen.fillRegion(dattr, bch, x1, x2, y1, y2);
            }
        }

        if(paddingExists) {
            x1 += padding.left
            x2 -= padding.right;
            y1 += padding.top
            y2 -= padding.bottom;
        }

        // Determine where to place the text if it's vertically aligned.
        if (this.valign === 'middle' || this.valign === 'bottom') {
            visible = y2 - y1;
            if (this._clines.length < visible) {
                if (this.valign === 'middle') {
                    visible = visible / 2 | 0;
                    visible -= this._clines.length / 2 | 0;
                } else if (this.valign === 'bottom') {
                    visible -= this._clines.length;
                }
                ci -= visible * (x2 - x1);
            }
        }

        // Draw the content and background.
        for (y = y1; y < y2; y++) {
            if (!lines[y]) {
                if (y >= this.screen.getheight() || y2 < this.getibottom()) {
                    break;
                } else {
                    continue;
                }
            }
            for (x = x1; x < x2; x++) {
                cell = lines[y][x];
                if (!cell) {
                    if (x >= this.screen.getwidth() || x2 < this.getiright()) {
                        break;
                    } else {
                        continue;
                    }
                }

                ch = content[ci++] || bch;

                // if (!content[ci] && !coords._contentEnd) {
                //   coords._contentEnd = { cursorX: cursorX - x1, y: y - y1 };
                // }

                // Handle escape codes.
                while (ch === '\x1b') {
                    if (c = /^\x1b\[[\d;]*m/.exec(content.substring(ci - 1))) {
                        ci += c[0].length - 1;
                        attr = this.screen.attrCode(c[0], attr, dattr);

                        ch = content[ci] || bch;
                        ci++;
                    } else {
                        break;
                    }
                }

                // Handle newlines.
                if (ch === '\t') ch = bch;
                if (ch === '\n') {
                    // If we're on the first cell and we find a newline and the last cell
                    // of the last line was not a newline, let's just treat this like the
                    // newline was already "counted".
                    if (x === x1 && y !== y1 && content[ci - 2] !== '\n') {
                        x--;
                        continue;
                    }
                    // We could use fillRegion here, name the
                    // outer loop, and continue to it instead.
                    ch = bch;
                    for (; x < x2; x++) {
                        cell = lines[y][x];
                        if (!cell) break;
                        if (this.style.transparent) {
                            lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
                            if (content[ci]) lines[y][x][1] = ch;
                            lines[y].dirty = true;
                        } else {
                            if (attr !== cell[0] || ch !== cell[1]) {
                                lines[y][x][0] = attr;
                                lines[y][x][1] = ch;
                                lines[y].dirty = true;
                            }
                        }
                    }
                    continue;
                }

                if (this.screen.fullUnicode && content[ci - 1]) {
                    var point = unicode.codePointAt(content, ci - 1);
                    // Handle combining chars:
                    // Make sure they get in the same cell and are counted as 0.
                    if (unicode.combining[point]) {
                        if (point > 0x00ffff) {
                            ch = content[ci - 1] + content[ci];
                            ci++;
                        }
                        if (x - 1 >= x1) {
                            lines[y][x - 1][1] += ch;
                        } else if (y - 1 >= y1) {
                            lines[y - 1][x2 - 1][1] += ch;
                        }
                        x--;
                        continue;
                    }
                    // Handle surrogate pairs:
                    // Make sure we put surrogate pair chars in one cell.
                    if (point > 0x00ffff) {
                        ch = content[ci - 1] + content[ci];
                        ci++;
                    }
                }

                if (this._noFill) continue;

                if (this.style.transparent) {
                    lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
                    if (content[ci]) lines[y][x][1] = ch;
                    lines[y].dirty = true;
                } else {
                    if (attr !== cell[0] || ch !== cell[1]) {
                        lines[y][x][0] = attr;
                        lines[y][x][1] = ch;
                        lines[y].dirty = true;
                    }
                }
            }
        }

        if (this.style.border) {
            x1--
            x2++
            y1--
            y2++
        }

        x1 -= this.padding.left
        x2 += this.padding.right;
        y1 -= this.padding.top
        y2 += this.padding.bottom;

        // Draw the border.
        if (this.style.border) {
            battr = this.sattr(this.style.border);
            y = y1;

            for (x = x1; x < x2; x++) {
                if (!lines[y]) break;
                cell = lines[y][x];
                if (!cell) continue;
                if (this.style.border.type === 'line') {
                    if (x === x1) {
                        ch = '\u250c'; // '┌'
                        if (this.style.border.left) {
                            if (!this.style.border.top) {
                                ch = '\u2502'; // '│'
                            }
                        } else {
                            if (this.style.border.top) {
                                ch = '\u2500'; // '─'
                            } else {
                                continue;
                            }
                        }
                    } else if (x === x2 - 1) {
                        ch = '\u2510'; // '┐'
                        if (this.style.border.right) {
                            if (!this.style.border.top) {
                                ch = '\u2502'; // '│'
                            }
                        } else {
                            if (this.style.border.top) {
                                ch = '\u2500'; // '─'
                            } else {
                                continue;
                            }
                        }
                    } else {
                        ch = '\u2500'; // '─'
                    }
                } else if (this.style.border.type === 'bg') {
                    ch = this.style.border.ch;
                }
                if (!this.style.border.top && x !== x1 && x !== x2 - 1) {
                    ch = ' ';
                    if (dattr !== cell[0] || ch !== cell[1]) {
                        lines[y][x][0] = dattr;
                        lines[y][x][1] = ch;
                        lines[y].dirty = true;
                        continue;
                    }
                }
                if (battr !== cell[0] || ch !== cell[1]) {
                    lines[y][x][0] = battr;
                    lines[y][x][1] = ch;
                    lines[y].dirty = true;
                }
            }
            y = y1 + 1;
            for (; y < y2 - 1; y++) {
                if (!lines[y]) continue;
                let x = x1
                while(true) {
                    cell = lines[y][x];
                    if (cell) {
                        if (this.style.border.left) {
                            if (this.style.border.type === 'line') {
                                ch = '\u2502'; // '│'
                            } else if (this.style.border.type === 'bg') {
                                ch = this.style.border.ch;
                            }
                            if (dattr !== cell[0] || ch !== cell[1]) {
                                lines[y][x][0] = battr;
                                lines[y][x][1] = ch;
                                lines[y].dirty = true;
                            }
                        } else {
                            ch = ' ';
                            if (dattr !== cell[0] || ch !== cell[1]) {
                                lines[y][x][0] = dattr;
                                lines[y][x][1] = ch;
                                lines[y].dirty = true;
                            }
                        }
                    }
                    if(x != x1) break;
                    x = x2 - 1
                }
            }
            y = y2 - 1;

            for (x = x1; x < x2; x++) {
                if (!lines[y]) break;
                cell = lines[y][x];
                if (!cell) continue;
                if (this.style.border.type === 'line') {
                    if (x === x1) {
                        ch = '\u2514'; // '└'
                        if (this.style.border.left) {
                            if (!this.style.border.bottom) {
                                ch = '\u2502'; // '│'
                            }
                        } else {
                            if (this.style.border.bottom) {
                                ch = '\u2500'; // '─'
                            } else {
                                continue;
                            }
                        }
                    } else if (x === x2 - 1) {
                        ch = '\u2518'; // '┘'
                        if (this.style.border.right) {
                            if (!this.style.border.bottom) {
                                ch = '\u2502'; // '│'
                            }
                        } else {
                            if (this.style.border.bottom) {
                                ch = '\u2500'; // '─'
                            } else {
                                continue;
                            }
                        }
                    } else {
                        ch = '\u2500'; // '─'
                    }
                } else if (this.style.border.type === 'bg') {
                    ch = this.style.border.ch;
                }
                if (!this.style.border.bottom && x !== x1 && x !== x2 - 1) {
                    ch = ' ';
                    if (dattr !== cell[0] || ch !== cell[1]) {
                        lines[y][x][0] = dattr;
                        lines[y][x][1] = ch;
                        lines[y].dirty = true;
                    }
                    continue;
                }
                if (battr !== cell[0] || ch !== cell[1]) {
                    lines[y][x][0] = battr;
                    lines[y][x][1] = ch;
                    lines[y].dirty = true;
                }
            }
        }

        if (this.shadow) {
            // right
            y = Math.max(y1 + 1, 0);
            for (; y < y2 + 1; y++) {
                if (!lines[y]) break;
                x = x2;
                for (; x < x2 + 2; x++) {
                    if (!lines[y][x]) break;
                    // lines[y][cursorX][0] = colors.blend(this.dattr, lines[y][cursorX][0]);
                    lines[y][x][0] = colors.blend(lines[y][x][0]);
                    lines[y].dirty = true;
                }
            }
            // bottom
            y = y2;
            for (; y < y2 + 1; y++) {
                if (!lines[y]) break;
                for (x = Math.max(x1 + 1, 0); x < x2; x++) {
                    if (!lines[y][x]) break;
                    // lines[y][cursorX][0] = colors.blend(this.dattr, lines[y][cursorX][0]);
                    lines[y][x][0] = colors.blend(lines[y][x][0]);
                    lines[y].dirty = true;
                }
            }
        }

        this.children.forEach(function (el) {
            if (el.screen._ci !== -1) {
                el.index = el.screen._ci++;
            }
            // if (el.screen._rendering) {
            //   el._rendering = true;
            // }
            el.render();
            // if (el.screen._rendering) {
            //   el._rendering = false;
            // }
        });

        this._emit('render');
    }

    /**
     * Content Methods
     */
    insertLine(i: number, line: string): void
    insertLine(i: number, line: string[]): void
    insertLine(i: number, line: string | string[]) {
        if (typeof line === 'string') line = line.split('\n');

        if (i !== i || i == null) {
            i = this._clines.ftor.length;
        }

        i = Math.max(i, 0);

        while (this._clines.fake.length < i) {
            this._clines.fake.push('');
            this._clines.ftor.push([this._clines.push('') - 1]);
            this._clines.rtof(this._clines.fake.length - 1);
        }

        // NOTE: Could possibly compare the first and last ftor line numbers to see
        // if they're the same, or if they fit in the visible region entirely.
        var start = this._clines.length
            , diff
            , real;

        if (i >= this._clines.ftor.length) {
            real = this._clines.ftor[this._clines.ftor.length - 1];
            real = real[real.length - 1] + 1;
        } else {
            real = this._clines.ftor[i][0];
        }

        for (var j = 0; j < line.length; j++) {
            this._clines.fake.splice(i + j, 0, line[j]);
        }

        this.setContent(this._clines.fake.join('\n'), true);

        if(this.detached) return

        diff = this._clines.length - start;

        if (diff > 0) {

            let height = this.getheight() - this.getiheight()
            let base = this.childBase || 0
            let visible = real >= base && real - base < height;

            if (visible && this.screen.cleanSides(this)) {
                this.screen.insertLine(diff,
                    this.getatop() + this.getitop() + real - base,
                    this.getatop(),
                    this.getabottom() - this.getibottom() - 1);
            }
        }
    }

    deleteLine(i: number, n: number = 1) {

        if (i !== i || i == null) {
            i = this._clines.ftor.length - 1;
        }

        i = Math.max(i, 0);
        i = Math.min(i, this._clines.ftor.length - 1);

        // NOTE: Could possibly compare the first and last ftor line numbers to see
        // if they're the same, or if they fit in the visible region entirely.
        var start = this._clines.length
            , diff
            , real = this._clines.ftor[i][0];

        while (n--) {
            this._clines.fake.splice(i, 1);
        }

        this.setContent(this._clines.fake.join('\n'), true);

        if(this.detached) return

        diff = start - this._clines.length;

        // XXX clearPos() without diff statement?
        var height = 0;

        if (diff > 0) {

            height = this.getheight() - this.getiheight();

            var base = this.childBase || 0
                , visible = real >= base && real - base < height;

            if (visible && this.screen.cleanSides(this)) {
                this.screen.deleteLine(diff,
                    this.getatop() + this.getitop() + real - base,
                    this.getatop(),
                    this.getabottom() - this.getibottom() - 1);
            }
        }

        if (this._clines.length < height) {
            this.clearPos();
        }
    }

    insertTop(line: string) {
        var fake = this._clines.rtof[this.childBase || 0];
        return this.insertLine(fake, line);
    }

    insertBottom(line: string) {
        var h = (this.childBase || 0) + this.getheight() - this.getiheight()
            , i = Math.min(h, this._clines.length)
            , fake = this._clines.rtof[i - 1] + 1;

        return this.insertLine(fake, line);
    }

    deleteTop(n: number) {
        var fake = this._clines.rtof[this.childBase || 0];
        return this.deleteLine(fake, n);
    }

    deleteBottom(n: number) {
        var h = (this.childBase || 0) + this.getheight() - 1 - this.getiheight()
            , i = Math.min(h, this._clines.length - 1)
            , fake = this._clines.rtof[i];

        n = n || 1;

        return this.deleteLine(fake - (n - 1), n);
    }

    setLine(i: number, line: string) {
        i = Math.max(i, 0);
        while (this._clines.fake.length < i) {
            this._clines.fake.push('');
        }
        this._clines.fake[i] = line;
        return this.setContent(this._clines.fake.join('\n'), true);
    }

    setBaseLine(i: number, line: string) {
        var fake = this._clines.rtof[this.childBase || 0];
        return this.setLine(fake + i, line);
    }

    getLine(i: number) {
        i = Math.max(i, 0);
        i = Math.min(i, this._clines.fake.length - 1);
        return this._clines.fake[i];
    }

    getBaseLine(i: number) {
        var fake = this._clines.rtof[this.childBase || 0];
        return this.getLine(fake + i);
    }

    clearLine(i: number) {
        i = Math.min(i, this._clines.fake.length - 1);
        return this.setLine(i, '');
    }

    clearBaseLine(i: number) {
        var fake = this._clines.rtof[this.childBase || 0];
        return this.clearLine(fake + i);
    }

    unshiftLine(line: string) {
        return this.insertLine(0, line);
    }

    shiftLine(n: number) {
        return this.deleteLine(0, n);
    }

    pushLine(line: string) {
        if (!this.content) return this.setLine(0, line);
        return this.insertLine(this._clines.fake.length, line);
    }

    popLine(n: number) {
        return this.deleteLine(this._clines.fake.length - 1, n);
    }

    getLines() {
        return this._clines.fake.slice();
    }

    getScreenLines() {
        return this._clines.slice();
    }

    strWidth(text: string) {
        return this.screen.fullUnicode
            ? unicode.strWidth(text)
            : helpers.dropUnicode(text).length;
    }

    getileft(){
        return (this.style.border ? 1 : 0) + this.padding.left;
        // return (this.style.border && this.style.border.left ? 1 : 0) + this.padding.left;
    }

    getiright(){
        return (this.style.border ? 1 : 0) + this.padding.right;
        // return (this.style.border && this.style.border.right ? 1 : 0) + this.padding.right;
    }

    getibottom(){
        return (this.style.border ? 1 : 0) + this.padding.bottom;
        // return (this.style.border && this.style.border.bottom ? 1 : 0) + this.padding.bottom;
    }

    getiwidth() {
        // return (this.style.border
        //   ? ((this.style.border.left ? 1 : 0) + (this.style.border.right ? 1 : 0)) : 0)
        //   + this.padding.left + this.padding.right;
        return (this.style.border ? 2 : 0) + this.padding.left + this.padding.right;
    }

    getiheight(){
        // return (this.style.border
        //   ? ((this.style.border.top ? 1 : 0) + (this.style.border.bottom ? 1 : 0)) : 0)
        //   + this.padding.top + this.padding.bottom;
        return (this.style.border ? 2 : 0) + this.padding.top + this.padding.bottom;
    }

    isFocused() {
        return this.screen.getfocused() === this;
    }

    isVisible() {
        var el: Node = this;
        do {
            if (el.detached) return false;
            if (el.hidden) return false;
            // if (!el.lpos) return false;
            // if (el.position.width === 0 || el.position.height === 0) return false;
        } while (el = el.parent);
        return true;
    }
}