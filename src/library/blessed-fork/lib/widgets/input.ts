/**
 * input.js - abstract input element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import {ScrollableBox, ScrollableBoxConfig} from './scrollablebox';

export class Input extends ScrollableBox {
    constructor(options: ScrollableBoxConfig) {
        options = options || {};
        super(options);
        this.type = 'input';
    }
}
