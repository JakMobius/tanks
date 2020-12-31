/**
 * widget.js - high-level interface for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */



import Node from './widgets/node'
import Screen from './widgets/screen'
import Element from './widgets/element'
import Box from './widgets/box'
import Text from './widgets/text'
import ScrollableBox from './widgets/scrollablebox'
import ScrollableText from './widgets/scrollabletext'
import Input from './widgets/input'
import Prompt from './widgets/prompt'

var widget = {
  'Node': Node,
  'Screen': Screen,
  'Element': Element,
  'Box': Box,
  'Text': Text,
  'ScrollableBox': ScrollableBox,
  'ScrollableText': ScrollableText,
  'Input': Input,
  'Prompt': Prompt
};

widget.classes = [
  'Node',
  'Screen',
  'Element',
  'Box',
  'Text',
  'ScrollableBox',
  'ScrollableText',
  'Input',
  'Prompt'
];

widget.aliases = {
  'ListBar': 'Listbar',
  'PNG': 'ANSIImage'
};

Object.keys(widget.aliases).forEach(function(key) {
  var name = widget.aliases[key];
  widget[key] = widget[name];
  widget[key.toLowerCase()] = widget[name];
});

export default widget