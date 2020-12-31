/**
 * blessed - a high-level terminal interface library for node.js
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Blessed
 */

import Program from './program'
import Tput from './tput'
import widget from './widget'
import colors from './colors'
import unicode from './unicode'
import helpers from './helpers'

export function blessed() {
  return blessed.program.apply(null, arguments);
}

blessed.program = blessed.Program = Program
blessed.tput = blessed.Tput = Tput
blessed.widget = widget
blessed.colors = colors
blessed.unicode = unicode
blessed.helpers = helpers

blessed.helpers.sprintf = blessed.tput.sprintf;
blessed.helpers.tryRead = blessed.tput.tryRead;
blessed.helpers.merge(blessed, blessed.helpers);

blessed.helpers.merge(blessed, blessed.widget);

/**
 * Expose
 */

export default blessed;
