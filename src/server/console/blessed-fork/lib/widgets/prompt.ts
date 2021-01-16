/**
 * prompt.js - textarea element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import {BlessedKeyEvent} from "./screen";
import {Screen} from "./screen";

/**
 * Modules
 */

var nextTick = global.setImmediate || process.nextTick.bind(process);

import {Input} from './input';
import * as unicode from "../unicode";
import {ScrollableBoxConfig} from "./scrollablebox";

export interface PromptConfig extends ScrollableBoxConfig {
    value?: string
}

export class Prompt extends Input {
	public value: any;
	public cursorPosition: number;
	public scrollPosition: number;
	public backspaceVisiblePadding: any;

    /**
     * Textarea
     */
    constructor(options: PromptConfig) {
        options = options || {};

        super(options);

        this.value = options.value || '';

        this.on('resize', this.resize);
        this.on('move', this.updateCursor);
        this.on('focus', this.onFocus)

        this.cursorPosition = 0
        this.scrollPosition = 0

        this.backspaceVisiblePadding = 3

        this.type = 'textarea';
    }

    setScreen(screen: Screen) {
        super.setScreen(screen);

        if(screen) {
            this.screen._listenKeys(this);
        }
    }

    resize() {
        this.updateCursor()
        this.scrollToMatchCursor()
        this.screen.render()
    }

    updateCursor() {
        if (this.screen.getfocused() !== this) {
            return;
        }

        var lpos = this._getCoords();
        if (!lpos) return;

        const cy = lpos.yi + this.getitop();
        const cx = lpos.xi + this.getileft() + this.cursorPosition - this.scrollPosition;
        const program = this.screen.program;

        if (cy === program.y && cx === program.x) {
            return;
        }

        if (cy === program.y) {
            if (cx > program.x) {
                program.cursorForward(cx - program.x);
            } else if (cx < program.x) {
                program.cursorBackward(program.x - cx);
            }
        } else if (cx === program.x) {
            if (cy > program.y) {
                program.cursorDown(cy - program.y);
            } else if (cy < program.y) {
                program.cursorUp(program.y - cy);
            }
        } else {
            program.cursorPos(cy, cx);
        }
    }

    onFocus() {
        this.screen.grabKeys = true;

        this.updateCursor();
        this.screen.program.showCursor();
        //this.screen.program.sgr('normal');

        // Put this in a nextTick so the current
        // key event doesn't trigger any keys input.
        nextTick(() => {
            this.on('keypress', this.onKey);
        });

        this.on('blur', this.onBlur);
    }

    onBlur() {
        this.removeListener('keypress', this.onKey);
        this.removeListener('blur', this.onBlur);

        this.screen.program.hideCursor();
        this.screen.grabKeys = false;
    }

    insertString(string: string, index: number, count?: number, insertion?: string) {
        let result = string.substr(0, index - count);
        if(insertion) {
            result += insertion
        }
        if(string.length > index - count) {
            result += string.substr(index);
        }
        return result
    }

    isWhitespace(ch: string) {
        return ch === ' ' || ch === "'" || ch === '"' || ch === "-" || ch === "/" || ch === "," || ch === "." || ch === ";"
    }

    cursorLeft() {
        if(this.cursorPosition > 0) {
            this.cursorPosition--;
            this.cursorMoved()
        }
    }

    cursorWordLeft() {
        let oldIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])

        while(this.cursorPosition > 0) {
            this.cursorPosition--;
            let currentIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])

            if(currentIsWhitespace && !oldIsWhitespace) {
                break;
            }

            oldIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])
        }

        this.cursorMoved()
    }

    cursorRight() {
        if(this.cursorPosition < this.value.length) {
            this.cursorPosition++;
            this.cursorMoved()
        }
    }

    cursorWordRight() {
        let oldIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])

        while(this.cursorPosition < this.value.length) {
            this.cursorPosition++;
            let currentIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])

            if(currentIsWhitespace && !oldIsWhitespace) {
                break;
            }

            oldIsWhitespace = this.isWhitespace(this.value[this.cursorPosition])
        }

        this.cursorMoved()
    }

    cursorMoved() {
        if(this.scrollToMatchCursor()) {
            this.trimViewport();
            this.screen.render();
        }
        this.updateCursor();
    }

    onKey(ch: string, key: BlessedKeyEvent) {
        var updated = false;

        if (key.name === 'return') return;
        if (key.name === 'enter') return;

        if(key.name === 'left') {
            if(key.meta) {
                this.cursorWordLeft();
            } else {
                this.cursorLeft()
            }
        } else if(key.name === 'right') {
            if(key.meta) {
                this.cursorWordRight()
            } else {
                this.cursorRight()
            }
        }

        if (key.name === 'backspace') {
            if (this.value.length) {
                if (this.screen.fullUnicode) {
                    if (unicode.isSurrogate(this.value, this.value.length - 2)) {
                        this.value = this.insertString(this.value, this.cursorPosition, 2)
                    } else {
                        this.value = this.insertString(this.value, this.cursorPosition, 1)
                    }
                } else {
                    this.value = this.insertString(this.value, this.cursorPosition, 1)
                }
                this.cursorPosition--;
                if(this.cursorPosition <= this.scrollPosition + this.backspaceVisiblePadding) {
                    this.scrollPosition = this.cursorPosition - this.backspaceVisiblePadding;
                    if(this.scrollPosition < 0) {
                        this.scrollPosition = 0;
                    }
                }
                updated = true;
            }
        } else if (ch) {
            if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
                this.value = this.insertString(this.value, this.cursorPosition, 0, ch)
                updated = true;

                this.cursorPosition++;
            }
        }

        if (updated) {
            this.scrollToMatchCursor()
            this.trimViewport()
            this.screen.render();
            this.updateCursor();
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value: string) {
        if (this.value !== value) {
            this.value = value;
            this.cursorPosition = this.value.length

            this.scrollToMatchCursor()
            this.setContent(this.value);
            this.updateCursor();
        }
    }

    setCursorPosition(pos: number) {
        this.cursorPosition = pos
        this.cursorMoved()
    }

    trimViewport() {
        this.setContent(this.value.substr(this.scrollPosition, this.getwidth()), true);
    }

    scrollToMatchCursor() {

        let trailingSpaceLength = this.getwidth() - this.value.length + this.scrollPosition
        if(trailingSpaceLength < 0) trailingSpaceLength = 0
        this.scrollPosition -= trailingSpaceLength
        if(this.scrollPosition < 0) {
            this.scrollPosition = 0
        }

        const leftBound = this.scrollPosition
        const rightBound = this.scrollPosition + this.getwidth()

        if(leftBound > this.cursorPosition) {
            this.scrollPosition = this.cursorPosition
            return true;
        }
        if(rightBound < this.cursorPosition) {
            this.scrollPosition = this.cursorPosition - this.getwidth()
            return true;
        }

        return false;
    }

    render() {
        this.trimViewport()
        return super.render();
    }
}


/**
 * Expose
 */
