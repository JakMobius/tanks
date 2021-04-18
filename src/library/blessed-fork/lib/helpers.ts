/**
 * helpers.js - helpers for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

import * as unicode from './unicode';

/**
 * Helpers
 */

export function merge(a: any, b: any) {
  Object.keys(b).forEach(function(key) {
    a[key] = b[key];
  });
  return a;
}

export function dropUnicode(text: string) {
  if (!text) return '';
  return text
    .replace(unicode.chars.all, '??')
    .replace(unicode.chars.combining, '')
    .replace(unicode.chars.surrogate, '?');
}

export function consoleStringWidth(text: string) {
  let length = text.length
  let width = 0
  for(let i = 0; i < length; i++) {
    if(text[i] == '\x1b' && text[i + 1] == '[') {
      let old_i = i++;

      let code = 0;
      do {
        code = text.charCodeAt(++i);
      } while((code >= 48 && code <= 57) || code == 59);

      if (text[i] == 'm') continue

      i = old_i;
    }

    width++
  }

  return width
}
