/**
 * events.js - event emitter for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

var slice = Array.prototype.slice;

/**
 * EventEmitter
 */

class EventEmitter {
  _maxListeners;
  _events;

  constructor() {
    if (!this._events) this._events = {};
  }

  setMaxListeners(n)
  {
    this._maxListeners = n;
  }

  addListener(type, listener)
  {
    if (!this._events[type]) {
      this._events[type] = listener;
    } else if (typeof this._events[type] === 'function') {
      this._events[type] = [this._events[type], listener];
    } else {
      this._events[type].push(listener);
    }
    this._emit('newListener', [type, listener]);
  }

  on(type, listener){
    return this.addListener(type, listener);
  }

  removeListener(type, listener) {
    var handler = this._events[type];
    if (!handler) return;

    if (typeof handler === 'function' || handler.length === 1) {
      delete this._events[type];
      this._emit('removeListener', [type, listener]);
      return;
    }

    for (var i = 0; i < handler.length; i++) {
      if (handler[i] === listener || handler[i].listener === listener) {
        handler.splice(i, 1);
        this._emit('removeListener', [type, listener]);
        return;
      }
    }
  }

  off(type, listener) {
    return this.removeListener(type, listener)
  }

  removeAllListeners(type) {
    if (type) {
      delete this._events[type];
    } else {
      this._events = {};
    }
  }

  once(type, listener) {
    function on() {
      this.removeListener(type, on);
      return listener.apply(this, arguments);
    }
    on.listener = listener;
    return this.on(type, on);
  }

  listeners(type) {
    return typeof this._events[type] === 'function'
        ? [this._events[type]]
        : this._events[type] || [];
  }

  _emit(type, args) {
    var handler = this._events[type]
        , ret;

    // if (type !== 'event') {
    //   this._emit('event', [type.replace(/^element /, '')].concat(args));
    // }

    if (!handler) {
      if (type === 'error') {
        throw new args[0];
      }
      return;
    }

    if (typeof handler === 'function') {
      return handler.apply(this, args);
    }

    for (var i = 0; i < handler.length; i++) {
      if (handler[i].apply(this, args) === false) {
        ret = false;
      }
    }

    return ret !== false;
  }

  emit(type) {
    var args = slice.call(arguments, 1)
        , params = slice.call(arguments)
        , el = this;

    this._emit('event', params);

    // @ts-ignore
    if (this.type === 'screen') {
      return this._emit(type, args);
    }

    if (this._emit(type, args) === false) {
      return false;
    }

    type = 'element ' + type;
    args.unshift(this);
    // `element` prefix
    // params = [type].concat(args);
    // no `element` prefix
    // params.splice(1, 0, this);

    do {
      // el._emit('event', params);
      if (!el._events[type]) continue;
      if (el._emit(type, args) === false) {
        return false;
      }
    } while (el = el.parent);

    return true;
  }
}

/**
 * Expose
 */

export default EventEmitter;
