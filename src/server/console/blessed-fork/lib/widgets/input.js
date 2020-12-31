/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import ScrollableBox from './scrollablebox';

class Input extends ScrollableBox {
    /**
     * Input
     */
    constructor(options) {
        options = options || {};
        super(options);
        this.type = 'input';
    }
}


/**
 * Expose
 */

export default Input;
