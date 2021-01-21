/**
 * prompt.js - textarea element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import {KeyEvent} from "./screen";
import {Screen} from "./screen";

/**
 * Modules
 */

let nextTick = global.setImmediate || process.nextTick.bind(process);

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
	public backspaceVisiblePadding: number;

	public viewportLeft: number
    public viewportRight: number

    /**
     * Textarea
     */
    constructor(options: PromptConfig) {
        options = options || {};

        super(options);

        this.value = options.value || '';

        this.cursorPosition = 0
        this.scrollPosition = 0
        this.viewportLeft = null
        this.viewportRight = null

        this.backspaceVisiblePadding = 3

        this.type = 'textarea';
    }

    setScreen(screen: Screen) {
        super.setScreen(screen);

        if(screen) {
            this.screen._listenKeys(this);
        }
    }

    onMove() {
        super.onMove()
        this.updateCursor()
    }

    onResize() {
        super.onResize()
        this.updateCursor()
        this.scrollToMatchCursor()
    }

    updateCursor() {
        if(this.detached) return
        if (this.screen.getfocused() !== this) {
            return;
        }

        const cy = this.getatop() + this.getitop();
        const cx = this.getaleft() + this.getileft() + this.cursorPosition - this.scrollPosition;
        const program = this.screen.program;

        if (cy === program.cursorY && cx === program.cursorX) {
            return;
        }

        if (cy === program.cursorY) {
            if (cx > program.cursorX) {
                program.cursorForward(cx - program.cursorX);
            } else if (cx < program.cursorX) {
                program.cursorBackward(program.cursorX - cx);
            }
        } else if (cx === program.cursorX) {
            if (cy > program.cursorY) {
                program.cursorDown(cy - program.cursorY);
            } else if (cy < program.cursorY) {
                program.cursorUp(program.cursorY - cy);
            }
        } else {
            program.cursorPos(cy, cx);
        }
    }

    onFocus() {
        super.onFocus()
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
        }
        this.updateCursor();
    }

    onKey(ch: string, key: KeyEvent) {
        if(key.cancelled) return
        let updated = false;

        if(key.name === 'return') return;
        if(key.name === 'enter') return;
        if(key.name === 'left') {
            if(key.meta) this.cursorWordLeft();
            else this.cursorLeft()
        } else if(key.name === 'right') {
            if(key.meta) this.cursorWordRight()
            else this.cursorRight()
        }

        if (key.name === 'backspace') {
            if (this.value.length) {
                if (this.screen.fullUnicode) {
                    if (unicode.isSurrogate(this.value, this.value.length - 2)) {
                        this.value = this.insertString(this.value, this.cursorPosition, 2)
                        this.cursorPosition -= 2;
                    } else {
                        this.value = this.insertString(this.value, this.cursorPosition, 1)
                        this.cursorPosition--;
                    }
                } else {
                    this.value = this.insertString(this.value, this.cursorPosition, 1)
                    this.cursorPosition--;
                }

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
            this.onValue()
            this.scrollToMatchCursor()
            this.trimViewport()
            this.updateCursor();
        }
    }

    onValue() {
        this.viewportLeft = null
        this.viewportRight = null
        this.emit('value')
    }

    getValue() {
        return this.value;
    }

    setValue(value: string) {
        if (this.value !== value) {
            this.value = value;
            this.cursorPosition = this.value.length

            this.onValue()
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
        this.setViewport(this.scrollPosition, this.scrollPosition + this.getwidth())
    }

    setViewport(left: number, right: number) {
        if(this.viewportLeft == left && this.viewportRight == right) return

        this.viewportLeft = left
        this.viewportRight = right

        this.setContent(this.value.substring(this.viewportLeft, this.viewportRight), true);
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
