/**
 * scrollablebox.js - scrollable box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */


import {Box} from './box';
import {Node} from "./node";
import {ElementConfig} from "./element";

export interface ScrollableBoxConfig extends ElementConfig {
    alwaysScroll?: boolean;
    scrollable?: boolean
    mouse?: boolean
}

export class ScrollableBox extends Box {
	public baseLimit: any;
    private childOffset: number;
    private scrollable: boolean;
    private alwaysScroll: boolean;

    /**
     * ScrollableBox
     */
    constructor(options: ScrollableBoxConfig) {
        super(options);

        options = options || {};

        if (options.scrollable === false) {
            return this;
        }

        this.scrollable = true;
        this.childOffset = 0;
        this.childBase = 0;
        this.baseLimit = Infinity;
        this.alwaysScroll = options.alwaysScroll;

        if (options.mouse) {
            this.on('wheeldown', () => {
                this.scroll(1);
            });
            this.on('wheelup', () => {
                this.scroll(-1);
            });
        }

        this.on('parsed content', () => {
            this._recalculateIndex();
        });

        this.type = 'scrollable-box';
    }

    _scrollBottom() {
        if (!this.scrollable) return 0;
        
        // Todo: cache results

        // XXX Use this? Makes .getScrollHeight() useless!
        // if (bottom < this._clines.length) bottom = this._clines.length;

        return this.children.reduce((current: number, el: Node) => {
            // el.height alone does not calculate the shrunken height, we need to use
            // getCoords. A shrunken box inside a scrollable element will not grow any
            // larger than the scrollable element's context regardless of how much
            // content is in the shrunken box, unless we do this (call getCoords
            // without the scrollable calculation):
            // See: $ node test/widget-shrink-fail-2.js

            return Math.max(current, el.getrtop() + el.getheight());
        }, 0);
    }

    setScroll(offset: number, always?: boolean) {
        // XXX
        // At first, this appeared to account for the first new calculation of childBase:
        this.scroll(0);
        return this.scroll(offset - (this.childBase + this.childOffset), always);
    }

    scrollTo(offset: number, always?: boolean) {
        // XXX
        // At first, this appeared to account for the first new calculation of childBase:
        this.scroll(0);
        return this.scroll(offset - (this.childBase + this.childOffset), always);
    }

    getScroll() {
        return this.childBase + this.childOffset;
    }

    scroll(offset: number, always?: boolean) {
        if (!this.scrollable) return;

        if (this.detached) return;

        // Handle scrolling.
        let visible = this.getheight() - this.getiheight()
        let base = this.childBase
        let d
        let p: Node
        let t
        let b
        let max
        let emax;

        if (this.alwaysScroll || always) {
            // Semi-workaround
            this.childOffset = offset > 0
                ? visible - 1 + offset
                : offset;
        } else {
            this.childOffset += offset;
        }

        if (this.childOffset > visible - 1) {
            d = this.childOffset - (visible - 1);
            this.childOffset -= d;
            this.childBase += d;
        } else if (this.childOffset < 0) {
            d = this.childOffset;
            this.childOffset += -d;
            this.childBase += d;
        }

        if (this.childBase < 0) {
            this.childBase = 0;
        } else if (this.childBase > this.baseLimit) {
            this.childBase = this.baseLimit;
        }

        // Find max "bottom" value for
        // content and descendant elements.
        // Scroll the content if necessary.
        if (this.childBase === base) {
            this.emit('scroll');
            this.setNeedsRender()
            return;
        }

        // When scrolling text, we want to be able to handle SGR codes as well as line
        // feeds. This allows us to take preformatted text output from other programs
        // and put it in a scrollable text box.
        this.parseContent();

        // XXX
        // max = this.getScrollHeight() - (this.height - this.iheight);

        max = this._clines.length - (this.getheight() - this.getiheight());
        if (max < 0) max = 0;
        emax = this._scrollBottom() - (this.getheight() - this.getiheight());
        if (emax < 0) emax = 0;

        this.childBase = Math.min(this.childBase, Math.max(emax, max));

        if (this.childBase < 0) {
            this.childBase = 0;
        } else if (this.childBase > this.baseLimit) {
            this.childBase = this.baseLimit;
        }

        // Optimize scrolling with CSR + IL/DL.
        // Only really need _getCoords() if we want
        // to allow nestable scrolling elements...
        // or if we **really** want shrinkable
        // scrolling elements.
        // p = this._getCoords();
        if (p && this.childBase !== base && this.screen.cleanSides(this)) {
            t = p.getatop() + this.getitop();
            b = p.getabottom() - this.getibottom() - 1;
            d = this.childBase - base;

            if (d > 0 && d < visible) {
                // scrolled down
                this.screen.deleteLine(d, t, t, b);
            } else if (d < 0 && -d < visible) {
                // scrolled up
                d = -d;
                this.screen.insertLine(d, t, t, b);
            }
        }

        this.emit('scroll');
        this.setNeedsRender()
        return
    }

    _recalculateIndex() {
        if(!this._clines) return
        var max, emax;

        if (this.detached || !this.scrollable) {
            return;
        }

        // XXX
        // max = this.getScrollHeight() - (this.height - this.iheight);

        max = this._clines.length - (this.getheight() - this.getiheight());
        if (max < 0) max = 0;
        emax = this._scrollBottom() - (this.getheight() - this.getiheight());
        if (emax < 0) emax = 0;

        this.childBase = Math.min(this.childBase, Math.max(emax, max));

        if (this.childBase < 0) {
            this.childBase = 0;
        } else if (this.childBase > this.baseLimit) {
            this.childBase = this.baseLimit;
        }
    }

    resetScroll() {
        if (!this.scrollable) return false
        this.childOffset = 0;
        this.childBase = 0;
        return this.emit('scroll');
    }

    getScrollHeight() {
        return Math.max(this._clines.length, this._scrollBottom());
    }

    getScrollPerc(s: boolean) {
        if(this.detached) return s ? -1 : 0;

        let height = this.getheight() - this.getiheight()
        let i = this.getScrollHeight()
        let p;

        if (height < i) {
            if (this.alwaysScroll) {
                p = this.childBase / (i - height);
            } else {
                p = (this.childBase + this.childOffset) / (i - 1);
            }
            return p * 100;
        }

        return s ? -1 : 0;
    }

    setScrollPerc(i: number) {
        // XXX
        // var m = this.getScrollHeight();
        var m = Math.max(this._clines.length, this._scrollBottom());
        return this.scrollTo((i / 100) * m | 0);
    }
}
