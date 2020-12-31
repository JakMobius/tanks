/**
 * scrollabletext.js - scrollable text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import ScrollableBox from './scrollablebox';

class ScrollableText extends ScrollableBox {
    /**
     * ScrollableText
     */
    constructor(options) {
        options = options || {};
        options.alwaysScroll = true;
        super(options);
        this.type = 'scrollable-text';
    }
}


/**
 * Expose
 */

export default ScrollableText;
