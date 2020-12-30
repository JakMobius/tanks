/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

var Node = require('./node');
var Element = require('./element');

class Text extends Element {
    /**
     * Text
     */
    constructor(options) {
        options = options || {};
        options.shrink = true;
        super(options);
        this.type = 'text';
    }
}


/**
 * Expose
 */

module.exports = Text;