/**
 * text.js - text element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */


import {Element, ElementConfig} from './element';

export class Text extends Element {
    constructor(options: ElementConfig) {
        options = options || {};
        super(options);
        this.type = 'text';
    }
}