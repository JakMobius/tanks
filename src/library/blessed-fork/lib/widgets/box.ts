/**
 * box.js - box element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import {Element, ElementConfig} from './element';

export class Box extends Element {
    /**
     * Box
     */
    constructor(options: ElementConfig) {
        options = options || {};
        super(options);
        this.type = 'box';
    }
}
