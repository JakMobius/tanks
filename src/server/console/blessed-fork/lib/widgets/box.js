/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

var Element = require('./element');

class Box extends Element {
    /**
     * Box
     */
    constructor(options) {
        options = options || {};
        super(options);
        this.type = 'box';
    }
}

module.exports = Box;