/**
 * gpmclient.js - support the gpm mouse protocol
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

import net from 'net';
import fs from 'fs';
import EventEmitter from './events';

const GPM_USE_MAGIC = false;

const GPM_MOVE = 1
const GPM_DRAG = 2
const GPM_DOWN = 4
const GPM_UP = 8;

const GPM_DOUBLE = 32
const GPM_MFLAG = 128;

const GPM_REQ_NOPASTE = 3
const GPM_HARD = 256;

const GPM_MAGIC = 0x47706D4C;
const GPM_SOCKET = '/dev/gpmctl';

export interface GPMConfig {
 maxMod: number;
 eventMask: number;
 pid: number;
 minMod: number;
 defaultMask: any;
 vc: number
}

function send_config(socket: net.Socket, Gpm_Connect: GPMConfig, callback?: (() => void)) {
  let buffer;
  if (GPM_USE_MAGIC) {
    buffer = new Buffer(20);
    buffer.writeUInt32LE(GPM_MAGIC, 0);
    buffer.writeUInt16LE(Gpm_Connect.eventMask, 4);
    buffer.writeUInt16LE(Gpm_Connect.defaultMask, 6);
    buffer.writeUInt16LE(Gpm_Connect.minMod, 8);
    buffer.writeUInt16LE(Gpm_Connect.maxMod, 10);
    buffer.writeInt16LE(process.pid, 12);
    buffer.writeInt16LE(Gpm_Connect.vc, 16);
  } else {
    buffer = new Buffer(16);
    buffer.writeUInt16LE(Gpm_Connect.eventMask, 0);
    buffer.writeUInt16LE(Gpm_Connect.defaultMask, 2);
    buffer.writeUInt16LE(Gpm_Connect.minMod, 4);
    buffer.writeUInt16LE(Gpm_Connect.maxMod, 6);
    buffer.writeInt16LE(Gpm_Connect.pid, 8);
    buffer.writeInt16LE(Gpm_Connect.vc, 12);
  }
  socket.write(buffer, function() {
    if (callback) callback();
  });
}

// typedef struct Gpm_Event {
//   unsigned char buttons, modifiers;  // try to be a multiple of 4
//   unsigned short vc;
//   short dx, dy, x, y; // displacement x,y for this event, and absolute x,y
//   enum Gpm_Etype type;
//   // clicks e.g. double click are determined by time-based processing
//   int clicks;
//   enum Gpm_Margin margin;
//   // wdx/y: displacement of wheels in this event. Absolute values are not
//   // required, because wheel movement is typically used for scrolling
//   // or selecting fields, not for cursor positioning. The application
//   // can determine when the end of file or form is reached, and not
//   // go any further.
//   // A single mouse will use wdy, "vertical scroll" wheel.
//   short wdx, wdy;
// } Gpm_Event;

export interface GPMEvent {
  buttons?: number
  modifiers?: number
  vc?: number
  dx?: number
  dy?: number
  x?: number
  y?: number
  type?: number
  clicks?: number
  margin?: number
  wdx?: number
  wdy?: number
}

function parseEvent(raw: Buffer): GPMEvent {
  let evnt: GPMEvent = {};
  evnt.buttons = raw[0];
  evnt.modifiers = raw[1];
  evnt.vc = raw.readUInt16LE(2);
  evnt.dx = raw.readInt16LE(4);
  evnt.dy = raw.readInt16LE(6);
  evnt.x = raw.readInt16LE(8);
  evnt.y = raw.readInt16LE(10);
  evnt.type = raw.readInt16LE(12);
  evnt.clicks = raw.readInt32LE(16);
  evnt.margin = raw.readInt32LE(20);
  evnt.wdx = raw.readInt16LE(24);
  evnt.wdy = raw.readInt16LE(26);
  return evnt;
}

class GpmClient extends EventEmitter {

  public gpm: net.Socket

  constructor() {
    super()
    const pid = process.pid;

    // check tty for /dev/tty[n]
    let path;
    try {
      path = fs.readlinkSync('/proc/' + pid + '/fd/0');
    } catch (e) {}

    let tty_fragment = /tty[0-9]+$/.exec(path);
    if (tty_fragment === null) {
      // TODO: should  also check for /dev/input/..
    }

    let vc: number;
    let tty: string
    if (tty_fragment) {
      tty = tty_fragment[0];
      vc = +/[0-9]+$/.exec(tty)[0];
    }

    const self: GpmClient = this;

    if (tty) {
      fs.stat(GPM_SOCKET, function(err, stat) {
        if (err || !stat.isSocket()) {
          return;
        }

        const conf: GPMConfig = {
          eventMask: 0xffff,
          defaultMask: GPM_MOVE | GPM_HARD,
          minMod: 0,
          maxMod: 0xffff,
          pid: pid,
          vc: vc
        };

        const gpm = net.createConnection(GPM_SOCKET);
        this.gpm = gpm;

        gpm.on('connect', function() {
          send_config(gpm, conf, function() {
            conf.pid = 0;
            conf.vc = GPM_REQ_NOPASTE;
            //send_config(gpm, conf);
          });
        });

        gpm.on('data', function(packet) {
          const event = parseEvent(packet);
          switch (event.type & 15) {
            case GPM_MOVE:
              if (event.dx || event.dy) {
                self.emit('move', event.buttons, event.modifiers, event.x, event.y);
              }
              if (event.wdx || event.wdy) {
                self.emit('mousewheel',
                  event.buttons, event.modifiers,
                  event.x, event.y, event.wdx, event.wdy);
              }
              break;
            case GPM_DRAG:
              if (event.dx || event.dy) {
                self.emit('drag', event.buttons, event.modifiers, event.x, event.y);
              }
              if (event.wdx || event.wdy) {
                self.emit('mousewheel',
                  event.buttons, event.modifiers,
                  event.x, event.y, event.wdx, event.wdy);
              }
              break;
            case GPM_DOWN:
              self.emit('btndown', event.buttons, event.modifiers, event.x, event.y);
              if (event.type & GPM_DOUBLE) {
                self.emit('dblclick', event.buttons, event.modifiers, event.x, event.y);
              }
              break;
            case GPM_UP:
              self.emit('btnup', event.buttons, event.modifiers, event.x, event.y);
              if (!(event.type & GPM_MFLAG)) {
                self.emit('click', event.buttons, event.modifiers, event.x, event.y);
              }
              break;
          }
        });

        gpm.on('error', function() {
          self.stop();
        });
      });
    }
  }

  stop() {
    if (this.gpm) {
      this.gpm.end();
    }
    delete this.gpm;
  }

  ButtonName(btn: number) {
    if (btn & 4) return 'left';
    if (btn & 2) return 'middle';
    if (btn & 1) return 'right';
    return '';
  }

  hasShiftKey(mod: number) {
    return !!(mod & 1);
  }

  hasCtrlKey(mod: number) {
    return !!(mod & 4);
  }

  hasMetaKey(mod: number) {
    return !!(mod & 8);
  }
}

export default GpmClient;
