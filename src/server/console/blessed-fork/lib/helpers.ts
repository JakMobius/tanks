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
