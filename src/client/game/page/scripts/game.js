(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Box2D = require(99);

const Matrix3 = require(50);

class Camera {
  /**
   * @type {Matrix3}
   */

  /**
   * Enable inertial camera movement.
   * @type {boolean}
   */

  /**
   * Camera position (exclude camera shaking)
   * @type {b2Vec2}
   */

  /**
   * Camera position delta
   * @type {b2Vec2}
   */

  /**
   * Camera shaking velocity
   * @type {b2Vec2}
   */

  /**
   * @type {b2Vec2}
   */
  constructor(options) {
    this.matrix = null;
    this.inertial = false;
    this.position = null;
    this.shaking = null;
    this.shakeVelocity = null;
    this.target = null;
    options = Object.assign({
      baseScale: 1,
      target: null,
      limit: true,
      inertial: false
    }, options);
    this.baseScale = options.baseScale;
    this.target = options.target;
    this.viewport = options.viewport;
    this.defaultPosition = options.defaultPosition;
    this.position = null;
    this.velocity = new Box2D.b2Vec2();
    this.shaking = new Box2D.b2Vec2();
    this.shakeVelocity = new Box2D.b2Vec2();
    this.realTarget = new Box2D.b2Vec2();
    this.targetVelocity = null;
    this.limit = options.limit;
    this.viewportLimit = null;

    if (this.limit) {
      this.viewportLimit = options.viewportLimit || new Box2D.b2Vec2(1440, 900);
    }

    this.matrix = new Matrix3();
    this.inertial = options.inertial;
  }

  reset() {
    if (this.position) {
      this.position.x = this.defaultPosition.x;
      this.position.y = this.defaultPosition.y;
    } else {
      this.position = this.defaultPosition.Copy();
    }

    this.shaking.x = 0;
    this.shaking.y = 0;
    this.shakeVelocity.x = 0;
    this.shakeVelocity.y = 0;
  }

  getPosition() {
    return new Box2D.b2Vec2(this.position.x + this.shaking.x, this.position.y + this.shaking.y);
  }

  targetPosition(position, velocity, target, lookahead, dt) {
    let lookAheadX = position.x + velocity.x * lookahead;
    let lookAheadY = position.y + velocity.y * lookahead;

    if (target == null) {
      velocity.x -= lookAheadX * dt;
      velocity.y -= lookAheadY * dt;
    } else {
      velocity.x -= (lookAheadX - target.x) * dt;
      velocity.y -= (lookAheadY - target.y) * dt;
    }

    position.x += velocity.x * dt;
    position.y += velocity.y * dt;
  }
  /**
   * Moves the camera to follow the target.
   * @param dt {number} Frame seconds
   */


  tick(dt) {
    this.matrix.reset();
    let target = this.target || this.defaultPosition;
    this.scale = this.baseScale;

    if (this.limit) {
      if (this.viewport.x > this.viewportLimit.x) {
        this.scale = this.viewport.x / this.viewportLimit.x * this.baseScale;
      }

      if (this.viewport.y > this.viewportLimit.y) {
        this.scale = Math.max(this.scale, this.viewport.y / this.viewportLimit.y * this.baseScale);
      }
    }

    this.matrix.scale(1 / this.viewport.x * 2, -1 / this.viewport.y * 2);

    if (this.position) {
      if (this.inertial) {
        if (this.targetVelocity) {
          this.realTarget.x = target.x + this.targetVelocity.x * 0.5;
          this.realTarget.y = target.y + this.targetVelocity.y * 0.5;
          target = this.realTarget;
        }

        this.targetPosition(this.position, this.velocity, target, 1.5, dt * 5);
        this.targetPosition(this.shakeVelocity, this.shaking, null, 0.5, dt * 20);
      } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.position.x = target.x;
        this.position.y = target.y;
      }
    } else {
      this.position = target.Copy();
    }

    this.matrix.scale(this.scale, this.scale);
    this.matrix.translate(-this.position.x - this.shaking.x, -this.position.y - this.shaking.y);
  }

}

module.exports = Camera;
},{}],2:[function(require,module,exports){
const Axle = require(132);

class ButtonAxle extends Axle {
  constructor(min, max) {
    super();
    this.min = min === undefined ? 0 : min;
    this.max = max === undefined ? 1 : max;
    this.ownValue = this.min;
    this.animationTime = 0;
    this.target = 0; // Internals

    this.keypressTimestamp = 0;
    this.pressed = false;
  }

  keyPressed(value) {
    if (value === undefined) {
      this.target = this.max;
    } else {
      this.target = this.max * value + this.min * (1 - value);
    }

    this.keypressTimestamp = Date.now();
    this.setNeedsUpdate();
  }

  keyReleased() {
    this.target = this.min;
    this.keypressTimestamp = Date.now();
    this.setNeedsUpdate();
  }

  smooth(time) {
    this.animationTime = time || 0.25;
    return this;
  }

  reverse() {
    this.max = -this.max;
    this.min = -this.min;
    return this;
  }

  getValue() {
    if (this.animationTime <= 0) {
      this.ownValue = this.keyPressed ? this.max : this.min;
    }

    this.update = false;
    let now = Date.now();
    let dt = (now - this.keypressTimestamp) / 1000;
    this.keypressTimestamp = now;

    if (this.target > this.ownValue) {
      this.ownValue += dt / this.animationTime;
      if (this.target < this.ownValue) this.ownValue = this.target;
    } else if (this.target < this.ownValue) {
      this.ownValue -= dt / this.animationTime;
      if (this.target > this.ownValue) this.ownValue = this.target;
    }

    if (this.ownValue !== this.target) this.setNeedsUpdate();
    return this.ownValue;
  }

}

module.exports = ButtonAxle;
},{}],3:[function(require,module,exports){
const Axle = require(132);

class GamepadAxle extends Axle {
  constructor(controller, axle) {
    super();
    this.axle = axle;
    this.controller = controller;
    this.value = 0;
    this.power = 1;
    this.inverted = false;
    this.controller.on("axle", (index, value) => {
      if (index === this.axle) {
        this.value = Math.pow(value, this.power);
        this.setNeedsUpdate();
      }
    });
  }

  invert() {
    this.inverted = !this.inverted;
    return this;
  }

  getValue() {
    return this.inverted ? -this.value : this.value;
  }

}

module.exports = GamepadAxle;
},{}],4:[function(require,module,exports){
const ButtonAxle = require(2);

class GamepadButton extends ButtonAxle {
  constructor(gamepad, button, min, max) {
    super(max, min);
    this.button = button;
    gamepad.on("button", (index, value) => {
      if (index === this.button) {
        this.keyPressed(value);
      }
    });
  }

}

module.exports = GamepadButton;
},{}],5:[function(require,module,exports){
const EventEmitter = require(145);

class DocumentEventHandler extends EventEmitter {
  constructor() {
    super();
    /** @type Map<string,any> */

    this.listeners = new Map();
    this.target = document.body;
  }

  bind(event, handler) {
    if (this.listeners.has(event)) {
      this.unbind(event);
    }

    const self = this;

    const listener = function () {
      handler.apply(self, arguments);
    };

    this.listeners.set(event, listener);

    if (Array.isArray(this.target)) {
      for (let target of this.target) target.addEventListener(event, listener);
    } else {
      this.target.addEventListener(event, listener);
    }
  }

  unbind(event) {
    if (Array.isArray(this.target)) {
      for (let target of this.target) target.removeEventListener(event, this.listeners.get(event));
    } else {
      this.target.removeEventListener(event, this.listeners.get(event));
    }

    this.listeners.delete(event);
  }

  startListening() {}

  stopListening() {
    for (let event of this.listeners.keys()) {
      this.unbind(event);
    }

    this.keys.clear();
    this.listeners.clear();
  }

}

module.exports = DocumentEventHandler;
},{}],6:[function(require,module,exports){
const DocumentEventHandler = require(5);

const GamepadAxle = require(3);

const GamepadButton = require(4);

navigator.getGamepads = navigator.getGamepads || navigator["webkitGetGamepads"];

class GamepadManager extends DocumentEventHandler {
  constructor() {
    super();
    this.gamepad = null;
    this.axises = [];
    this.buttons = [];
    this.target = window;
  }

  startListening() {
    if (navigator.getGamepads) {
      this.bind("gamepadconnected", this.gamepadConnected);
      this.bind("gamepaddisconnected", this.gamepadDisconnected);
    }
  }

  refresh() {
    if (this.gamepad === null) return;

    for (let [i, button] of navigator.getGamepads()[this.gamepad].buttons.entries()) {
      let value = typeof button === "number" ? button : button.value;

      if (this.buttons[i] !== value) {
        this.emit("button", i, value);
        this.buttons[i] = value;
      }
    }

    for (let [i, axis] of navigator.getGamepads()[this.gamepad].axes.entries()) {
      if (this.axises[i] !== axis) {
        this.emit("axle", i, axis);
        this.axises[i] = axis;
      }
    }
  }

  gamepadConnected(event) {
    if (this.gamepad !== null) {
      return;
    }

    this.gamepad = event.gamepad.index;
    this.axises = new Array(navigator.getGamepads()[this.gamepad].axes.length);
  }

  gamepadDisconnected(event) {
    if (event.gamepad.index === this.gamepad) {
      this.gamepad = null;
    }
  }

  getAxle(index) {
    return new GamepadAxle(this, index);
  }

  getButton(index) {
    return new GamepadButton(this, index);
  }

}

module.exports = GamepadManager;
},{}],7:[function(require,module,exports){
const DocumentEventHandler = require(5);

const KeyAxle = require(9);

class KeyboardController extends DocumentEventHandler {
  constructor() {
    super();
    this.keys = new Set();
    this.keybindings = [];
    this.isMacOS = navigator.userAgent.indexOf("Mac") !== -1;
  }

  keybinding(name, handler) {
    let parts = name.split("-");
    let cmd = parts.indexOf("Cmd") !== -1;
    let shift = parts.indexOf("Shift") !== -1;
    let alt = parts.indexOf("Alt") !== -1;
    let key = parts.pop();
    this.on("keydown", event => {
      let eventCmd = this.isMacOS ? event.metaKey : event.ctrlKey;
      let eventShift = event.shiftKey;
      let eventAlt = event.altKey;
      let eventKey = event.code;
      if (eventKey.startsWith("Key")) eventKey = eventKey.substr(3);
      if (eventCmd !== cmd) return;
      if (eventShift !== shift) return;
      if (eventAlt !== alt) return;
      if (eventKey !== key) return;
      event.preventDefault();
      handler(event);
    });
  }

  startListening() {
    this.bind("keyup", this.keyup);
    this.bind("keydown", this.keydown);
  }

  keyPressed() {
    for (let argument of arguments) {
      if (this.keys.has(argument)) return true;
    }

    return false;
  }

  keyPressedOnce(key) {
    if (this.keys.has(key)) {
      this.keys.delete(key);
      return true;
    }

    return false;
  }

  keyup(e) {
    this.emit("keyup", e);
    this.keys.delete(e.code);
  }

  keydown(e) {
    if (e.repeat) {
      e.preventDefault();
      return;
    }

    this.emit("keydown", e);
    this.keys.add(e.code);
  }

  getKeyAxle(key, min, max) {
    return new KeyAxle(this, key, min, max);
  }

}

module.exports = KeyboardController;
},{}],8:[function(require,module,exports){
const DocumentEventHandler = require(5);

class TouchController extends DocumentEventHandler {
  constructor(handler, canvas) {
    super();
    this.touchData = new Map();
    this.handler = handler;
    this.canvas = canvas;
    this.target = this.canvas;
  }

  startListening() {
    this.bind("touchstart", this.ontouchstart);
    this.bind("touchmove", this.ontouchmove);
    this.bind("touchend", this.ontouchend);
  }

  ontouchstart(event) {
    const rect = this.canvas.getBoundingClientRect();

    for (let touch of event.changedTouches) {
      const left = touch.pageX - document.body.scrollLeft - rect.x;
      const top = touch.pageY - document.body.scrollTop - rect.y;
      const bottom = rect.height - top;
      const right = rect.width - left;
      const struct = {
        left: left,
        top: top,
        bottom: bottom,
        right: right,
        id: touch.identifier
      };

      if (this.handler.captureTouch(struct)) {
        for (let [id, anotherTouch] of this.touchData.entries()) {
          if (struct.id !== id) {
            if (struct.vidget.id === anotherTouch.vidget.id) {
              this.touchData.delete(anotherTouch.id);
            }
          }
        }

        this.touchData.set(touch.identifier, struct);
      }
    }

    event.preventDefault();
  }

  ontouchmove(event) {
    const rect = this.canvas.getBoundingClientRect();

    for (let e of event.changedTouches) {
      const touch = this.touchData.get(e.identifier);
      if (!touch) return;
      const left = e.pageX - document.body.scrollLeft - rect.x;
      const top = e.pageY - document.body.scrollTop - rect.y;
      const bottom = rect.height - top;
      const right = rect.width - left;
      touch.left = left;
      touch.top = top;
      touch.right = right;
      touch.bottom = bottom;
      touch.captured.touchMoved(touch);
    }

    event.preventDefault();
  }

  ontouchend(event) {
    for (let e of event.changedTouches) {
      const touch = this.touchData.get(e.identifier);
      if (!touch) return;
      touch.captured.touchEnded(touch);
      this.touchData.delete(e.identifier);
    }

    event.preventDefault();
  }

}

module.exports = TouchController;
},{}],9:[function(require,module,exports){
const ButtonAxle = require(2);

class KeyAxle extends ButtonAxle {
  constructor(keyboard, key, min, max) {
    super(min, max);
    this.key = key;
    keyboard.on("keydown", event => {
      if (event.code === this.key) this.keyPressed();
    });
    keyboard.on("keyup", event => {
      if (event.code === this.key) this.keyReleased();
    });
  }

}

module.exports = KeyAxle;
},{}],10:[function(require,module,exports){
const Axle = require(132);

const EventEmitter = require(145);

class PlayerControls extends EventEmitter {
  constructor() {
    super();
    this.axles = new Map();
    this.createAxle("tank-throttle");
    this.createAxle("tank-steer");
    this.createAxle("tank-primary-weapon");
    this.createAxle("tank-miner");
    this.createAxle("tank-respawn");
    this.respawning = true;
  }

  createAxle(name) {
    this.axles.set(name, new Axle());
  }

  connectTankControls(controls) {
    controls.axles.get("y").addSource(this.axles.get("tank-throttle"));
    controls.axles.get("x").addSource(this.axles.get("tank-steer"));
    controls.axles.get("primary-weapon").addSource(this.axles.get("tank-primary-weapon"));
    controls.axles.get("miner").addSource(this.axles.get("tank-miner"));
  }

  disconnectTankControls() {
    this.axles.get("tank-throttle").disconnectAll();
    this.axles.get("tank-steer").disconnectAll();
    this.axles.get("tank-primary-weapon").disconnectAll();
    this.axles.get("tank-miner").disconnectAll();
  }

  setupGamepad(gamepad) {
    this.axles.get("tank-throttle").addSource(gamepad.getAxle(1).invert());
    this.axles.get("tank-steer").addSource(gamepad.getAxle(2));
    this.axles.get("tank-miner").addSource(gamepad.getButton(4));
    this.axles.get("tank-primary-weapon").addSource(gamepad.getButton(5));
    this.axles.get("tank-respawn").addSource(gamepad.getButton(2));
  }

  setupKeyboard(keyboard) {
    this.axles.get("tank-throttle").addSource(keyboard.getKeyAxle("KeyW").smooth()).addSource(keyboard.getKeyAxle("ArrowUp").smooth()).addSource(keyboard.getKeyAxle("KeyS").smooth().reverse()).addSource(keyboard.getKeyAxle("ArrowDown").smooth().reverse());
    this.axles.get("tank-steer").addSource(keyboard.getKeyAxle("KeyD").smooth()).addSource(keyboard.getKeyAxle("ArrowRight").smooth()).addSource(keyboard.getKeyAxle("KeyA").smooth().reverse()).addSource(keyboard.getKeyAxle("ArrowLeft").smooth().reverse());
    this.axles.get("tank-miner").addSource(keyboard.getKeyAxle("KeyQ"));
    this.axles.get("tank-primary-weapon").addSource(keyboard.getKeyAxle("Space"));
    this.axles.get("tank-respawn").addSource(keyboard.getKeyAxle("KeyR"));
  }

  refresh() {
    if (this.axles.get("tank-respawn").getValue() > 0.5) {
      if (!this.respawning) {
        this.respawning = true;
        this.emit("respawn");
      }
    } else {
      this.respawning = false;
    }
  }

}

module.exports = PlayerControls;
},{}],11:[function(require,module,exports){
const AbstractEffect = require(84);

class ClientEffect extends AbstractEffect {}

module.exports = ClientEffect;
},{}],12:[function(require,module,exports){
const ClientEffect = require(11);

class ClientTankEffect extends ClientEffect {
  /**
   * @param model {EffectModel}
   * @param tank {ClientTank}
   */
  constructor(model, tank) {
    super(model);
    this.model = model;
    this.tank = tank;
  } // noinspection JSCheckFunctionSignatures

  /**
   * @param model {EffectModel}
   * @param tank {ClientTank}
   * @returns {ClientEffect | null}
   */


  static fromModel(model, tank) {
    let clazz = this.Types.get(model.constructor);
    if (!clazz) return null;
    return (
      /** @type ClientEffect */
      new clazz(model, tank)
    );
  }

}

module.exports = ClientTankEffect;
},{}],13:[function(require,module,exports){
const FireParticle = require(62);

const ClientTankEffect = require(12);

const TankFireEffectModel = require(87);

class ClientTankFireEffect extends ClientTankEffect {
  constructor(model, tank) {
    super(model, tank);
    this.queue = 0;
    this.frequency = 20;
  }

  stop() {
    this.sound.stop();
    this.dead = true;
  }

  tick(dt) {
    const position = this.tank.model.body.GetPosition();
    const velocity = this.tank.model.body.GetLinearVelocity();
    const angle = this.tank.model.body.GetAngle();
    const tank = this.tank;
    this.queue += dt * this.frequency;

    while (this.queue > 0) {
      for (let k = 0; k < 20; k++) {
        const heading = -angle + (Math.random() - 0.5) * Math.PI / 4;
        const sin = Math.sin(heading);
        const cos = Math.cos(heading);
        const vel = 240 + Math.random() * 20;
        const dist = Math.random() * 6;
        const smoke = new FireParticle({
          x: position.x - tank.model.matrix.sin * 10 + sin * dist,
          y: position.y + tank.model.matrix.cos * 10 + cos * dist,
          dx: velocity.x + sin * vel,
          dy: velocity.y + cos * vel,
          width: 4,
          height: 4,
          scaling: 1.5,
          decelerating: 0.95,
          lifetime: 0.4 + Math.random() * 0.1
        });
        this.tank.world.particles.push(smoke);
      }

      this.queue -= 1;
    }
  }

}

ClientTankEffect.associate(TankFireEffectModel, ClientTankFireEffect);
module.exports = ClientTankFireEffect;
},{}],14:[function(require,module,exports){
const ClientTankEffect = require(12); //const AbstractTankPelletsEffect = require("/src/effects/tank/abstracttankpelletseffect")


const Pellet = require(64);

const Color = require(144);

class ClientTankPelletsEffect extends ClientTankEffect {
  start(player) {
    this.player = player;
  }

  draw(ctx) {
    const game = this.game;
    const player = this.player;
    const tank = player.tank;

    for (let k = 0; k < 8; k++) {
      const angle = tank.model.rotation + (Math.random() - 0.5) * Math.PI / 4;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const vel = 500 + Math.random() * 20;
      const dist = Math.random() * 3;
      const pellet = new Pellet({
        x: tank.model.x + tank.model.matrix.sin * 2 + sin * dist,
        y: tank.model.y + tank.model.matrix.cos * 2 + cos * dist,
        dx: (tank.model.body.m_linearVelocity.x + sin * vel) / game.tps,
        dy: (tank.model.body.m_linearVelocity.y + cos * vel) / game.tps,
        lifetime: 150,
        color: new Color(50, 50, 50)
      });
      game.particles.push(pellet);
    }
  }

} //ClientTankEffect.register(AbstractTankPelletsEffect, ClientTankPelletsEffect)


module.exports = ClientTankPelletsEffect;
},{}],15:[function(require,module,exports){
const ClientEffect = require(11);

class ClientWorldEffect extends ClientEffect {
  /**
   * @param model {WorldEffectModel}
   * @param world {ClientGameWorld}
   */
  constructor(model, world) {
    super(model);
    this.model = model;
    this.world = world;
  } // noinspection JSCheckFunctionSignatures

  /**
   * @param model {WorldEffectModel}
   * @param world {ClientGameWorld}
   * @returns {ClientWorldEffect | null}
   */


  static fromModel(model, world) {
    /** @type Class<ClientWorldEffect> */
    let clazz = this.Types.get(model.constructor);
    if (!clazz) return null;
    return new clazz(model, world);
  }

}

module.exports = ClientWorldEffect;
},{}],16:[function(require,module,exports){
const ClientWorldEffect = require(15);

const WorldExplodeEffectModel = require(88);

class ClientWorldExplodeEffect extends ClientWorldEffect {
  constructor(model, world) {
    super(model, world);
    this.model = void 0;
    this.model = model;
  }
  /**
   * @type {WorldExplodeEffectModel}
   */


  tick(dt) {
    this.world.explosionEffectPool.start(this.model.x, this.model.y, this.model.power);
    this.die();
  }

}

ClientWorldEffect.associate(WorldExplodeEffectModel, ClientWorldExplodeEffect);
module.exports = ClientWorldExplodeEffect;
},{}],17:[function(require,module,exports){
class Engine {
  constructor(config) {
    this.config = config;
  }

  configure(game, tank) {
    this.game = game;
    this.tank = tank;
    this.sound = this.game.playSound(this.config.sound, {
      loop: true,
      mapX: tank.x,
      mapY: tank.y
    });
    this.rpm = 1;
    this.gear = 0;
    this.const = {
      multiplier: this.config.multiplier || 11,
      gears: this.config.gears || [{
        gearing: 1
      }],
      gearUpRPM: this.config.gearUpRPM || 2.1,
      gearDownRPM: this.config.gearDownRPM || 1.9,
      pitch: this.config.pitch || 1,
      volume: this.config.volume || 1
    };
  }

  clone() {
    return new Engine(this.config);
  }

  destroy() {
    if (this.sound) this.sound.stop();
  }

  tick() {
    return;

    if (this.game) {
      if (this.sound) {
        this.sound.config.mapX = this.tank.x;
        this.sound.config.mapY = this.tank.y;
      }

      if (this.tank.model.health === 0) {
        this.destinationRPM = 0;
        this.sound.gainNode.value;
      } else {
        const tankSpeed = this.tank.options.transmissionSpeed * this.game.tps;
        const rpm = tankSpeed / this.const.multiplier;
        const currentGear = this.const.gears[this.gear];
        const nextGear = this.const.gears[this.gear + 1];
        const previousGear = this.const.gears[this.gear - 1];
        const currentRPM = rpm * currentGear.gearing;

        if (previousGear && currentRPM < currentGear.low) {
          this.gear--;
        }

        if (nextGear && currentRPM > currentGear.high) {
          this.gear++;
        }

        const minRPM = 1 - this.tank.options.clutch / 6;
        this.destinationRPM = Math.max(minRPM, rpm) * this.const.gears[this.gear].gearing * this.tank.options.clutch + (1 - this.tank.options.clutch);
      }

      if (this.destinationRPM < this.rpm) {
        this.rpm -= 0.1;

        if (this.destinationRPM > this.rpm) {
          this.rpm = this.destinationRPM;
        }
      } else if (this.destinationRPM > this.rpm) {
        this.rpm += 0.05;

        if (this.destinationRPM < this.rpm) {
          this.rpm = this.destinationRPM;
        }
      }

      if (this.sound) {
        this.sound.source.playbackRate.value = this.rpm * this.const.pitch;
        let volume = 0.3 + this.tank.options.clutch / 4;

        if (this.rpm < 0.7) {
          volume *= (this.rpm - 0.2) * 2;
        }

        this.sound.config.volume = volume * this.const.volume;
        this.game.updateSoundPosition(this.sound);
      }
    }
  }

}

module.exports = Engine;
},{}],18:[function(require,module,exports){
const ClientEntity = require(23);

class ClientBullet extends ClientEntity {
  constructor(model) {
    super(model);
  }

}

module.exports = ClientBullet;
},{}],19:[function(require,module,exports){
const ClientBullet = require(18);

const BulletModel16mm = require(93);

const BasicEntityDrawer = require(37);

class Drawer extends BasicEntityDrawer {
  draw(program) {
    this.drawSprite(Drawer.getSprite(0), 4, 12, program);
  }

}

Drawer.spriteNames = ["bullets/16mm/16mm"];

class ClientBullet16mm extends ClientBullet {
  constructor(model) {
    super(model);
    this.drawer = new Drawer(this);
  }

}

ClientBullet.associate(ClientBullet16mm, BulletModel16mm);
module.exports = ClientBullet16mm;
},{}],20:[function(require,module,exports){
const ClientBullet = require(18);

const BulletModel42mm = require(94);

const BasicEntityDrawer = require(37);

class Drawer extends BasicEntityDrawer {
  draw(program) {
    this.drawSprite(Drawer.getSprite(0), 6, 23, program);
  }

}

Drawer.spriteNames = ["bullets/42mm/42mm"];

class ClientBullet42mm extends ClientBullet {
  constructor(model) {
    super(model);
    this.drawer = new Drawer(this);
  }

}

ClientBullet.associate(ClientBullet42mm, BulletModel42mm);
module.exports = ClientBullet42mm;
},{}],21:[function(require,module,exports){
const ClientBullet = require(18);

const BulletModelCannonball = require(95);

const BasicEntityDrawer = require(37);

class Drawer extends BasicEntityDrawer {
  draw(program) {
    this.drawSprite(Drawer.getSprite(0), 18, 18, program);
  }

}

Drawer.spriteNames = ["bullets/cannonball/cannonball"];

class ClientBulletCannonball extends ClientBullet {
  constructor(model) {
    super(model);
    this.drawer = new Drawer(this);
  }

}

ClientBullet.associate(ClientBulletCannonball, BulletModelCannonball);
module.exports = ClientBulletCannonball;
},{}],22:[function(require,module,exports){
const ClientBullet = require(18);

const BulletModelMine = require(96);

const BasicEntityDrawer = require(37);

class Drawer extends BasicEntityDrawer {
  constructor(entity) {
    super(entity);
    this.shift = this.entity.model.id * 350;
  }

  draw(program) {
    let index = Math.floor((Date.now() + this.shift) / 1000) % 3;
    if (index === 2) index = 1;
    this.drawSprite(Drawer.getSprite(index), 60, 60, program);
  }

}

Drawer.spriteNames = ["bullets/mine/on", "bullets/mine/off"];

class ClientBulletMine extends ClientBullet {
  constructor(model) {
    super(model);
    this.drawer = new Drawer(this);
  }

}

ClientBullet.associate(ClientBulletMine, BulletModelMine);
module.exports = ClientBulletMine;
},{}],23:[function(require,module,exports){
const AbstractEntity = require(91);

const EntityDrawer = require(45);

const EntityModel = require(97);

class ClientEntity extends AbstractEntity {
  constructor(model) {
    super();
    /** @type EntityDrawer */

    this.drawer = null;
    /** @type EntityModel */

    this.model = model;
  }

  static fromModel(model) {
    let type = this.types.get(model.constructor);

    if (type) {
      return new type(model);
    }

    return null;
  }
  /**
   * Associates client wrapper class with the bullet model
   * @param clientClass Client class to associate with bullet model
   * @param modelClass Bullet model
   */


  static associate(clientClass, modelClass) {
    this.types.set(modelClass, clientClass);
  }

}

ClientEntity.types = new Map();
module.exports = ClientEntity;
},{}],24:[function(require,module,exports){
const GameWorld = require(98);

class ClientGameWorld extends GameWorld {
  /**
   * @type Player
   */

  /**
   * @type Particle[]
   */
  constructor(options) {
    super(options);
    this.player = null;
    this.particles = [];
  }

  processParticles(dt) {
    for (let i = 0, l = this.particles.length; i < l; i++) {
      let p = this.particles[i];
      p.tick(dt);

      if (p.dead) {
        this.particles.splice(i--, 1);
        l--;
      }
    }
  }

  tick(dt) {
    super.tick(dt);
    this.processParticles(dt);
  }

}

module.exports = ClientGameWorld;
},{}],25:[function(require,module,exports){
const Screen = require(68);

const LoadingScene = require(66);

const GameScene = require(26);

const Progress = require(83);

const Sprite = require(70);

require(162).setupPhysics();
/*
 * At this point we have all necessary modules loaded, so
 * it's time to initialize all dynamic modules. These
 * calls will be transformed into multiple require calls
 * for each file in those directories
 */


[require(19),require(20),require(21),require(22)];

[require(72),require(73),require(74),require(75)];

[require(40),require(41),require(42),require(43),require(44)];

[require(13),require(14)];

[require(16)];

class Game extends Screen {
  constructor(config) {
    super(config); //this.soundEngine = new SoundEngine()
  }

  initialize() {
    super.initialize();
    let spriteDownloadProgress = new Progress(); // let soundDownloadProgress = new Progress()

    let totalProgress = new Progress(); //

    totalProgress.addSubtask(spriteDownloadProgress); // totalProgress.addSubtask(soundDownloadProgress)

    this.setScene(new LoadingScene({
      screen: this,
      progress: totalProgress
    }));
    Sprite.download(spriteDownloadProgress, this.ctx, {
      mipMapLevels: 1
    }).then(() => {
      Sprite.applyTexture(this.ctx, 0);
      this.setScene(new GameScene({
        screen: this
      })); //    return this.soundEngine.download(soundDownloadProgress)
    }); //     .then(() => {
    //     this.setScene(new GameScene({
    //         screen: this
    //     }))
    // })
  }

}

window.Game = Game;
module.exports = Game;
},{}],26:[function(require,module,exports){
const Box2D = require(99);

const Scene = require(67);

const GameMap = require(159);

const ClientEntity = require(23);

const ClientTank = require(71);

const EventContainer = require(78);

const ClientGameWorld = require(24);

const MapPacket = require(108);

const PlayerJoinPacket = require(112);

const PlayerSpawnPacket = require(117);

const TankLocationsPacket = require(107);

const PlayerControlsPacket = require(111);

const PlayerConfigPacket = require(110);

const PlayerChatPacket = require(109);

const PlayerRespawnPacket = require(114);

const EntityCreatePacket = require(104);

const EntityRemovePacket = require(106);

const EntityListPacket = require(105);

const BlockUpdatePacket = require(101);

const PlayerLeavePacket = require(113);

const RoomListPacket = require(118);

const PlayerRoomRequestPacket = require(116);

const PlayerRoomChangePacket = require(115);

const EffectCreatePacket = require(102);

const EffectRemovePacket = require(103);

const WorldEffectModel = require(90);

const TankEffectModel = require(86);

const ClientTankEffect = require(12);

const ClientWorldEffect = require(15);

const ControlPanel = require(27);

const Client = require(60);

const Camera = require(1);

const Keyboard = require(7);

const PrimaryOverlay = require(31);

const ChatContainer = require(28);

const TouchController = require(8);

const PlayerControls = require(10);

const GamepadManager = require(6);

const MapDrawer = require(47);

const ParticleProgram = require(53);

const TextureProgram = require(55);

const ExplodePoolDrawer = require(46);

class GameScene extends Scene {
  /**
   * @type ClientGameWorld
   */
  constructor(config) {
    super(config);
    this.world = void 0;
    this.config = config;
    this.config.bgscale = this.config.bgscale || 2;
    this.controlsUpdateInterval = 0.1; // seconds

    this.camera = new Camera({
      baseScale: 3,
      viewport: new Box2D.b2Vec2(this.screen.width, this.screen.height),
      defaultPosition: new Box2D.b2Vec2(0, 0),
      inertial: true
    });
    this.keyboard = new Keyboard();
    this.controls = new ControlPanel();
    this.gamepad = new GamepadManager();
    this.touchController = new TouchController(this.controls, this.screen.canvas);
    this.playerControls = new PlayerControls();
    this.playerControls.setupKeyboard(this.keyboard);
    this.playerControls.setupGamepad(this.gamepad);
    this.playerControls.on("respawn", () => {
      if (this.world && this.world.player.tank) {
        this.client.send(new PlayerRespawnPacket());
      }
    });
    this.keyboard.startListening();
    this.touchController.startListening();
    this.gamepad.startListening();
    this.setupUpdateLoop();
    this.alive = false;
    this.client = new Client({
      ip: this.screen.config["ip"]
    });
    this.mapDrawer = new MapDrawer(this.camera, this.screen.ctx);
    this.particleProgram = new ParticleProgram("particle-drawer-program", this.screen.ctx);
    this.entityProgram = new TextureProgram("entity-drawer", this.screen.ctx);
    this.explodePoolDrawer = new ExplodePoolDrawer(this.camera, this.screen);
    this.createChat();
    this.initOverlay();
    this.initEvents();
    this.connect();
    this.layout();
    this.overlay.show();
  }

  initOverlay() {
    this.overlay = new PrimaryOverlay({
      root: this.overlayContainer,
      game: this
    });
    this.overlay.on("play", (nick, tank) => {
      if (this.world && this.world.player) {
        if (tank.getModel().getId() === this.world.player.tank.model.constructor.getId()) {
          return;
        }
      }

      this.client.send(new PlayerConfigPacket(nick, tank.getModel()));
    });
    this.overlay.roomSelectContainer.on("select", room => {
      this.client.send(new PlayerRoomRequestPacket(room));
    });
    this.keyboard.keybinding("Escape", () => {
      if (this.world && this.world.player) {
        if (this.overlay.shown) {
          this.overlay.hide();
        } else {
          this.overlay.show();
        }
      }
    });
  }

  initEvents() {
    this.eventContainer = new EventContainer();
    this.overlayContainer.append(this.eventContainer.element);
  }

  setupUpdateLoop() {
    const update = () => {
      this.screen.loop.scheduleTask(update, this.controlsUpdateInterval);

      if (this.world && this.world.player && this.world.player.tank.model.controls.shouldUpdate()) {
        this.client.send(new PlayerControlsPacket(this.world.player.tank.model.controls));
      }
    };

    update();
  }

  newPlayer(player, tank) {
    this.world.createPlayer(player);
    player.setTank(ClientTank.fromModel(tank));
    player.tank.world = this.world;
    player.tank.setupDrawer(this.screen.ctx);
    player.tank.model.initPhysics(this.world.world);
    return player;
  }

  connect() {
    this.client.connectToServer();
    this.client.on(MapPacket, packet => {
      if (this.world) return;
      this.camera.defaultPosition.x = packet.map.width / 2 * GameMap.BLOCK_SIZE;
      this.camera.defaultPosition.y = packet.map.height / 2 * GameMap.BLOCK_SIZE;

      if (this.world === null) {
        this.camera.reset();
      }

      this.world = new ClientGameWorld({
        map: packet.map
      });
    });
    this.client.on(PlayerJoinPacket, packet => {
      this.newPlayer(packet.player, packet.tank);
    });
    this.client.on(PlayerSpawnPacket, packet => {
      const player = this.newPlayer(packet.player, packet.tank);
      this.playerControls.connectTankControls(player.tank.model.controls);
      this.camera.target = player.tank.model.body.GetPosition();
      this.camera.targetVelocity = player.tank.model.body.GetLinearVelocity();
      this.world.player = player;
      this.overlay.hide();
    });
    this.client.on(TankLocationsPacket, packet => {
      packet.updateTankLocations(this.world.players);
    });
    this.client.on(PlayerChatPacket, packet => {
      this.chatContainer.addMessage(packet.text);
    });
    this.client.on(EntityListPacket, packet => {
      packet.updateEntities(this.world.entities);
    });
    this.client.on(EntityCreatePacket, packet => {
      packet.createEntities(model => {
        let wrapper = ClientEntity.fromModel(model);
        if (wrapper) this.world.entities.set(model.id, wrapper);
      });
    });
    this.client.on(EntityRemovePacket, packet => {
      packet.updateEntities(this.world.entities);
    });
    this.client.on(BlockUpdatePacket, packet => {
      this.world.map.setBlock(packet.x, packet.y, packet.block);
      this.mapDrawer.reset();
    });
    this.client.on(PlayerLeavePacket, packet => {
      const player = this.world.players.get(packet.playerId);
      this.world.removePlayer(player);
    });
    this.client.on(RoomListPacket, packet => {
      this.overlay.roomSelectContainer.updateRooms(packet.rooms);
    });
    this.client.on(PlayerRoomChangePacket, packet => {
      if (packet.error) {
        let event = "Не удалось подключиться к игре '" + packet.room + "': " + packet.error;
        this.eventContainer.createEvent(event);
      } else {
        this.playerControls.disconnectTankControls();
        this.world = null;
        this.chatContainer.clear();
        this.overlay.roomSelectContainer.selectRoom(packet.room);
      }
    });
    this.effects = new Map();
    this.client.on(EffectCreatePacket, packet => {
      let effect = packet.effect;
      if (this.effects.has(effect.id)) this.effects.get(effect.id).die();

      if (effect instanceof TankEffectModel) {
        let player = this.world.players.get(effect.tankId);
        if (!player || !player.tank) return;
        let tank =
        /** @type ClientTank */
        player.tank;
        let wrapper = ClientTankEffect.fromModel(effect, tank);
        tank.effects.set(effect.id, wrapper);
        this.effects.set(effect.id, wrapper);
      } else if (effect instanceof WorldEffectModel) {
        let wrapper = ClientWorldEffect.fromModel(effect, this.world);
        this.world.effects.set(effect.id, wrapper);
        this.effects.set(effect.id, wrapper);
      }
    });
    this.client.on(EffectRemovePacket, packet => {
      let effect = this.effects.get(packet.id);
      effect.die();
      this.effects.delete(packet.id);

      if (effect.model instanceof TankEffectModel) {
        let player = this.world.players.get(effect.model.tankId);
        if (!player || !player.tank) return;
        let tank =
        /** @type ClientTank */
        player.tank;
        tank.effects.delete(packet.id);
      } else if (effect.model instanceof WorldEffectModel) {
        this.world.effects.delete(packet.id);
      }
    });
  }

  layout() {
    this.camera.viewport.x = this.screen.width;
    this.camera.viewport.y = this.screen.height;
  }

  createChat() {
    this.chatContainer = new ChatContainer();
    this.overlayContainer.append(this.chatContainer.element);
    this.keyboard.keybinding("Enter", () => {
      if (this.world && this.world.player) {
        this.chatContainer.showInput();
      }
    });
    this.chatContainer.on("chat", text => this.client.send(new PlayerChatPacket(text)));
    this.chatContainer.on("input-focus", () => {
      this.keyboard.stopListening();
    });
    this.chatContainer.on("input-blur", () => {
      this.keyboard.startListening();
      this.screen.canvas.focus();
    });
  }

  pause() {
    cancelAnimationFrame(this.timer);
  }

  draw(ctx, dt) {
    this.gamepad.refresh();
    this.playerControls.refresh();

    if (!this.world) {
      return;
    }

    this.screen.swapFramebuffers();
    this.screen.clear(); // Drawing the scene

    this.camera.tick(dt);
    this.drawEntities();
    this.mapDrawer.draw(this.world.map);
    this.drawPlayers(dt);
    this.drawParticles(dt); // Post-processing

    this.screen.setScreenFramebuffer();
    this.screen.clear();
    this.explodePoolDrawer.draw(this.world.explosionEffectPool, dt);
    this.world.tick(dt);
  }

  drawParticles() {
    if (this.world.particles.length) {
      this.particleProgram.use();
      this.particleProgram.prepare();

      for (let particle of this.world.particles) {
        this.particleProgram.drawParticle(particle);
      }

      this.particleProgram.matrixUniform.setMatrix(this.camera.matrix.m);
      this.particleProgram.draw();
    }
  }

  drawPlayers(dt) {
    let players = this.world.players;

    for (let player of players.values()) {
      player.tank.drawer.draw(this.camera, dt);
    }
  }

  drawEntities() {
    let entities = this.world.entities;

    if (entities.size > 0) {
      this.entityProgram.use();
      this.entityProgram.prepare();

      for (let entity of entities.values()) {
        entity.drawer.draw(this.entityProgram);
      }

      this.entityProgram.matrixUniform.setMatrix(this.camera.matrix.m);
      this.entityProgram.draw();
    }
  }

}

module.exports = GameScene;
},{}],27:[function(require,module,exports){
class ControlPanel {
  constructor() {
    this.vidgets = [];
  }

  addVidget(vidget) {
    this.vidgets.push(vidget);
  }

  draw(ctx, spt) {
    this.vidgets.forEach(function (vidget) {
      if (vidget.hidden) return;
      ctx.translate(vidget.x, vidget.y);
      vidget.draw(ctx, spt);
      ctx.translate(-vidget.x, -vidget.y);
    });
  }

  captureTouch(touch) {
    let x = touch.left;
    let y = touch.top;

    for (let i = 0, l = this.vidgets.length; i < l; i++) {
      let vidget = this.vidgets[i];

      if (vidget.touched) {
        vidget.touchEnded();
      }

      if (x < vidget.x || x > vidget.x + vidget.width) continue;
      if (y < vidget.y || y > vidget.y + vidget.height) continue;
      vidget.touchStarted(x - vidget.x, y - vidget.y);
      vidget.touched = true;
      touch.vidget = vidget;
      touch.captured = this;
      return true;
    }

    return false;
  }

  touchEnded(touch) {
    if (touch.vidget) {
      touch.vidget.touchEnded();
      touch.vidget.touched = false;
    }
  }

  touchMoved(touch) {
    let vidget = touch.vidget;

    if (vidget) {
      let y = touch.top - vidget.y;
      let x = touch.left - vidget.x;
      vidget.touchMoved(x, y);
    }
  }

}

module.exports = ControlPanel;
},{}],28:[function(require,module,exports){
const View = require(80);

const HTMLEscape = require(146);

const Color = require(144);

class ChatContainer extends View {
  constructor() {
    super();
    this.element.addClass("chat-container");
    this.chat = $("<div>").addClass("chat");
    this.input = $("<input>").addClass("chat-input").hide();
    this.input.on("keydown", evt => {
      if (evt.key === "Enter") {
        let value = this.input.val().trim();

        if (value.length) {
          this.emit("chat", value);
        }
      } else if (evt.key !== "Escape") return;

      this.hideInput();
      evt.stopPropagation();
    });
    this.element.append(this.chat);
    this.element.append(this.input);
  }

  showInput() {
    this.input.show();
    this.input.focus();
    this.emit("input-focus");
  }

  hideInput() {
    this.input.blur();
    this.input.hide();
    this.input.val("");
    this.emit("input-blur");
  }

  addMessage(text) {
    text = this.parseColor(HTMLEscape(text));
    this.chat.append($("<div>").html(text));
    let element = this.element.get(0);
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }

  parseColor(text) {
    // Some examples:
    // §F00; This text will be colored red
    // §0F0; This text will be colored green,§; but this text will be styled as default
    // §!00F; This text will become bold and blue,§!; and this is a bold text with default color
    return Color.replace(text, function (color, bold, text) {
      if (bold) {
        if (color) return "<span style='font-weight:bold;color:#" + color + ";'>" + text + "</span>";
        return "<span style='font-weight:bold;'>" + text + "</span>";
      } else {
        if (color) return "<span style='color:#" + color + ";'>" + text + "</span>";else return text;
      }
    });
  }

  clear() {
    this.chat.html("");
  }

}

module.exports = ChatContainer;
},{}],29:[function(require,module,exports){
const View = require(80);

class ControlsContainer extends View {
  constructor(options) {
    super(options);
    this.element.addClass("menu tip");
    let header = $("<div>").addClass("header").text("Управление");
    this.checkbox = $("<input>").prop("type", "checkbox");
    this.button = $("<button>").text("ИГРАТЬ");
    this.element.append(header).append(this.line().height("120px").append(this.steeringTable("wasd")).append(" или ").append(this.steeringTable("↑←↓→")).append(" для управления")).append(this.line().append(this.key("ПРОБЕЛ").css("padding", "0 40px")).append(" — выстрел").append(this.key("Q").css("margin-left", "25px")).append(" — мина").append(this.key("R").css("margin-left", "25px")).append(" — респавн")).append(this.line().append(this.key("ВВОД").css("padding", "0 25px")).append(" — чат")).append($("<div>").addClass("wish").text("Желаем приятной игры!")).append($("<div>").addClass("checkbox").append(this.checkbox).append("не показывать больше")).append(this.button);
    this.button.on("click", () => {
      this.emit("confirm", this.checkbox.checked);
    });
  }

  line() {
    return $("<div>").addClass("line");
  }

  key(button) {
    return $("<div>").addClass("key").text(button);
  }

  steeringTable(buttons) {
    let table = $("<table>");
    let tbody = $("<tbody>");
    let button = 0;

    for (let line = 0; line < 2; line++) {
      let tr = $("<tr>");

      for (let key = 0; key < 3; key++) {
        let td = $("<td>");
        tr.append(td);

        if (line === 0) {
          if (key === 0 || key === 2) continue;
        }

        td.append(this.key(buttons[button++]));
      }

      tbody.append(tr);
    }

    return table.append(tbody);
  }

}

module.exports = ControlsContainer;
},{}],30:[function(require,module,exports){
const View = require(80);

class PlayMenuContainer extends View {
  constructor() {
    super();
    this.element.addClass("menu nick");
    this.titleLabel = $("<div>").css("text-align", "center").addClass("header");
    this.titleLabel.text("ВВЕДИТЕ НИК");
    this.nickInput = $("<input>");
    this.playButton = $("<button></button>").text("ИГРАТЬ");
    this.element.append(this.titleLabel);
    this.element.append(this.nickInput);
    this.element.append(this.playButton);

    let handler = () => {
      if (this.nickInput.val().length === 0) {
        this.playButton.prop("disabled", true);
      } else if (this.nickInput.val().length > 10) {
        this.playButton.prop("disabled", true);
      } else this.playButton.prop("disabled", false);
    };

    this.nickInput.on("input", handler);
    this.nickInput.on("change", handler);
    this.nickInput.on("paste", handler);
    this.nickInput.val(localStorage.getItem("tanks-nick") || "");
    this.playButton.on("click", () => {
      if (this.playButton.is("[disabled]")) return;
      let nick = this.nickInput.val();
      localStorage.setItem("tanks-nick", nick);
      this.emit("play");
    });
    handler();
  }

}

module.exports = PlayMenuContainer;
},{}],31:[function(require,module,exports){
const Overlay = require(77);

const ControlsContainer = require(29);

const PlayMenuContainer = require(30);

const TankPreviewContainer = require(34);

const TankSelectContainer = require(35);

const RoomListRequestPacket = require(119);

const RoomSelectContainer = require(32);

class PrimaryOverlay extends Overlay {
  constructor(options) {
    super(options);
    this.shown = false;
    this.game = options.game;
    this.menuContainer = $("<div>");
    this.steeringContainer = $("<div>").hide();
    this.overlay.append(this.menuContainer);
    this.overlay.append(this.steeringContainer);
    this.createTankPreviewMenu();
    this.createPlayMenu();
    this.createServerDropdown();
    this.createTankSelectContainer();
    this.createSteeringContainer();
  }

  shouldShowSteering() {
    return localStorage.getItem("showHints") !== "0";
  }

  setShouldShowSteering(value) {
    localStorage.setItem("showHints", value ? "1" : "0");
  }

  createPlayMenu() {
    this.playMenu = new PlayMenuContainer();
    this.playMenu.on("play", () => {
      if (this.shouldShowSteering() && !this.steeringShown) {
        this.steeringShown = true;
        this.menuContainer.fadeOut(() => {
          this.steeringContainer.fadeIn(300);
        });
      } else {
        this.emitPlay();
        this.hide();
      }
    });
    this.menuContainer.append(this.playMenu.element);
  }

  emitPlay() {
    this.emit("play", this.playMenu.nickInput.val(), this.tankSelectMenu.selectedTank);
  }

  createSteeringContainer() {
    this.steeringMenu = new ControlsContainer();
    this.steeringMenu.on("confirm", disable => {
      this.setShouldShowSteering(!disable);
      this.hide(() => {
        this.steeringContainer.hide();
        this.menuContainer.show();
      });
      this.emitPlay();
    });
    this.steeringContainer.append(this.steeringMenu.element);
  }

  createServerDropdown() {
    this.roomSelectContainer = new RoomSelectContainer();
    this.menuContainer.append(this.roomSelectContainer.element);
  }

  createTankSelectContainer() {
    this.tankSelectMenu = new TankSelectContainer();
    this.tankSelectMenu.on("select", tank => this.selectTank(tank));
    this.selectTank(this.tankSelectMenu.selectedTank);
    this.menuContainer.append(this.tankSelectMenu.element);
  }

  selectTank(tank) {
    this.selectedTank = tank;
    this.tankPreviewMenu.previewTank(tank);
  }

  createTankPreviewMenu() {
    this.tankPreviewMenu = new TankPreviewContainer();
    this.menuContainer.append(this.tankPreviewMenu.element);
  }

  show() {
    if (this.shown) return;
    super.show();
    this.game.client.send(new RoomListRequestPacket(true));
    this.tankSelectMenu.loop.start();
  }

  hide(callback) {
    if (!this.shown) return;
    super.hide(callback);
    this.game.client.send(new RoomListRequestPacket(false));
    this.tankSelectMenu.loop.stop();
  }

}

module.exports = PrimaryOverlay;
},{}],32:[function(require,module,exports){
const View = require(80);

const Dropdown = require(76);

class RoomSelectContainer extends View {
  constructor() {
    super();
    this.selectedRoom = null;
    this.dropdown = new Dropdown();
    this.element.append(this.dropdown.element);
    this.element.addClass("menu room-select");
    this.dropdown.on("expand", () => {
      this.element.addClass("expanded");
    });
    this.dropdown.on("collapse", () => {
      this.element.removeClass("expanded");
    });
    this.dropdown.on("select", option => {
      let room = option.find(".room-name").text();
      if (room === this.selectedRoom) return;
      this.selectedRoom = room;
      this.emit("select", room);
    });
    this.dropdown.prototypeCell.append($("<span>").addClass("room-name")).append(" (").append($("<span>").addClass("room-online")).append(" / ").append($("<span>").addClass("room-max-online")).append(")");
  }

  selectRoom(room) {
    this.selectedRoom = room;
    this.dropdown.getOptions().each((index, option) => {
      option = $(option);

      if (option.data("value") === room) {
        this.dropdown.selectOption(option);
        return false;
      }
    });
  }

  updateRooms(rooms) {
    this.dropdown.setOptionCount(rooms.length);
    this.dropdown.getOptions().each((index, option) => {
      option = $(option);
      const room = rooms[index];
      const disabled = room.online >= room.maxOnline;
      option.data("value", room.name);
      if (disabled) option.addClass("disabled");else option.removeClass("disabled");
      option.find(".room-name").text(room.name);
      option.find(".room-online").text(room.online);
      option.find(".room-max-online").text(room.maxOnline);

      if (this.selectedRoom === room.name) {
        this.dropdown.selectOption(option);
      }
    });
  }

}

module.exports = RoomSelectContainer;
},{}],33:[function(require,module,exports){
const View = require(80);

class StatScale extends View {
  constructor() {
    super();
    this.element.addClass("stat");
    this.statScale = $("<div>").addClass("stat-scale");
    this.value = $("<div>").addClass("stat-value");
    this.title = $("<div>").addClass("stat-title");
    this.element.append(this.statScale);
    this.element.append(this.value);
    this.element.append(this.title);
    this.stat = null;
  }

  setStat(stat) {
    this.stat = stat;
    this.statScale.css("background", stat.color);
    this.value.css("color", stat.color);
    this.title.text(stat.name);
  }

  setValue(value) {
    if (value) {
      this.element.css("opacity", "");
      let fraction = this.stat.func(value, this.stat.maximum);
      const size = 165 + fraction * 150;
      this.statScale.css("width", size + "px");
      this.value.css("left", size + 10 + "px");
      this.value.text(value);
    } else {
      this.element.css("opacity", "0.5");
      this.statScale.css("width", "165px");
      this.value.css("left", "165px");
      this.value.text("");
    }
  }

}

module.exports = StatScale;
},{}],34:[function(require,module,exports){
const View = require(80);

const StatScale = require(33);

class Stat {
  constructor(options) {
    this.name = options.name;
    this.color = options.color;
    this.maximum = options.maximum;
    this.func = options.func || Stat.Linear();
  }

  static Linear(value, maximum) {
    return value / maximum;
  }

  static Reversive(value, maximum) {
    return maximum / value;
  }

}

class TankPreviewContainer extends View {
  constructor() {
    super();
    this.element.addClass("menu tankinfo");
    this.tankPreview = $("<div></div>").addClass("tank-preview");
    this.previewCanvas = $("<canvas></canvas>");
    let canvas = this.previewCanvas[0];
    canvas.width = 155 * devicePixelRatio;
    canvas.height = 155 * devicePixelRatio;
    this.previewCtx = canvas.getContext("2d");
    this.previewCtx.scale(devicePixelRatio, devicePixelRatio);
    this.previewTitle = $("<h1>");
    this.tankPreview.append(this.previewCanvas);
    this.tankPreview.append(this.previewTitle);
    this.statContainer = $("<div></div>").addClass("tank-stats");
    this.descriptionBlock = $("<div></div>").addClass("description");
    this.element.append(this.tankPreview);
    this.element.append(this.statContainer);
    this.element.append(this.descriptionBlock);
    this.statElements = new Map();
    this.setupStats();
  }

  setupStats() {
    for (let [key, stat] of TankPreviewContainer.stats.entries()) {
      let element = new StatScale();
      this.statContainer.append(element.element);
      element.setStat(stat);
      this.statElements.set(key, element);
    }
  }

  drawTank(tank) {
    this.previewCtx.save();
    this.previewCtx.clearRect(0, 0, 155, 155);
    this.previewCtx.translate(155 / 2, 155 / 2);
    this.previewCtx.scale(5, 5); // let drawer = new (tank.getDrawer())
    // drawer.draw(this.previewCtx, null)

    this.previewCtx.restore();
  }

  applyStats(tank) {
    for (let [key, element] of this.statElements.entries()) {
      const statValue = tank.getStats()[key];
      element.setValue(statValue);
    }
  }

  previewTank(tank) {
    this.drawTank(tank);
    this.previewTitle.text(tank.getName());
    this.descriptionBlock.text(tank.getDescription());
    this.applyStats(tank);
  }

}

TankPreviewContainer.stats = new Map([["damage", new Stat({
  name: "УРОН",
  color: "#E82020",
  maximum: 7,
  func: Stat.Linear
})], ["health", new Stat({
  name: "БРОНЯ",
  color: "#D657FF",
  maximum: 20,
  func: Stat.Linear
})], ["speed", new Stat({
  name: "СКОРОСТЬ",
  color: "#FF8E26",
  maximum: 120,
  func: Stat.Linear
})], ["shootrate", new Stat({
  name: "СКОРОСТРЕЛЬНОСТЬ",
  color: "#1CBCEF",
  maximum: 0.2,
  func: Stat.Reversive
})], ["reload", new Stat({
  name: "ПЕРЕЗАРЯДКА",
  color: "#55D346",
  maximum: 1,
  func: Stat.Reversive
})]]);
module.exports = TankPreviewContainer;
},{}],35:[function(require,module,exports){
const View = require(80);

const ClientTank = require(71);

const SniperTank = require(75); // Default selected tank


const TankSelectElement = require(36);

const Camera = require(1);

const Box2D = require(99);

const RenderLoop = require(148);

class TankSelectContainer extends View {
  constructor() {
    super();
    this.element.addClass("menu tankselect");
    this.shadowLeft = $("<div>").addClass("shadow left");
    this.shadowRight = $("<div>").addClass("shadow right");
    this.container = $("<div>").addClass("tank-select-container");
    this.element.append(this.container, this.shadowLeft, this.shadowRight);
    this.leftShadowHidden = false;
    this.rightShadowHidden = false;
    this.selectedTank = null;
    this.previewCamera = new Camera({
      baseScale: 2,
      viewport: new Box2D.b2Vec2(70, 70),
      defaultPosition: new Box2D.b2Vec2(0, 0),
      inertial: true
    });
    this.previewCamera.tick(0);
    this.previewWorld = new Box2D.b2World(new Box2D.b2Vec2(), true);
    this.loop = new RenderLoop();

    this.loop.run = dt => this.renderCards(dt);
    /**
     * @type {TankSelectElement[]}
     */


    this.containers = [];
    this.setupList();
    this.setupScroll();
  }

  setupList() {
    let selectedTank = Number(localStorage.getItem("tanks-selectedtank") || SniperTank.getModel().getId());
    let tankExists = false;

    for (let tank of ClientTank.Types.values()) {
      if (tank.getModel().getId() === selectedTank) {
        tankExists = true;
        break;
      }
    }

    if (!tankExists) {
      selectedTank = SniperTank.getModel().getId();
    } // Использую forEach здесь, чтобы создать область видимости.
    // В for-in нельзя было бы юзать Tank в асинхронном коде.
    // Пишу это, чтобы будущий я не злился на меня из прошлого,
    // читая этот код. Знай, что переписать танчики стоило
    // примерно месяц времени, там есть на что злиться. Можешь
    // перечитать то что там понаписано, это звездец.
    // Хотя с другой стороны, человек набирает опыт, и, возможно,
    // в будущем я смогу применить более интересные практики для
    // улучшения архитектуры и упрощения кода. Так что если ты
    // взялся переписывать танчики снова, то флаг тебе в руки. Мне
    // очень интересно что ты придумаешь через год-два. Мда. Из
    // обычной пометки этот комментарий превратился в письмо в
    // будущее. Классика.


    let x = 20;
    ClientTank.Types.forEach(Tank => {
      let container = new TankSelectElement({
        Tank: Tank,
        previewWorld: this.previewWorld,
        previewCamera: this.previewCamera
      });
      container.setPosition(x);
      container.on("click", () => this.selectTank(container));
      this.container.append(container.element);
      if (Tank.getModel().getId() === selectedTank) this.selectTank(container);
      this.containers.push(container);
      x += container.width;
    });
    this.updateCards();
  }

  renderCards(dt) {
    for (let container of this.containers) {
      if (container.hidden) continue;
      container.draw(dt);
    }
  }

  updateCards() {
    let container = this.container.get(0);
    let lowerBound = container.scrollX;
    let upperBound = lowerBound + container.clientWidth;

    for (let container of this.containers) {
      let offset = container.position;

      if (upperBound < offset.x) {
        if (!container.hidden) container.hide();
        continue;
      }

      let width = container.width;

      if (lowerBound > offset.x + width) {
        if (!container.hidden) container.hide();
        continue;
      }

      if (container.hidden) container.show();
    }
  }

  selectTank(container) {
    const Tank = container.Tank;
    this.element.find(".tank-preview-container.selected").removeClass("selected");
    container.element.addClass("selected");
    localStorage.setItem("tanks-selectedtank", String(Tank.getModel().getId()));
    this.selectedTank = Tank;
    this.emit("select", Tank);
  }

  setupScroll() {
    this.container.on("scroll", () => this.updateShadows());
    this.updateShadows();
    this.updateCards();
  }

  updateShadows() {
    let container = this.container.get(0);
    let leftEdge = container.scrollLeft === 0;
    let rightEdge = container.scrollLeft === container.scrollWidth - container.clientWidth;

    if (leftEdge && !this.leftShadowHidden) {
      this.leftShadowHidden = true;
      this.shadowLeft.css("opacity", "0");
    }

    if (rightEdge && !this.rightShadowHidden) {
      this.rightShadowHidden = true;
      this.shadowRight.css("opacity", "0");
    }

    if (!leftEdge && this.leftShadowHidden) {
      this.leftShadowHidden = false;
      this.shadowLeft.css("opacity", "1");
    }

    if (!rightEdge && this.rightShadowHidden) {
      this.rightShadowHidden = false;
      this.shadowRight.css("opacity", "1");
    }
  }

}

module.exports = TankSelectContainer;
},{}],36:[function(require,module,exports){
const View = require(80);

const CanvasFactory = require(81);

const Sprite = require(70);

class TankSelectElement extends View {
  /**
   *
   * @type {Class<ClientTank>}
   */

  /**
   * @type {ClientTank}
   */
  constructor(options) {
    super();
    this.canvasSize = 70;
    this.Tank = null;
    this.tank = null;
    this.Tank = options.Tank;
    this.previewWorld = options.previewWorld;
    this.previewCamera = options.previewCamera;
    this.element.addClass("tank-preview-container");
    this.width = 120;
    this.position = 0;
    let factory = CanvasFactory();
    this.canvas = factory.canvas;
    this.canvas.className = "preview-canvas";
    this.canvas.width = this.canvasSize * devicePixelRatio;
    this.canvas.height = this.canvasSize * devicePixelRatio;
    this.ctx = factory.ctx;
    this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);
    Sprite.applyTexture(this.ctx);
    this.title = $("<div>").addClass("tank-preview-title");
    this.title.text(this.Tank.getName());
    this.element.append(this.canvas);
    this.element.append(this.title);
    this.element.on("click", () => this.emit("click"));
    this.hidden = true;
    this.element.hide();
  }

  setPosition(x) {
    this.position = x;
    this.element.css("left", x);
  }

  show() {
    this.hidden = false;
    this.element.show();
  }

  hide() {
    this.hidden = true;
    this.element.hide();
  }

  createTank() {
    this.tank = new this.Tank();
    this.tank.setupDrawer(this.ctx);
    this.tank.model.initPhysics(this.previewWorld);
    const fixtureList = this.tank.model.body.GetFixtureList();
    fixtureList.m_filter.maskBits = 0x000;
    fixtureList.m_filter.categoryBits = 0x000;
  }

  getTank() {
    if (!this.tank) this.createTank();
    return this.tank;
  }

  draw(dt) {
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
    let tank = this.getTank();
    tank.model.body.SetAngle(tank.model.body.GetAngle() + dt);
    tank.drawer.draw(this.previewCamera, dt);
  }

}

module.exports = TankSelectElement;
},{}],37:[function(require,module,exports){
const EntityDrawer = require(45);

const Sprite = require(70);

const Matrix3 = require(50);

class BasicEntityDrawer extends EntityDrawer {
  static getSprite(i) {
    if (!this.sprites) {
      Object.defineProperty(this, "sprites", {
        enumerable: false,
        value: []
      });
    }

    if (!this.sprites[i]) {
      this.sprites[i] = Sprite.named(this.spriteNames[i]);
    }

    return this.sprites[i];
  }

  constructor(entity) {
    super(entity);
    this.matrix = new Matrix3();
  }

  drawSprite(sprite, width, height, program) {
    const x = this.entity.model.x;
    const y = this.entity.model.y;
    const w = width / 6;
    const h = height / 6;
    this.matrix.reset();
    this.matrix.translate(x, y);
    this.matrix.rotate(-this.entity.model.rotation);
    program.setTransform(this.matrix);
    program.drawSprite(sprite, -w / 2, -h / 2, w, h);
    program.setTransform(null);
  }

}

BasicEntityDrawer.spriteNames = [];
module.exports = BasicEntityDrawer;
},{}],38:[function(require,module,exports){
const Sprite = require(70);

const GameMap = require(159);

class BlockDrawer {
  constructor() {
    this.id = 0;
  }

  loadSprites() {
    this.crackSprites = [Sprite.named("blocks/crack/1"), Sprite.named("blocks/crack/2"), Sprite.named("blocks/crack/3"), Sprite.named("blocks/crack/4"), Sprite.named("blocks/crack/5")];
  }
  /**
   *
   * @param {TextureProgram} program
   * @param x
   * @param y
   * @param {BlockState} block
   */


  draw(program, x, y, block) {
    if (!block.constructor.typeId) return;
    let crack = Math.floor(block.damage * 6);

    if (crack) {
      program.drawSprite(this.crackSprites[crack - 1], x, y, GameMap.BLOCK_SIZE, GameMap.BLOCK_SIZE);
    }
  }

}

module.exports = BlockDrawer;
},{}],39:[function(require,module,exports){
const BlockDrawer = require(38);

const Sprite = require(70);

const GameMap = require(159);

class EdgedBlockDrawer extends BlockDrawer {
  constructor() {
    super();
    this.variants = null;
    this.spritePath = "blocks/concrete";
  }

  loadSprites() {
    super.loadSprites();
    this.variants = [];

    if (Array.isArray(this.spritePath)) {
      for (let path of this.spritePath) {
        this.variants.push(this.loadVariant(path));
      }
    } else if (typeof this.spritePath == "string") {
      this.variants.push(this.loadVariant(this.spritePath));
    }

    this.spriteSize = this.variants[0][0].rect.w;
    this.halfSpriteSize = this.spriteSize / 2;
  }

  loadVariant(path) {
    if (path.length && !path.endsWith("/")) {
      path += "/";
    }

    let allWalls = Sprite.named(path + "all-walls");
    let allSides = Sprite.named(path + "all-sides");
    let allCorners = Sprite.named(path + "all-corners");
    let leftRightWalls = Sprite.named(path + "left-right-walls");
    let topBottomWalls = Sprite.named(path + "top-bottom-walls");
    return [allWalls, topBottomWalls, leftRightWalls, allCorners, allSides];
  }

  drawSlice(program, x, y, slice, s, h, dx, dy) {
    dx += slice.x;
    dy += slice.y;
    program.vertexBuffer.appendArray([x, y, dx, dy, x + h, y, dx + s, dy, x, y + h, dx, dy + s, x + h, y + h, dx + s, dy + s]);
    let base = program.textures * 4;
    program.indexBuffer.appendArray([base, base + 1, base + 3, base, base + 2, base + 3]);
    program.textures++;
  }

  draw(program, x, y, block) {
    if (!this.variants) {
      this.loadSprites();
    }

    let variant;
    if (block.variant) variant = this.variants[block.variant];else variant = this.variants[0];
    x *= GameMap.BLOCK_SIZE;
    y *= GameMap.BLOCK_SIZE;
    const half = GameMap.BLOCK_SIZE / 2;

    if ((block.facing & 0b111111111111) === 0b000000000000) {
      this.drawSlice(program, x, y, variant[0].rect, this.spriteSize, GameMap.BLOCK_SIZE, 0, 0);
    } else if ((block.facing & 0b111111111111) === 0b100100100100) {
      this.drawSlice(program, x, y, variant[4].rect, this.spriteSize, GameMap.BLOCK_SIZE, 0, 0);
    } else {
      const s = this.halfSpriteSize;
      const h = GameMap.BLOCK_SIZE / 2;
      this.drawSlice(program, x, y + half, variant[block.facing >> 9 & 7].rect, s, h, 0, s);
      this.drawSlice(program, x + half, y + half, variant[block.facing >> 6 & 7].rect, s, h, s, s);
      this.drawSlice(program, x + half, y, variant[block.facing >> 3 & 7].rect, s, h, s, 0);
      this.drawSlice(program, x, y, variant[block.facing & 7].rect, s, h, 0, 0);
    }

    super.draw(program, x, y, block);
  }

}

module.exports = EdgedBlockDrawer;
},{}],40:[function(require,module,exports){
const EdgedBlockDrawer = require(39);

const MapDrawer = require(47);

class BrickBlockDrawer extends EdgedBlockDrawer {
  constructor() {
    super();
    this.spritePath = "blocks/brick";
  }

}

MapDrawer.registerBlockLoader(1, new BrickBlockDrawer());
module.exports = BrickBlockDrawer;
},{}],41:[function(require,module,exports){
const EdgedBlockDrawer = require(39);

const MapDrawer = require(47);

class ConcreteBlockDrawer extends EdgedBlockDrawer {
  constructor() {
    super();
    this.spritePath = "blocks/concrete";
  }

}

MapDrawer.registerBlockLoader(2, new ConcreteBlockDrawer());
module.exports = ConcreteBlockDrawer;
},{}],42:[function(require,module,exports){
const EdgedBlockDrawer = require(39);

const MapDrawer = require(47);

class StoneBlockDrawer extends EdgedBlockDrawer {
  constructor() {
    super();
    this.spritePath = "blocks/stone";
  }

}

MapDrawer.registerBlockLoader(5, new StoneBlockDrawer());
module.exports = StoneBlockDrawer;
},{}],43:[function(require,module,exports){
const EdgedBlockDrawer = require(39);

const MapDrawer = require(47);

class TrophephngoldBlockDrawer extends EdgedBlockDrawer {
  constructor() {
    super();
    this.spritePath = "blocks/trophephngold";
  }

}

MapDrawer.registerBlockLoader(4, new TrophephngoldBlockDrawer());
module.exports = TrophephngoldBlockDrawer;
},{}],44:[function(require,module,exports){
const EdgedBlockDrawer = require(39);

const MapDrawer = require(47);

class WoodBlockDrawer extends EdgedBlockDrawer {
  constructor() {
    super();
    this.spritePath = [];

    for (let i = 0; i <= 17; i++) {
      this.spritePath.push("blocks/wood/variant-" + i);
    }
  }

}

MapDrawer.registerBlockLoader(3, new WoodBlockDrawer());
module.exports = WoodBlockDrawer;
},{}],45:[function(require,module,exports){
class EntityDrawer {
  constructor(entity) {
    this.entity = entity;
  }
  /**
   * Draws the specified entity.
   * @param program {TextureProgram}
   */


  draw(program) {}

}

module.exports = EntityDrawer;
},{}],46:[function(require,module,exports){
const Color = require(144);

const ExplodeParticle = require(61);

const PostProcessingProgram = require(54);

const Particle = require(63);

class ExplodePoolDrawer {
  constructor(camera, screen) {
    this.screen = screen;
    this.camera = camera;
    this.program = new PostProcessingProgram("explosion-drawer", this.screen.ctx);
  }

  draw(pool, dt) {
    if (dt === 0) return;
    this.program.use();
    this.program.prepare();
    this.screen.ctx.activeTexture(this.screen.ctx.TEXTURE15);
    this.screen.ctx.bindTexture(this.screen.ctx.TEXTURE_2D, this.screen.inactiveFramebufferTexture());
    this.program.textureUniform.set1i(15);

    for (let row of pool.walkers.values()) {
      for (let walker of row.values()) {
        let normalized = pool.normalize(walker.power); //
        // let decoration = new Particle({
        //     width: 20,
        //     height: 20,
        //     x: walker.x,
        //     y: walker.y,
        //     dx: 0,
        //     dy: 0,
        //     color: new Color(255, 0, 0, pool.normalize(walker.power)),
        //     scaling: 0,
        //     lifetime: dt
        // })
        //
        // pool.world.particles.push(decoration)
        // continue

        if (normalized < 0.3) continue;
        let dx = 0;
        let dy = 0;

        for (let i = 0; i < 3; i++) {
          let decoration = new ExplodeParticle({
            width: 2 + normalized * 8,
            height: 2 + normalized * 8,
            x: walker.x + (Math.random() - 0.5) * pool.gridSize * 2,
            y: walker.y + (Math.random() - 0.5) * pool.gridSize * 2,
            dx: dx,
            dy: dy,
            scaling: 1 + normalized / 2,
            lifetime: 0.6 - normalized / 2 + Math.random() * 0.3,
            startOpacity: normalized / 2,
            shifting: 1 - normalized * 2
          });
          pool.world.particles.push(decoration);
        }
      }
    }

    this.program.draw();
  }

}

module.exports = ExplodePoolDrawer;
},{}],47:[function(require,module,exports){
const Sprite = require(70);

const TextureProgram = require(55);

class MapDrawer {
  static registerBlockLoader(id, drawer) {
    this.RegisteredDrawers.set(id, drawer);
  }

  constructor(camera, ctx) {
    this.camera = camera;
    this.ctx = ctx;
    this.program = new TextureProgram("map-drawer-program", ctx, {
      largeIndices: true
    });
    this.reset();
  }

  reset() {
    this.oldBounds = {
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0
    };
  }

  draw(map) {
    const scale = this.camera.scale;
    let mipmaplevel = Math.ceil(1 / scale) - 1;
    let oldmipmaplevel = Sprite.mipmaplevel;

    if (mipmaplevel >= Sprite.mipmapimages.length) {
      mipmaplevel = Sprite.mipmapimages.length - 1;
    }

    if (mipmaplevel !== oldmipmaplevel) {
      Sprite.setMipMapLevel(mipmaplevel);
    }

    const visibleWidth = this.camera.viewport.x / scale;
    const visibleHeight = this.camera.viewport.y / scale;
    const cx = this.camera.position.x + this.camera.shaking.x;
    const cy = this.camera.position.y + this.camera.shaking.y;
    let x0 = cx - visibleWidth / 2,
        y0 = cy - visibleHeight / 2;
    let x1 = x0 + visibleWidth,
        y1 = y0 + visibleHeight;
    const maxWidth = map.width * 20;
    const maxHeight = map.height * 20;
    x0 = Math.floor(Math.max(0, x0) / 20);
    y0 = Math.floor(Math.max(0, y0) / 20);
    x1 = Math.ceil(Math.min(maxWidth, x1) / 20);
    y1 = Math.ceil(Math.min(maxHeight, y1) / 20);

    if (x0 !== this.oldBounds.x0 || x1 !== this.oldBounds.x1 || y0 !== this.oldBounds.y0 || y1 !== this.oldBounds.y1 || mipmaplevel !== oldmipmaplevel) {
      this.oldBounds.x0 = x0;
      this.oldBounds.x1 = x1;
      this.oldBounds.y0 = y0;
      this.oldBounds.y1 = y1;
      this.program.prepare();
      this.program.use(this.ctx);
      Sprite.setGLMipMapLevel(this.ctx, this.program.textureUniform, mipmaplevel);
      this.program.matrixUniform.setMatrix(this.camera.matrix.m);

      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          const block = map.getBlock(x, y);
          if (block) this.drawBlock(block, x, y, map);
        }
      }

      this.program.draw();
    } else {
      this.program.prepare(false);
      this.program.use(this.ctx);
      this.program.matrixUniform.setMatrix(this.camera.matrix.m);
      Sprite.setGLMipMapLevel(this.ctx, this.program.textureUniform, mipmaplevel);
      this.program.draw(false);
    }

    if (mipmaplevel !== oldmipmaplevel) {
      Sprite.setMipMapLevel(oldmipmaplevel);
    }
  }

  drawBlock(block, x, y, map) {
    let id = block.constructor.typeId;
    if (id === 0) return;
    let drawer = MapDrawer.RegisteredDrawers.get(id);

    if (drawer) {
      drawer.draw(this.program, x, y, block, map);
    }
  }

}

MapDrawer.RegisteredDrawers = new Map();
module.exports = MapDrawer;
},{}],48:[function(require,module,exports){
const Color = require(144);

const Smoke = require(65);

class TankDrawer {
  /**
   * @type {ClientTank}
   */

  /**
   * @type {WebGLRenderingContextBase}
   */

  /**
   * @param tank {ClientTank}
   * @param ctx {WebGLRenderingContextBase}
   */
  constructor(tank, ctx) {
    this.tank = null;
    this.ctx = null;
    this.tank = tank; // TODO перенести эту шнягу куда-то ещё

    this.smokeTicks = 0;
    this.ctx = ctx;
  }

  drawSmoke(dt) {
    if (!this.tank) return;
    if (!this.tank.model) return;
    if (this.tank.model.health >= 7) return;
    let intense = 1 - this.tank.model.health / 7;
    this.smokeTicks += intense * dt;

    if (this.smokeTicks > 0.2) {
      this.smokeTicks -= 0.2;
      const gray = (1 - intense) * 255;
      const color = new Color(gray, gray, gray);
      const position = this.tank.model.body.GetPosition();
      const smoke = new Smoke({
        x: position.x,
        y: position.y,
        dx: (this.tank.model.matrix.sin * 5 + Math.random() - 0.5) * 15,
        dy: (-this.tank.model.matrix.cos * 5 + Math.random() - 0.5) * 15,
        size: 2,
        scaling: 50,
        color: color
      });
      this.tank.player.game.particles.push(smoke);
    }
  }

  draw(camera, dt) {}

}

module.exports = TankDrawer;
},{}],49:[function(require,module,exports){
const Buffer = require(123);

class GLBuffer extends Buffer {
  constructor(config) {
    super(config);
    this.gl = config.gl;
    this.index = config.index;
    this.clazz = this.clazz || Float32Array;
    this.drawMode = config.drawMode || this.gl.STATIC_DRAW;
    this.bufferType = config.bufferType || this.gl.ARRAY_BUFFER;
    this.glBuffer = null;
    this.shouldUpdate = true;
  }

  createBuffer() {
    super.createBuffer();
    this.glBuffer = this.gl.createBuffer();
    return this;
  }

  extend(minimumCapacity) {
    if (super.extend(minimumCapacity)) {
      this.shouldUpdate = true;
      return true;
    }

    return false;
  }

  bind() {
    this.gl.bindBuffer(this.bufferType, this.glBuffer);
  }

  updateData() {
    this.bind();

    if (this.shouldUpdate) {
      this.shouldUpdate = false;
      this.gl.bufferData(this.bufferType, this.array, this.drawMode, this.array.length);
    } else {
      this.gl.bufferSubData(this.bufferType, 0, this.array);
    }
  }

}

module.exports = GLBuffer;
},{}],50:[function(require,module,exports){
const m3 = function () {
  "use strict";

  function multiply(a, b) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[3 + 1];
    const a12 = a[3 + 2];
    const a20 = a[2 * 3];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[3 + 1];
    const b12 = b[3 + 2];
    const b20 = b[2 * 3];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return new Float32Array([b00 * a00 + b01 * a10 + b02 * a20, b00 * a01 + b01 * a11 + b02 * a21, b00 * a02 + b01 * a12 + b02 * a22, b10 * a00 + b11 * a10 + b12 * a20, b10 * a01 + b11 * a11 + b12 * a21, b10 * a02 + b11 * a12 + b12 * a22, b20 * a00 + b21 * a10 + b22 * a20, b20 * a01 + b21 * a11 + b22 * a21, b20 * a02 + b21 * a12 + b22 * a22]);
  }

  function identity() {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  function translation(tx, ty) {
    return new Float32Array([1, 0, 0, 0, 1, 0, tx, ty, 1]);
  }

  function translate(m, tx, ty) {
    return multiply(m, translation(tx, ty));
  }

  function rotation(s, c) {
    return new Float32Array([c, -s, 0, s, c, 0, 0, 0, 1]);
  }

  function rotate(m, angle) {
    return multiply(m, rotation(Math.sin(angle), Math.cos(angle)));
  }

  function turn(m, s, c) {
    return multiply(m, rotation(s, c));
  }

  function scaling(sx, sy) {
    return new Float32Array([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
  }

  function scale(m, sx, sy) {
    return multiply(m, scaling(sx, sy));
  }

  function inverse(m) {
    const t00 = m[3 + 1] * m[2 * 3 + 2] - m[3 + 2] * m[2 * 3 + 1];
    const t10 = m[1] * m[2 * 3 + 2] - m[2] * m[2 * 3 + 1];
    const t20 = m[1] * m[3 + 2] - m[2] * m[3 + 1];
    const d = 1.0 / (m[0] * t00 - m[3] * t10 + m[2 * 3] * t20);
    return new Float32Array([d * t00, -d * t10, d * t20, -d * (m[3] * m[2 * 3 + 2] - m[3 + 2] * m[2 * 3]), d * (m[0] * m[2 * 3 + 2] - m[2] * m[2 * 3]), -d * (m[0] * m[3 + 2] - m[2] * m[3]), d * (m[3] * m[2 * 3 + 1] - m[3 + 1] * m[2 * 3]), -d * (m[0] * m[2 * 3 + 1] - m[1] * m[2 * 3]), d * (m[0] * m[3 + 1] - m[1] * m[3])]);
  }

  return {
    identity: identity,
    multiply: multiply,
    rotation: rotation,
    rotate: rotate,
    scaling: scaling,
    scale: scale,
    translation: translation,
    translate: translate,
    inverse: inverse,
    turn: turn
  };
}();

class Matrix3 {
  constructor() {
    this.m = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    this.stack = [];
  }

  save() {
    this.stack.push(this.m.slice());
  }

  restore() {
    this.m = this.stack.pop();
  }

  inverse() {
    this.m = m3.inverse(this.m);
  }

  rotate(angle) {
    this.m = m3.rotate(this.m, angle);
  }

  turn(sin, cos) {
    this.m = m3.turn(this.m, sin, cos);
  }

  translate(x, y) {
    this.m = m3.translate(this.m, x, y);
  }

  scale(x, y) {
    this.m = m3.scale(this.m, x, y);
  }

  transformX(x, y) {
    return this.m[0] * x + this.m[3] * y + this.m[6];
  }

  transformY(x, y) {
    return this.m[1] * x + this.m[4] * y + this.m[7];
  }

  reset() {
    this.m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

}

module.exports = Matrix3;
},{}],51:[function(require,module,exports){
const Uniform = require(59);

const GLBuffer = require(49);

class Program {
  constructor(name) {
    this.name = name;
    this.shaders = Array.prototype.slice.call(arguments, 1);
    this.raw = null;
    this.ctx = null;
  }

  link(gl) {
    this.raw = gl.createProgram();

    for (let shader of this.shaders) gl.attachShader(this.raw, shader.raw);

    gl.linkProgram(this.raw);

    if (!gl.getProgramParameter(this.raw, gl.LINK_STATUS)) {
      throw new Error("Failed to link bodyProgram: " + gl.getProgramInfoLog(this.raw));
    }

    this.ctx = gl;
    return this;
  }

  createIndexBuffer() {
    return new GLBuffer({
      gl: this.ctx,
      clazz: Uint16Array,
      bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
      drawMode: this.ctx.STATIC_DRAW
    }).createBuffer();
  }

  getUniform(name) {
    return new Uniform(this, name);
  }

  getAttribute(name) {
    return this.ctx.getAttribLocation(this.raw, name);
  }

  use() {
    this.ctx.useProgram(this.raw);
  }

  prepare() {}

}

module.exports = Program;
},{}],52:[function(require,module,exports){
const Program = require(51);

const Shader = require(57);

const GLBuffer = require(49);

const Sprite = require(70);

class LightMaskTextureProgram extends Program {
  constructor(name, ctx) {
    let vertexShader = new Shader("light-mask-texture-vertex", Shader.VERTEX).compile(ctx);
    let fragmentShader = new Shader("light-mask-texture-fragment", Shader.FRAGMENT).compile(ctx);
    super(name, vertexShader, fragmentShader);
    this.link(ctx);
    this.ctx = ctx;
    this.vertexBuffer = new GLBuffer({
      gl: ctx,
      drawMode: this.ctx.STATIC_DRAW
    }).createBuffer();
    this.brightTexturePositionAttribute = this.getAttribute("a_bright_texture_position");
    this.darkTexturePositionAttribute = this.getAttribute("a_dark_texture_position");
    this.maskPositionAttrubute = this.getAttribute("a_mask_position");
    this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
    this.samplerUniform = this.getUniform("u_texture");
    this.textureSizeUniform = this.getUniform("u_texture_size");
    this.angleUniform = this.getUniform("u_angle");
    this.matrixUniform = this.getUniform("u_matrix");
    this.vertexLength = 8;
    this.use();
    this.samplerUniform.set1i(0);
    this.textureSizeUniform.set2f(Sprite.mipmapimages[0].width, Sprite.mipmapimages[0].height);
  }

  setLightAngle(angle) {
    let normalizedAngle = angle / Math.PI / 2 % 1;
    if (normalizedAngle < 0) normalizedAngle += 1;
    this.angleUniform.set1f(normalizedAngle);
  }

  drawMaskedSprite(bright, dark, mask, x, y, width, height) {
    const a = bright.rect;
    const b = dark.rect;
    const c = mask.rect;
    this.vertexBuffer.appendArray([x + width, y + height, a.x + a.w, a.y + a.h, b.x + b.w, b.y + c.h, c.x + c.w, c.y + c.h, x + width, y, a.x + a.w, a.y, b.x + b.w, b.y, c.x + c.w, c.y, x, y, a.x, a.y, b.x, b.y, c.x, c.y, x + width, y + height, a.x + a.w, a.y + a.h, b.x + b.w, b.y + c.h, c.x + c.w, c.y + c.h, x, y + height, a.x, a.y + a.h, b.x, b.y + b.h, c.x, c.y + c.h, x, y, a.x, a.y, b.x, b.y, c.x, c.y]);
  }

  prepare() {
    Sprite.setSmoothing(this.ctx, false);
    this.vertexBuffer.bind();
    this.vertexBuffer.reset();
    const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT;
    const stride = this.vertexLength * bytes;
    this.ctx.enableVertexAttribArray(this.brightTexturePositionAttribute);
    this.ctx.enableVertexAttribArray(this.darkTexturePositionAttribute);
    this.ctx.enableVertexAttribArray(this.maskPositionAttrubute);
    this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    this.ctx.vertexAttribPointer(this.brightTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
    this.ctx.vertexAttribPointer(this.darkTexturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 16);
    this.ctx.vertexAttribPointer(this.maskPositionAttrubute, 2, this.ctx.FLOAT, false, stride, 24);
  }

  draw() {
    this.vertexBuffer.updateData();
    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.vertexBuffer.pointer / this.vertexLength);
    this.ctx.disableVertexAttribArray(this.brightTexturePositionAttribute);
    this.ctx.disableVertexAttribArray(this.darkTexturePositionAttribute);
    this.ctx.disableVertexAttribArray(this.maskPositionAttrubute);
    this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
    Sprite.setSmoothing(this.ctx, true);
  }

}

module.exports = LightMaskTextureProgram;
},{}],53:[function(require,module,exports){
const Program = require(51);

const Shader = require(57);

const GLBuffer = require(49);

class ParticleProgram extends Program {
  constructor(name, ctx) {
    let vertexShader = new Shader("particle-vertex", Shader.VERTEX).compile(ctx);
    let fragmentShader = new Shader("particle-fragment", Shader.FRAGMENT).compile(ctx);
    super(name, vertexShader, fragmentShader);
    this.link(ctx);
    this.ctx = ctx;
    this.vertexBuffer = new GLBuffer({
      gl: ctx,
      drawMode: this.ctx.STATIC_DRAW
    }).createBuffer();
    this.colorBuffer = new GLBuffer({
      gl: ctx,
      clazz: Uint32Array,
      drawMode: this.ctx.STATIC_DRAW
    }).createBuffer();
    this.indexBuffer = this.createIndexBuffer();
    this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
    this.colorAttribute = this.getAttribute("a_color");
    this.matrixUniform = this.getUniform("u_matrix");
    this.vertexLength = 2;
    this.particles = 0;
  }

  prepare() {
    this.indexBuffer.reset();
    this.vertexBuffer.bind();
    this.vertexBuffer.reset();
    const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT;
    const stride = this.vertexLength * bytes;
    this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    this.colorBuffer.bind();
    this.colorBuffer.reset();
    const colorBytes = this.colorBuffer.clazz.BYTES_PER_ELEMENT;
    this.ctx.enableVertexAttribArray(this.colorAttribute);
    this.ctx.vertexAttribPointer(this.colorAttribute, 4, this.ctx.UNSIGNED_BYTE, true, colorBytes, 0);
  }

  drawParticle(particle) {
    if (particle.color.alpha <= 0) {
      return;
    }

    const w = particle.width / 2;
    const h = particle.height / 2;
    const r = particle.color.r & 0xff;
    const g = particle.color.g & 0xff;
    const b = particle.color.b & 0xff;
    const a = particle.color.alpha * 255 & 0xff;
    const data = a << 24 | b << 16 | g << 8 | r;

    for (let i = 0; i < 4; i++) {
      this.colorBuffer.push(data);
    }

    this.vertexBuffer.appendArray([particle.x - w, particle.y - h, particle.x - w, particle.y + h, particle.x + w, particle.y - h, particle.x + w, particle.y + h]);
    const baseIndex = this.particles * 4;
    this.indexBuffer.appendArray([baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3]);
    this.particles++;
  }

  draw() {
    //this.ctx.blendFunc(this.ctx.ONE, this.ctx.ONE_MINUS_SRC_COLOR)
    this.indexBuffer.updateData();
    this.vertexBuffer.updateData();
    this.colorBuffer.updateData();
    this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
    this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.disableVertexAttribArray(this.colorAttribute);
    this.particles = 0; //this.ctx.blendFuncSeparate(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA, this.ctx.ONE, this.ctx.ONE_MINUS_SRC_ALPHA);
  }

}

module.exports = ParticleProgram;
},{}],54:[function(require,module,exports){
const Program = require(51);

const Shader = require(57);

const GLBuffer = require(49);

class PostProcessingProgram extends Program {
  constructor(name, ctx) {
    let vertexShader = new Shader("post-processing-vertex", Shader.VERTEX).compile(ctx);
    let fragmentShader = new Shader("post-processing-fragment", Shader.FRAGMENT).compile(ctx);
    super(name, vertexShader, fragmentShader);
    this.link(ctx);
    this.ctx = ctx;
    this.vertexBuffer = new GLBuffer({
      gl: this.ctx,
      drawMode: this.ctx.STATIC_DRAW,
      capacity: 8
    }).createBuffer();
    this.vertexBuffer.appendArray([-1, -1, -1, 1, 1, -1, 1, 1]);
    this.indexBuffer = new GLBuffer({
      clazz: Uint8Array,
      gl: this.ctx,
      bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
      drawMode: this.ctx.STATIC_DRAW,
      capacity: 8
    }).createBuffer();
    this.indexBuffer.appendArray([0, 1, 3, 0, 2, 3]);
    this.indexBuffer.updateData();
    this.vertexBuffer.updateData();
    this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
    this.textureUniform = this.getUniform("u_texture");
    this.widthUniform = this.getUniform("u_screen_width");
    this.heightUniform = this.getUniform("u_screen_height");
    this.vertexLength = 2;
  }

  draw() {
    this.indexBuffer.bind();
    this.vertexBuffer.bind();
    const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT;
    const stride = this.vertexLength * bytes;
    this.widthUniform.set1f(this.ctx.canvas.width);
    this.heightUniform.set1f(this.ctx.canvas.height);
    this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.enableVertexAttribArray(this.texturePositionAttribute);
    this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_BYTE, 0);
    this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
    this.textures = 0;
  }

}

module.exports = PostProcessingProgram;
},{}],55:[function(require,module,exports){
const Program = require(51);

const Shader = require(57);

const GLBuffer = require(49);

class TextureProgram extends Program {
  constructor(name, ctx, options) {
    options = Object.assign({
      largeIndices: false
    }, options);
    let vertexShader = new Shader("texture-vertex", Shader.VERTEX).compile(ctx);
    let fragmentShader = new Shader("texture-fragment", Shader.FRAGMENT).compile(ctx);
    super(name, vertexShader, fragmentShader);
    this.link(ctx);

    if (options.largeIndices) {
      let uintsForIndices = ctx.getExtension("OES_element_index_uint");

      if (!uintsForIndices) {
        throw new Error("No WebGL Extension: OES_element_index_uint. Please, update the browser.");
      }
    }

    const arrayType = options.largeIndices ? Uint32Array : Uint16Array;
    this.indexBufferType = options.largeIndices ? ctx.UNSIGNED_INT : ctx.UNSIGNED_SHORT;
    this.ctx = ctx;
    this.vertexBuffer = new GLBuffer({
      gl: ctx,
      drawMode: this.ctx.STATIC_DRAW,
      capacity: options.largeIndices ? 16384 : 128 // Rare reallocation

    }).createBuffer();
    this.indexBuffer = new GLBuffer({
      gl: ctx,
      clazz: arrayType,
      bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
      drawMode: this.ctx.STATIC_DRAW,
      capacity: options.largeIndices ? 16384 : 128 // As well

    }).createBuffer();
    this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
    this.texturePositionAttribute = this.getAttribute("a_texture_position");
    this.textureUniform = this.getUniform("u_texture");
    this.matrixUniform = this.getUniform("u_matrix");
    this.vertexLength = 4;
    this.textures = 0;
    /**
     * @type {Matrix3}
     */

    this.transform = null;
  }

  setTransform(transform) {
    this.transform = transform;
  }

  drawTexture(x1, y1, x2, y2, x3, y3, x4, y4, sx, sy, sw, sh) {
    if (this.transform) {
      /*
          Not using arrays/objects here because it will lead to
          allocation/garbage collector overhead. These functions
          will probably get inlined
       */
      let a, b;
      x1 = this.transform.transformX(a = x1, b = y1);
      y1 = this.transform.transformY(a, b);
      x2 = this.transform.transformX(a = x2, b = y2);
      y2 = this.transform.transformY(a, b);
      x3 = this.transform.transformX(a = x3, b = y3);
      y3 = this.transform.transformY(a, b);
      x4 = this.transform.transformX(a = x4, b = y4);
      y4 = this.transform.transformY(a, b);
    }

    this.vertexBuffer.appendArray([x1, y1, sx, sy, x2, y2, sx + sw, sy, x3, y3, sx, sy + sh, x4, y4, sx + sw, sy + sh]);
    const baseIndex = this.textures * 4;
    this.indexBuffer.appendArray([baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3]);
    this.textures++;
  }

  tightenTexture(sprite, x1, y1, x2, y2, x3, y3, x4, y4) {
    let r = sprite.rect;
    this.drawTexture(x1, y1, x2, y2, x3, y3, x4, y4, r.x, r.y, r.w, r.h);
  }

  drawSprite(sprite, x, y, width, height, sx, sy, sw, sh) {
    const r = sprite.rect;
    if (sx === undefined) sx = r.x;else sx += r.x;
    if (sy === undefined) sy = r.y;else sy += r.y;
    if (sw === undefined) sw = r.w;
    if (sh === undefined) sh = r.h;
    this.drawTexture(x, y, x + width, y, x, y + height, x + width, y + height, sx, sy, sw, sh);
  }

  prepare(update) {
    this.vertexBuffer.bind();

    if (update === true || update === undefined) {
      this.indexBuffer.reset();
      this.vertexBuffer.reset();
    }

    const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT;
    const stride = this.vertexLength * bytes;
    this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.enableVertexAttribArray(this.texturePositionAttribute);
    this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    this.ctx.vertexAttribPointer(this.texturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
  }

  draw(update) {
    if (update === true || update === undefined) {
      this.indexBuffer.updateData();
      this.vertexBuffer.updateData();
    } else {
      this.indexBuffer.bind();
    }

    this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.indexBufferType, 0);
    this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.disableVertexAttribArray(this.texturePositionAttribute);
    this.textures = 0;
  }

}

module.exports = TextureProgram;
},{}],56:[function(require,module,exports){
const Program = require(51);

const Shader = require(57);

const GLBuffer = require(49);

class TruckProgram extends Program {
  constructor(name, ctx) {
    let vertexShader = new Shader("truck-vertex", Shader.VERTEX).compile(ctx);
    let fragmentShader = new Shader("truck-fragment", Shader.FRAGMENT).compile(ctx);
    super(name, vertexShader, fragmentShader);
    this.link(ctx);
    this.ctx = ctx;
    this.vertexBuffer = new GLBuffer({
      gl: ctx,
      drawMode: this.ctx.DYNAMIC_DRAW
    }).createBuffer();
    this.indexBuffer = new GLBuffer({
      gl: ctx,
      clazz: Uint16Array,
      bufferType: this.ctx.ELEMENT_ARRAY_BUFFER,
      drawMode: this.ctx.DYNAMIC_DRAW
    }).createBuffer();
    this.vertexPositionAttribute = this.getAttribute("a_vertex_position");
    this.texturePositionAttribute = this.getAttribute("a_truck_position");
    this.truckDistanceAttribute = this.getAttribute("a_truck_distance");
    this.truckTextureUniform = this.getUniform("u_truck_texture");
    this.truckLengthUniform = this.getUniform("u_truck_length");
    this.matrixUniform = this.getUniform("u_matrix");
    this.radiusUniform = this.getUniform("u_radius");
    this.textureUniform = this.getUniform("u_texture");
    this.vertexLength = 5;
    this.trucks = 0;
  }

  setTruckRadius(radius) {
    this.radiusUniform.set1f(radius);
  }

  setTruckLength(length) {
    this.truckLengthUniform.set1f(length);
  }

  setSprite(sprite) {
    this.truckTextureUniform.set4f(sprite.rect.x, sprite.rect.y, sprite.rect.w, sprite.rect.h);
  }

  drawTruck(x, y, width, height, scale, distance) {
    distance = distance % height / height;
    this.vertexBuffer.appendArray([x + width, y + height, 1, 1, distance, x + width, y, 1, 0, distance, x, y + height, 0, 1, distance, x, y, 0, 0, distance]);
    const baseIndex = this.trucks * 4;
    this.indexBuffer.appendArray([baseIndex, baseIndex + 1, baseIndex + 3, baseIndex, baseIndex + 2, baseIndex + 3]);
    this.trucks++;
  }

  prepare() {
    this.indexBuffer.reset();
    this.vertexBuffer.bind();
    this.vertexBuffer.reset();
    const bytes = this.vertexBuffer.clazz.BYTES_PER_ELEMENT;
    const stride = this.vertexLength * bytes;
    this.ctx.enableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.enableVertexAttribArray(this.texturePositionAttribute);
    this.ctx.enableVertexAttribArray(this.truckDistanceAttribute);
    this.ctx.vertexAttribPointer(this.vertexPositionAttribute, 2, this.ctx.FLOAT, false, stride, 0);
    this.ctx.vertexAttribPointer(this.texturePositionAttribute, 2, this.ctx.FLOAT, false, stride, 8);
    this.ctx.vertexAttribPointer(this.truckDistanceAttribute, 1, this.ctx.FLOAT, false, stride, 16);
    this.ctx.disable(this.ctx.BLEND);
  }

  draw() {
    this.ctx.enable(this.ctx.BLEND);
    this.indexBuffer.updateData();
    this.vertexBuffer.updateData();
    this.ctx.drawElements(this.ctx.TRIANGLES, this.indexBuffer.pointer, this.ctx.UNSIGNED_SHORT, 0);
    this.ctx.disableVertexAttribArray(this.vertexPositionAttribute);
    this.ctx.disableVertexAttribArray(this.texturePositionAttribute);
    this.ctx.disableVertexAttribArray(this.truckDistanceAttribute);
    this.trucks = 0;
  }

}

module.exports = TruckProgram;
},{}],57:[function(require,module,exports){
const shaders = require(58);

class Shader {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.raw = null;
  }

  compile(gl) {
    this.raw = gl.createShader(this.type === Shader.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);

    if (!shaders[this.name]) {
      throw new Error("No such shader: " + this.name);
    }

    gl.shaderSource(this.raw, shaders[this.name]);
    gl.compileShader(this.raw);

    if (!gl.getShaderParameter(this.raw, gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile shader '" + this.name + "': " + gl.getShaderInfoLog(this.raw));
    }

    return this;
  }

}

Shader.VERTEX = 0;
Shader.FRAGMENT = 1;
module.exports = Shader;
},{}],58:[function(require,module,exports){
let files = {}
files['particle-fragment'] = "\n#version 100\nvarying highp vec4 v_color;void main(){gl_FragColor=v_color;}"
files['particle-vertex'] = "\n#version 100\nattribute vec2 a_vertex_position;attribute vec4 a_color;varying vec4 v_color;uniform mat3 u_matrix;void main(){vec3 a;a.z=1.0;a.xy=a_vertex_position;highp vec4 b;b.zw=vec2(0.0,1.0);b.xy=(u_matrix*a).xy;gl_Position=b;v_color=a_color;}"
files['light-mask-texture-fragment'] = "\n#version 100\nprecision mediump float;uniform float u_angle;uniform sampler2D u_texture;uniform vec2 u_texture_size;varying vec2 v_dark_texture_position;varying vec2 v_bright_texture_position;varying vec2 v_mask_position;void main(){vec2 a;vec2 b;b=(v_mask_position*u_texture_size);a=(b-floor(b));mediump vec4 c;lowp vec4 d;highp int e;highp int f;float g;g=abs((a.x-0.5));float h;h=abs((a.y-0.5));if((a.x==0.5)){f=0;}else{if((a.x>0.5)){f=1;}else{f=-1;}}if((a.y==0.5)){e=0;}else{if((a.y>0.5)){e=1;}else{e=-1;}}float i;i=(float(f)/u_texture_size.x);float j;j=(float(e)/u_texture_size.y);vec2 k;k=((vec2(0.5,0.5)-a)/u_texture_size);if((f==0)){lowp float l;lowp vec4 m;m=texture2D(u_texture,(v_dark_texture_position+k));lowp vec4 n;n=texture2D(u_texture,(v_bright_texture_position+k));lowp vec4 o;o=texture2D(u_texture,(v_mask_position+k));lowp float p;p=(o.x+u_angle);l=p;if((p>1.0)){l=(p-1.0);}if((l>0.75)){l=(1.0-l);}if((l>0.25)){l=0.25;}lowp float q;q=((1.0-(l*4.0))*o.w);d=((m*(1.0-q))+(n*q));}else{lowp vec4 r;lowp float s;lowp vec4 t;t=texture2D(u_texture,(v_dark_texture_position+k));lowp vec4 u;u=texture2D(u_texture,(v_bright_texture_position+k));lowp vec4 v;v=texture2D(u_texture,(v_mask_position+k));lowp float w;w=(v.x+u_angle);s=w;if((w>1.0)){s=(w-1.0);}if((s>0.75)){s=(1.0-s);}if((s>0.25)){s=0.25;}lowp float x;x=((1.0-(s*4.0))*v.w);r=((t*(1.0-x))+(u*x));vec2 y;y.y=0.0;y.x=i;vec2 z;z=(k+y);lowp float A;lowp vec4 B;B=texture2D(u_texture,(v_dark_texture_position+z));lowp vec4 C;C=texture2D(u_texture,(v_bright_texture_position+z));lowp vec4 D;D=texture2D(u_texture,(v_mask_position+z));lowp float E;E=(D.x+u_angle);A=E;if((E>1.0)){A=(E-1.0);}if((A>0.75)){A=(1.0-A);}if((A>0.25)){A=0.25;}lowp float F;F=((1.0-(A*4.0))*D.w);d=((r*(1.0-g))+(((B*(1.0-F))+(C*F))*g));}if((e!=0)){lowp vec4 G;if((f!=0)){vec2 H;H.x=0.0;H.y=j;lowp vec4 I;vec2 J;J=(k+H);lowp float K;lowp vec4 L;L=texture2D(u_texture,(v_dark_texture_position+J));lowp vec4 M;M=texture2D(u_texture,(v_bright_texture_position+J));lowp vec4 N;N=texture2D(u_texture,(v_mask_position+J));lowp float O;O=(N.x+u_angle);K=O;if((O>1.0)){K=(O-1.0);}if((K>0.75)){K=(1.0-K);}if((K>0.25)){K=0.25;}lowp float P;P=((1.0-(K*4.0))*N.w);I=((L*(1.0-P))+(M*P));vec2 Q;Q.x=i;Q.y=j;vec2 R;R=(k+Q);lowp float S;lowp vec4 T;T=texture2D(u_texture,(v_dark_texture_position+R));lowp vec4 U;U=texture2D(u_texture,(v_bright_texture_position+R));lowp vec4 V;V=texture2D(u_texture,(v_mask_position+R));lowp float W;W=(V.x+u_angle);S=W;if((W>1.0)){S=(W-1.0);}if((S>0.75)){S=(1.0-S);}if((S>0.25)){S=0.25;}lowp float X;X=((1.0-(S*4.0))*V.w);G=((I*(1.0-g))+(((T*(1.0-X))+(U*X))*g));}else{vec2 Y;Y.x=0.0;Y.y=j;vec2 Z;Z=(k+Y);lowp float ba;lowp vec4 bb;bb=texture2D(u_texture,(v_dark_texture_position+Z));lowp vec4 bc;bc=texture2D(u_texture,(v_bright_texture_position+Z));lowp vec4 bd;bd=texture2D(u_texture,(v_mask_position+Z));lowp float be;be=(bd.x+u_angle);ba=be;if((be>1.0)){ba=(be-1.0);}if((ba>0.75)){ba=(1.0-ba);}if((ba>0.25)){ba=0.25;}lowp float bf;bf=((1.0-(ba*4.0))*bd.w);G=((bb*(1.0-bf))+(bc*bf));}d=((d*(1.0-h))+(G*h));}c=d;gl_FragColor=c;}"
files['light-mask-texture-vertex'] = "\n#version 100\nprecision mediump float;attribute vec2 a_vertex_position;attribute vec2 a_bright_texture_position;attribute vec2 a_dark_texture_position;attribute vec2 a_mask_position;uniform mat3 u_matrix;varying vec2 v_dark_texture_position;varying vec2 v_bright_texture_position;varying vec2 v_mask_position;void main(){vec3 a;a.z=1.0;a.xy=a_vertex_position;highp vec4 b;b.zw=vec2(0.0,1.0);b.xy=(u_matrix*a).xy;gl_Position=b;v_bright_texture_position=a_bright_texture_position;v_dark_texture_position=a_dark_texture_position;v_mask_position=a_mask_position;}"
files['truck-fragment'] = "\n#version 100\nuniform highp vec4 u_truck_texture;uniform highp float u_radius;uniform highp float u_truck_length;uniform sampler2D u_texture;varying highp vec2 v_truck_position;varying highp float f_distance;void main(){highp vec2 a;a=v_truck_position;if((v_truck_position.y<u_radius)){highp float b;b=((u_radius-v_truck_position.y)/u_radius);a.y=(u_radius-((sign(b)*(1.570796-(sqrt((1.0-abs(b)))*(1.570796+(abs(b)*(-0.2146018+(abs(b)*(0.08656672+(abs(b)*-0.03102955)))))))))*u_radius));}if((a.y>(1.0-u_radius))){highp float c;c=(((u_radius-1.0)+a.y)/u_radius);a.y=((1.0-u_radius)+((sign(c)*(1.570796-(sqrt((1.0-abs(c)))*(1.570796+(abs(c)*(-0.2146018+(abs(c)*(0.08656672+(abs(c)*-0.03102955)))))))))*u_radius));}a.x=(u_truck_texture.x+(u_truck_texture.z*(float(mod(v_truck_position.x,1.0)))));a.y=(u_truck_texture.y+(u_truck_texture.w*(float(mod(((a.y*u_truck_length)+f_distance),1.0)))));lowp vec4 d;d=texture2D(u_texture,a);gl_FragColor=d;}"
files['truck-vertex'] = "\n#version 100\nuniform mat3 u_matrix;attribute vec2 a_vertex_position;attribute vec2 a_truck_position;attribute float a_truck_distance;varying vec2 v_truck_position;varying float f_distance;void main(){vec3 a;a.z=1.0;a.xy=a_vertex_position;highp vec4 b;b.zw=vec2(0.0,1.0);b.xy=(u_matrix*a).xy;gl_Position=b;v_truck_position=a_truck_position;f_distance=a_truck_distance;}"
files['post-processing-fragment'] = "\n#version 100\nvarying highp vec2 v_texture_position;uniform sampler2D u_texture;void main(){lowp vec4 a;a=texture2D(u_texture,v_texture_position);gl_FragColor=a;}"
files['post-processing-vertex'] = "\n#version 100\nattribute vec2 a_vertex_position;varying vec2 v_texture_position;void main(){highp vec4 a;a.zw=vec2(0.0,1.0);a.xy=a_vertex_position;gl_Position=a;v_texture_position=((a_vertex_position+vec2(1.0,1.0))/2.0);}"
files['texture-fragment'] = "\n#version 100\nvarying highp vec2 v_texture_position;uniform sampler2D u_texture;void main(){lowp vec4 a;a=texture2D(u_texture,v_texture_position);gl_FragColor=a;}"
files['texture-vertex'] = "\n#version 100\nattribute vec2 a_vertex_position;attribute vec2 a_texture_position;varying vec2 v_texture_position;uniform mat3 u_matrix;void main(){vec3 a;a.z=1.0;a.xy=a_vertex_position;highp vec4 b;b.zw=vec2(0.0,1.0);b.xy=(u_matrix*a).xy;gl_Position=b;v_texture_position=a_texture_position;}"

module.exports = files
},{}],59:[function(require,module,exports){
class Uniform {
  constructor(program, name) {
    this.program = program;
    this.name = name;
    this.ctx = this.program.ctx;
    this.location = this.ctx.getUniformLocation(this.program.raw, name);

    if (!this.location) {
      console.warn("Could not find uniform named '" + this.name + "' in '" + this.program.name + "'");
    }
  }

  set1f(value) {
    if (this.location) this.ctx.uniform1f(this.location, value);
  }

  set2f(value1, value2) {
    if (this.location) this.ctx.uniform2f(this.location, value1, value2);
  }

  set3f(value1, value2, value3) {
    if (this.location) this.ctx.uniform3f(this.location, value1, value2, value3);
  }

  set4f(value1, value2, value3, value4) {
    if (this.location) this.ctx.uniform4f(this.location, value1, value2, value3, value4);
  }

  set1d(value) {
    if (this.location) this.ctx.uniform1fv(this.location, value);
  }

  set2d(value1, value2) {
    if (this.location) this.ctx.uniform2fv(this.location, value1, value2);
  }

  set3d(value1, value2, value3) {
    if (this.location) this.ctx.uniform3fv(this.location, value1, value2, value3);
  }

  set4d(value1, value2, value3, value4) {
    if (this.location) this.ctx.uniform4fv(this.location, value1, value2, value3, value4);
  }

  set1i(value) {
    if (this.location) this.ctx.uniform1i(this.location, value);
  }

  set2i(value1, value2) {
    if (this.location) this.ctx.uniform2i(this.location, value1, value2);
  }

  set3i(value1, value2, value3) {
    if (this.location) this.ctx.uniform3i(this.location, value1, value2, value3);
  }

  set4i(value1, value2, value3, value4) {
    if (this.location) this.ctx.uniform4i(this.location, value1, value2, value3, value4);
  }

  setMatrix(matrix) {
    if (this.location) {
      if (matrix.length === 4) {
        this.ctx.uniformMatrix2fv(this.location, false, matrix);
      } else if (matrix.length === 9) {
        this.ctx.uniformMatrix3fv(this.location, false, matrix);
      } else if (matrix.length === 16) {
        this.ctx.uniformMatrix4fv(this.location, false, matrix);
      }
    }
  }

}

module.exports = Uniform;
},{}],60:[function(require,module,exports){
const BinaryPacket = require(100);

const BinaryDecoder = require(120);

class Client {
  constructor(config) {
    this.config = config;
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.queue = [];
  }

  on(what, handler) {
    if (this.listeners.has(what)) {
      this.listeners.get(what).push(handler);
    } else {
      this.listeners.set(what, [handler]);
    }
  }

  emit(event) {
    let listeners = this.listeners.get(event);
    let args = Array.prototype.slice.call(arguments, 1);

    if (listeners) {
      for (let listener of listeners) {
        listener.apply(null, args);
      }
    }
  }

  connectToServer() {
    if (this.socket != null) throw new Error("Client object cannot be reused");
    this.socket = new WebSocket(this.config.ip);
    this.socket.binaryType = "arraybuffer";
    let self = this;

    this.socket.onopen = event => self.onopen(event);

    this.socket.onclose = event => self.onclose(event);

    this.socket.onerror = event => self.onerror(event);

    this.socket.onmessage = event => self.onmessage(event);
  }

  onopen() {
    this.connected = true;

    for (let packet of this.queue) {
      this.send(packet);
    }

    this.queue = [];
    this.emit("open");
  }

  onmessage(event) {
    if (event.data instanceof ArrayBuffer) {
      let decoder = BinaryPacket.binaryDecoder;
      decoder.reset();
      decoder.readData(event.data);
      let packet = BinaryPacket.deserialize(decoder, BinaryPacket);

      if (packet) {
        for (let [clazz, listeners] of this.listeners) {
          if (clazz instanceof Function && packet.constructor === clazz) {
            for (let listener of listeners) {
              listener(packet);
            }
          }
        }
      } else {
        decoder.reset();
        console.warn("Unknown packet type: " + decoder.readUint16());
      }
    } else if (typeof event.data == "string") {
      this.emit("string", event.data);
    }
  }

  onerror(error) {
    this.emit("error", error);
    this.connected = false;
  }

  onclose(event) {
    this.emit("close", event);
    this.connected = false;
  }

  send(packet) {
    if (this.socket.readyState === WebSocket.OPEN) {
      if (packet instanceof BinaryPacket) {
        this.socket.send(packet.getData());
      } else if (typeof packet == "string") {
        this.socket.send(packet);
      }
    } else if (this.socket.readyState === WebSocket.CONNECTING) {
      this.queue.push(packet);
    }
  }

}

module.exports = Client;
},{}],61:[function(require,module,exports){
const FireParticle = require(62);

class ExplodeParticle extends FireParticle {
  createColors(config) {
    let varying = 30;
    return [[255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, config.startOpacity], [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0.2], [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.3], [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.2 * (1 + Math.min(0, config.shifting))], [115 - Math.random() * varying, 115 - Math.random() * varying, 115 - Math.random() * varying, 0.2 * (1 + Math.min(0, config.shifting))], [115 - Math.random() * varying, 115 - Math.random() * varying, 115 - Math.random() * varying, 0]];
  }

  // 1
  createTimings(config) {
    let result = [];
    let t1, t2, f1, f2;

    if (config.shifting < 0) {
      t1 = ExplodeParticle.fireOnly;
      t2 = ExplodeParticle.all;
      f2 = 1 + config.shifting;
    } else {
      t1 = ExplodeParticle.all;
      t2 = ExplodeParticle.smokeOnly;
      f2 = config.shifting;
    }

    f1 = 1 - f2;

    for (let i = 0; i < 6; i++) {
      result[i] = t1[i] * f1 + t2[i] * f2;
    }

    return result;
  }

  constructor(config) {
    super(config);
  }

}

ExplodeParticle.fireOnly = [0.00, 0.10, 0.66, 1.00, 1.00, 1.00];
ExplodeParticle.all = [0.00, 0.10, 0.40, 0.60, 0.80, 1.00];
ExplodeParticle.smokeOnly = [0.00, 0.00, 0.00, 0.33, 0.66, 1.00];
window.ExplodeParticle = ExplodeParticle;
module.exports = ExplodeParticle;
},{}],62:[function(require,module,exports){
const Particle = require(63);

class FireParticle extends Particle {
  createColors(config) {
    let varying = 30;
    return [[255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0], [255 - Math.random() * varying, 255 - Math.random() * varying, Math.random() * varying, 0.4], [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0.6], [255 - Math.random() * varying, 128 - Math.random() * varying, Math.random() * varying, 0]];
  }

  createTimings(config) {
    return [0.0, 0.1, 0.6, 1.0];
  }

  constructor(config) {
    super(config);
    this.config = config;
    this.width = config.width || 4;
    this.height = config.height || 4;
    this.scaling = config.scaling || 0.01;
    this.colors = this.createColors(config);
    this.times = this.createTimings(config);
    this.tick(0);
  }

  tick(dt) {
    super.tick(dt);
    let fraction = this.lifespan / this.lifetime;
    let r, g, b, a, c1, c2;
    let colors = this.colors;

    for (let i = 0, l = colors.length; i < l; i++) {
      if (fraction < this.times[i]) {
        c2 = i;
        break;
      } else {
        c1 = i;
      }
    }

    if (c2 === undefined) c2 = colors.length - 1;
    let f1 = (fraction - this.times[c1]) / (this.times[c2] - this.times[c1]);
    let f2 = 1 - f1;
    c1 = colors[c1];
    c2 = colors[c2];
    r = c1[0] * f2 + c2[0] * f1;
    g = c1[1] * f2 + c2[1] * f1;
    b = c1[2] * f2 + c2[2] * f1;
    a = c1[3] * f2 + c2[3] * f1;
    this.color.r = Math.round(r);
    this.color.g = Math.round(g);
    this.color.b = Math.round(b);
    this.color.alpha = a;
    this.width += this.scaling;
    this.height += this.scaling;
  }

}

module.exports = FireParticle;
},{}],63:[function(require,module,exports){
const Color = require(144);

class Particle {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.dx = config.dx;
    this.dy = config.dy;
    this.dead = false;
    this.lifetime = config.lifetime || 0.4;
    this.lifespan = config.lifespan || 0;
    this.damping = config.damping || 0.99;
    this.color = config.color || new Color(0, 0, 0);
    this.width = config.width || 0;
    this.height = config.height || 0;
  }

  tick(dt) {
    this.dx *= this.damping;
    this.dy *= this.damping;
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.lifespan += dt;

    if (this.lifespan > this.lifetime) {
      this.dead = true;
    }
  }

}

module.exports = Particle;
},{}],64:[function(require,module,exports){
const Particle = require(63);

class Smoke extends Particle {
  constructor(config) {
    super(config);
    this.color = config.color;
    this.width = config.width || 4;
    this.height = config.height || 4;
  }

}

module.exports = Smoke;
},{}],65:[function(require,module,exports){
const Particle = require(63);

class Smoke extends Particle {
  constructor(config) {
    super(config);
    this.color = config.color;
    this.width = config.width || 4;
    this.height = config.height || 4;
    this.scaling = config.scaling === undefined ? 0.01 : config.scaling;
  }

  tick(dt) {
    super.tick(dt);
    this.color.setAlpha(1 - this.lifespan / this.lifetime);
    this.width += this.scaling * dt;
    this.height += this.scaling * dt;
  }

}

module.exports = Smoke;
},{}],66:[function(require,module,exports){
const Scene = require(67);

const ParticleProgram = require(53);

const Camera = require(1);

const Box2D = require(99);

const Particle = require(63);

const Color = require(144);

class LoadingScene extends Scene {
  constructor(config) {
    super(config);
    this.time = 0;
    this.progress = config.progress;
    this.phrases = ["Продуваем турбины...", "Пылесосим поле боя...", "Склеиваем бигбоя...", "Накачиваем гусеницы...", "Успокаиваем танкистов...", "Зачитываем технику безопасности...", "Полируем сиденья...", "Вызываем пожарных...", "Заправляем баки...", "Отмываем следы...", "Пьём чай...", "Спорим о политике...", "Преисполняемся в своем сознании...", "Тянем время...", "Фиксим баги..."];
    this.camera = new Camera({
      viewport: new Box2D.b2Vec2(this.screen.width, this.screen.height),
      defaultPosition: new Box2D.b2Vec2(),
      limit: false
    });
    this.camera.tick(0);
    this.program = new ParticleProgram("loading-program", this.screen.ctx);
    this.decoration = new Particle({});
    this.scaleBackground = new Color(200, 200, 200);
    this.scaleForeground = new Color(150, 240, 150);
    this.title = $("<h1>").addClass("loading-text");
    this.title.hide();
    this.overlayContainer.append(this.title);
    this.phrase = null;
    this.updatePhrase();
  }

  layout() {
    super.layout();
    this.camera.viewport.x = this.screen.width;
    this.camera.viewport.y = this.screen.height;
    this.camera.tick(0);
  }

  disappear() {
    super.disappear();
    clearInterval(this.interval);
  }

  appear() {
    super.appear();
    this.interval = setInterval(() => this.updatePhrase(), 2500);
  }

  updatePhrase() {
    if (this.phrase == null) {
      this.newPhrase();
    } else {
      this.title.fadeOut(600, () => this.newPhrase());
    }
  }

  newPhrase() {
    let newPhrase;

    do {
      newPhrase = Math.floor(Math.random() * this.phrases.length);
    } while (newPhrase === this.phrase);

    this.title.text(this.phrases[newPhrase]);
    this.title.fadeIn(600);
    this.phrase = newPhrase;
  }

  draw(ctx, dt) {
    this.program.use();
    this.program.prepare();
    this.drawScaleBackground();
    this.drawScaleForeground();
    this.program.matrixUniform.setMatrix(this.camera.matrix.m);
    this.program.draw();
    this.time += dt;
  }

  drawScaleBackground() {
    this.decoration.x = 0;
    this.decoration.y = 0;
    this.decoration.width = 400;
    this.decoration.height = 20;
    this.decoration.color = this.scaleBackground;
    this.program.drawParticle(this.decoration);
  }

  drawScaleForeground() {
    const fraction = this.progress.completeFraction();
    this.decoration.x = -200 * (1 - fraction);
    this.decoration.y = 0;
    this.decoration.width = 400 * fraction;
    this.decoration.height = 20;
    this.decoration.color = this.scaleForeground;
    this.program.drawParticle(this.decoration);
  }

}

module.exports = LoadingScene;
},{}],67:[function(require,module,exports){
const Screen = require(68);

class Scene {
  /**
   * @type {Screen}
   */

  /**
   * @type {jQuery}
   */
  constructor(config) {
    this.screen = null;
    this.overlayContainer = null;
    this.overlayContainer = $("<div>");
    this.screen = config.screen;
  }

  draw(ctx, dt) {}

  layout() {}

  appear() {}

  disappear() {}

}

module.exports = Scene;
},{}],68:[function(require,module,exports){
const RenderLoop = require(148);

const Loop = require(147);

const CanvasFactory = require(81);

window.requestAnimationFrame = window.requestAnimationFrame || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"];

class Screen {
  /**
   * @type {HTMLCanvasElement}
   */

  /**
   * @type {WebGLRenderingContext}
   */

  /**
   * @type {Loop}
   */

  /**
   * @type {Scene}
   */
  constructor(config) {
    this.canvas = null;
    this.ctx = null;
    this.loop = null;
    this.scene = void 0;
    config = Object.assign({
      scale: window.devicePixelRatio
    }, config);
    this.config = config;
    this.root = config.root;
    this.initLoop();
    this.scene = null;
    this.width = null;
    this.height = null;
    this.initCanvas();
    this.initResizeHandling();
    this.initialize();

    this.loop.run = dt => this.tick(dt);
  }

  initLoop() {
    this.loop = new RenderLoop(this);
  }

  initialize() {
    for (let texture of this.framebufferTextures) {
      let framebuffer = this.ctx.createFramebuffer();
      this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, framebuffer);
      this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, this.ctx.COLOR_ATTACHMENT0, this.ctx.TEXTURE_2D, texture, 0);
      this.framebuffers.push(framebuffer);
    }

    this.setScreenFramebuffer();
  }

  setScene(scene) {
    if (this.scene) {
      this.scene.disappear();
      this.scene.overlayContainer.remove();
    }

    this.scene = scene;
    this.scene.appear();
    this.root.append(this.scene.overlayContainer);
  }

  initCanvas() {
    Object.assign(this, CanvasFactory());
    this.root.append($(this.canvas));
    this.framebufferTextures = [];
    this.framebuffers = [];

    for (let i = 0; i < 2; i++) {
      let texture = this.ctx.createTexture();
      this.framebufferTextures.push(texture);
    }

    this.activeFramebufferIndex = null;
    this.inactiveFramebufferIndex = null;
  }

  activeFramebufferTexture() {
    if (this.activeFramebufferIndex === null) return null;
    return this.framebufferTextures[this.activeFramebufferIndex];
  }

  inactiveFramebufferTexture() {
    if (this.inactiveFramebufferIndex === null) return null;
    return this.framebufferTextures[this.inactiveFramebufferIndex];
  }

  swapFramebuffers() {
    if (this.activeFramebufferIndex === null) {
      this.activeFramebufferIndex = 0;
      this.inactiveFramebufferIndex = 1;
    }

    let oldActive = this.activeFramebufferIndex;
    this.activeFramebufferIndex = this.inactiveFramebufferIndex;
    this.inactiveFramebufferIndex = oldActive;
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.framebuffers[this.activeFramebufferIndex]);
  }

  clear() {
    this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
  }

  setScreenFramebuffer() {
    this.inactiveFramebufferIndex = this.activeFramebufferIndex;
    this.activeFramebufferIndex = null;
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);
  }

  initResizeHandling() {
    const handler = () => {
      this.width = this.root.width();
      this.height = this.root.height();
      this.canvas.width = this.width * this.config.scale;
      this.canvas.height = this.height * this.config.scale;
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
      this.ctx.viewport(0, 0, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight);

      for (let texture of this.framebufferTextures) {
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.drawingBufferWidth, this.ctx.drawingBufferHeight, 0, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, null);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
      }

      if (this.scene) this.scene.layout();
    };

    window.addEventListener("resize", handler);
    handler();
  }

  tick(dt) {
    if (this.scene) {
      this.scene.draw(this.ctx, dt);
    }
  }

}

module.exports = Screen;
},{}],69:[function(require,module,exports){
class FX {
  static randomExplosion() {
    return Math.floor(Math.random() * 4) + 11;
  }

}

FX.RELOAD_START = 0;
FX.RELOAD_END = 1;
FX.SHOOT_16MM = 2;
FX.SHOOT_SHOTGUN = 3;
FX.SHOOT_SNIPER = 4;
FX.SHOOT_BOMBER = 5;
FX.SHOOT_MORTAR = 6;
FX.FLAMETHROWER_START = 7;
FX.FLAMETHROWER_SOUND = 8;
FX.TESLA_START = 9;
FX.TESLA_SOUND = 10;
FX.ENGINE_1 = 15;
FX.ENGINE_2 = 16;
FX.ENGINE_3 = 17;
FX.ENGINE_4 = 18;
FX.sounds = [
/*  0 */
"assets/sound/reload_start.wav",
/*  1 */
"assets/sound/reload_end.wav",
/*  2 */
"assets/sound/16mm-shoot.wav",
/*  3 */
"assets/sound/shotgun-shoot.wav",
/*  4 */
"assets/sound/sniper-shoot.wav",
/*  5 */
"assets/sound/bomber-shoot.wav",
/*  6 */
"assets/sound/mortar-shoot.wav",
/*  7 */
"assets/sound/flamethrower-sound-start.wav",
/*  8 */
"assets/sound/flamethrower-sound.wav",
/*  9 */
"assets/sound/tesla-sound-start.wav",
/* 10 */
"assets/sound/tesla-sound.wav",
/* 11 */
"assets/sound/serverworldexplodeeffect-1.wav",
/* 12 */
"assets/sound/serverworldexplodeeffect-2.wav",
/* 13 */
"assets/sound/serverworldexplodeeffect-3.wav",
/* 14 */
"assets/sound/serverworldexplodeeffect-4.wav",
/* 15 */
"assets/sound/engine-1.wav",
/* 16 */
"assets/sound/engine-2.wav",
/* 17 */
"assets/sound/engine-3.wav",
/* 18 */
"assets/sound/engine-4.wav"];
module.exports = FX;
},{}],70:[function(require,module,exports){
const Progress = require(83);

const Downloader = require(82);

class Sprite {
  constructor(name) {
    // Do not remove
    // Destructuring the sprite
    // description with square brackets to
    // help prop name mangler.
    this.rects = []; // this.topLeft = {}
    // this.topRight = {}
    // this.bottomLeft = {}
    // this.bottomRight = {}

    this.rect = null;

    for (let mipmap of Sprite.mipmapatlases) {
      let source = mipmap[name];
      this.rects.push({
        x: source["x"],
        y: source["y"],
        w: source["w"],
        h: source["h"]
      });
    }

    this.updateRect(this.rects[0]);
  }

  updateRect(rect) {
    this.rect = rect; // this.topLeft.x = rect.x
    // this.topLeft.y = rect.y
    // this.topRight.x = rect.x + rect.w
    // this.topRight.y = rect.y
    // this.bottomLeft.x = rect.x
    // this.bottomLeft.y = rect.y + rect.h
    // this.bottomRight.x = rect.x + rect.w
    // this.bottomRight.y = rect.y + rect.h
    // this.centerLeft.x =
  }

  static setMipMapLevel(level) {
    this.mipmaplevel = level;

    for (let sprite of this.sprites.values()) {
      sprite.updateRect(sprite.rects[level]);
    }
  }

  static setGLMipMapLevel(gl, uniform, level) {
    uniform.set1i(level);
  }

  static applyTexture(gl) {
    let i = 0;

    for (let image of this.mipmapimages) {
      gl.activeTexture(gl["TEXTURE" + i]);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      i++;
    }
  }

  static setSmoothing(gl, enabled) {
    if (enabled) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }
  }

  static download(progress, gl, options) {
    options = Object.assign({
      mipMapLevels: 3
    }, options);
    return new Promise((resolve, reject) => {
      let mipMapLevels = options.mipMapLevels;
      let succeededMipmapLevels = mipMapLevels;
      let awaiting = succeededMipmapLevels * 2;

      const assetReady = () => {
        if (! --awaiting) {
          let root = Sprite.mipmapatlases[0];

          for (let key in root) {
            if (root.hasOwnProperty(key)) {
              Sprite.sprites.set(key, new Sprite(key));
            }
          }

          resolve();
        }
      };

      for (let level = 0; level < mipMapLevels; level++) {
        (function (level) {
          /** @type Progress */
          let textureProgress = null;
          /** @type Progress */

          let atlasProgress = null;

          if (progress) {
            textureProgress = new Progress();
            atlasProgress = new Progress();
            progress.addSubtask(textureProgress);
            progress.addSubtask(atlasProgress);
          }

          let levelPath = "atlas-mipmap-level-" + level;
          $(new Image()).attr({
            src: "../assets/img/" + levelPath + ".png"
          }).on("load", function () {
            if (this.complete) {
              if (succeededMipmapLevels > level) {
                Sprite.mipmapimages[level] = this;
                textureProgress.complete();
              }

              assetReady();
            } else {
              if (level === 0) {
                reject("Failed to load first mipmap level");
              } else {
                succeededMipmapLevels = Math.min(succeededMipmapLevels, level);
                assetReady();
              }
            }
          });
          $.ajax({
            url: "../assets/img/" + levelPath + ".json",
            xhr: Downloader.getXHR(null, atlasProgress)
          }).done(data => {
            if (succeededMipmapLevels > level) {
              Sprite.mipmapatlases[level] = data;
            }

            assetReady();
          }).fail((response, status, error) => {
            if (level === 0) {
              reject("Failed to load first mipmap level atlas descriptor: " + error);
            } else {
              succeededMipmapLevels = Math.min(succeededMipmapLevels, level);
              assetReady();
            }
          });
        })(level);
      }
    });
  }
  /**
   * @param name Name of the sprite, like "tanks/sniper/body-bright"
   * @returns {Sprite} The sprite associated with this name
   */


  static named(name) {
    return Sprite.sprites.get(name);
  }

}

Sprite.sprites = new Map();
Sprite.mipmapatlases = [];
Sprite.mipmapimages = [];
Sprite.mipmaplevel = 0;
module.exports = Sprite;
},{}],71:[function(require,module,exports){
const AbstractTank = require(131);

const Box2D = require(99);

class ClientTank extends AbstractTank {
  /**
   * @type {TankDrawer}
   */

  /**
   * @type {Map<number, ClientTankEffect>}
   */

  /**
   * @type {ClientGameWorld}
   */

  /**
   *
   * @param {Object | null} options
   * @param {ClientGameWorld | null} options.world
   * @param {TankModel | null} options.model
   */
  constructor(options) {
    super(options);
    this.drawer = null;
    this.effects = new Map();
    this.world = void 0;
    this.drawer = null;
    this.engine = null;
    this.serverPosition = null;

    if (options && options.model) {
      let expected = this.constructor.getModel();

      if (expected && options.model.constructor !== expected) {
        throw new TypeError("Invalid model type");
      }

      this.model = options.model;
    } else {
      this.model = new (this.constructor.getModel())();
    }
  }

  setupDrawer(ctx) {
    this.drawer = new (this.constructor.getDrawer())(this, ctx);
  }

  destroy() {
    this.model.destroy();
  }

  tick(dt) {
    if (this.serverPosition) {
      let pos = this.model.body.GetPosition();
      let target = this.serverPosition;
      let diffX = target.x - pos.x;
      let diffY = target.y - pos.y;

      if (diffX * diffX + diffY * diffY > 400) {
        pos.x = target.x;
        pos.y = target.y;
      } else {
        pos.x += (target.x - pos.x) / 20;
        pos.y += (target.y - pos.y) / 20;
      }

      this.model.body.SetPosition(pos);
    }

    for (let effect of this.effects.values()) {
      effect.tick(dt);
    }

    this.model.rotation = this.model.body.GetAngle();
    this.model.behaviour.tick(dt);
    this.model.behaviour.countDetails(dt);
  }

  decodeDynamicData(decoder) {
    let teleport = decoder.readUint8();
    let x = decoder.readFloat32();
    let y = decoder.readFloat32();
    let rotation = decoder.readFloat32();
    let vx = decoder.readFloat32();
    let vy = decoder.readFloat32();
    let angularVelocity = decoder.readFloat32();
    let velocity = this.model.body.GetLinearVelocity();
    velocity.Set(vx, vy);
    this.model.body.SetLinearVelocity(velocity);
    this.model.body.SetAngularVelocity(angularVelocity);
    let position = this.model.body.GetPosition(); // When teleporting, player should instantly move
    // from one point to another. Otherwise, this
    // meant to be continious movement. Considering
    // ping jitter and other imperfections of WWW,
    // these positions should be interpolated to give
    // a smooth move impression to player.

    if (teleport) {
      position.Set(x, y);
    } else {
      if (this.serverPosition) this.serverPosition.Set(x, y);else this.serverPosition = new Box2D.b2Vec2(x, y);
    }

    this.model.body.SetPositionAndAngle(position, rotation);
    this.health = decoder.readFloat32();
  }

  static createDrawer() {}

  static getDrawer() {}

  static getName() {}

  static getDescription() {}

  static getStats() {}

  static fromModel(model) {
    let clazz = ClientTank.Types.get(model.constructor.getId());
    return new clazz({
      model: model
    });
  }

  static register(clazz) {
    this.Types.set(clazz.getModel().getId(), clazz);
  }

}

module.exports = ClientTank;
},{}],72:[function(require,module,exports){
const ClientTank = require(71);

const TankDrawer = require(48);

const BigBoiTankModel = require(134);

const Engine = require(17);

const FX = require(69);

const Sprite = require(70);

const LightMaskTextureProgram = require(52);

const TruckProgram = require(56);

class Drawer extends TankDrawer {
  constructor(tank, ctx) {
    super(tank, ctx);
    this.size = 9;
    this.bodyBrightSprite = Sprite.named("tanks/golden-bigboi/body-bright");
    this.bodyDarkSprite = Sprite.named("tanks/golden-bigboi/body-dark");
    this.bodyLightMask = Sprite.named("tanks/golden-bigboi/mask");
    this.truckSprite = Sprite.named("tanks/bigboi/truck");
    this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx);
    this.truckProgram = new TruckProgram("tank-truck-drawer", ctx);
    this.truckProgram.use();
    this.truckProgram.setSprite(this.truckSprite);
    this.truckProgram.setTruckLength(4.0);
    this.truckProgram.setTruckRadius(0.25);
  }

  draw(camera, dt) {
    let angle = this.tank.model.body.GetAngle();
    camera.matrix.save();
    this.drawSmoke(dt);
    const scale = this.size;
    const dscale = scale * 2;
    let leftTrackDist = this.tank.model.behaviour.details.leftTrackDist;
    let rightTrackDist = this.tank.model.behaviour.details.rightTrackDist;
    let position = this.tank.model.body.GetPosition();
    camera.matrix.translate(position.x, position.y);
    camera.matrix.rotate(-angle);
    this.truckProgram.use();
    this.truckProgram.prepare();
    this.truckProgram.drawTruck(scale / 2, -scale, scale, dscale, 4, leftTrackDist);
    this.truckProgram.drawTruck(-scale * 3 / 2, -scale, scale, dscale, 4, rightTrackDist);
    this.truckProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.truckProgram.draw();
    this.bodyProgram.prepare();
    this.bodyProgram.use();
    this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, -scale, -scale * 0.92, scale * 2, scale * 1.98);
    this.bodyProgram.setLightAngle(-angle);
    this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.bodyProgram.draw();
    camera.matrix.restore();
  }

}

class BigboiTank extends ClientTank {
  constructor(model) {
    super(model);
    this.engine = new Engine({
      sound: FX.ENGINE_1,
      gears: [{
        high: 1.9,
        gearing: 1
      }, {
        low: 1.4,
        gearing: 0.8
      }],
      multiplier: 20,
      pitch: 0.8
    });
  }

  static getDrawer() {
    return Drawer;
  }

  static getModel() {
    return BigBoiTankModel;
  }

  static getName() {
    return "Big Boi";
  }

  static getDescription() {
    return "Это невероятное чудо техники создано, чтобы " + "уничтожать всё на своём пути. Снаряд этого танка, " + "имея огромную массу, способен резко изменить " + "траекторию движения соперника или вовсе закрутить и обездвижить его.";
  }

  static getStats() {
    return {
      damage: 4,
      health: 20,
      speed: 46,
      shootrate: 2,
      reload: 7
    };
  }

}

ClientTank.register(BigboiTank);
module.exports = BigboiTank;
},{}],73:[function(require,module,exports){
const ClientTank = require(71);

const TankDrawer = require(48);

const MonsterTankModel = require(135);

const Engine = require(17);

const FX = require(69);

const Sprite = require(70);

const LightMaskTextureProgram = require(52);

const TextureProgram = require(55);

const Matrix3 = require(50);

class Drawer extends TankDrawer {
  constructor(tank, ctx) {
    super(tank, ctx);
    this.size = 9;
    this.bodyBrightSprite = Sprite.named("tanks/monster/body-bright");
    this.bodyDarkSprite = Sprite.named("tanks/monster/body-dark");
    this.bodyLightMask = Sprite.named("tanks/monster/mask");
    this.wheelSpriteCount = 10;
    this.wheelSprites = [];
    this.spriteMatrix = new Matrix3();

    for (let i = 1; i <= this.wheelSpriteCount; i++) {
      this.wheelSprites.push(Sprite.named("tanks/monster/wheel_" + i));
    }

    this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx);
    this.wheelProgram = new TextureProgram("tank-wheel-drawer", ctx);
    this.wheelProgram.setTransform(this.spriteMatrix);
  }

  draw(camera, dt) {
    let angle = this.tank.model.body.GetAngle();
    camera.matrix.save();
    this.drawSmoke(dt);
    const scale = this.size;
    let leftWheelsDist = this.tank.model.behaviour.details.leftWheelsDist;
    let rightWheelsDist = this.tank.model.behaviour.details.rightWheelsDist;
    let leftWheelsAngle = this.tank.model.behaviour.details.leftWheelsAngle;
    let rightWheelsAngle = this.tank.model.behaviour.details.rightWheelsAngle;
    let position = this.tank.model.body.GetPosition();
    camera.matrix.translate(position.x, position.y);
    camera.matrix.rotate(-angle);
    let l = Math.floor(leftWheelsDist % this.wheelSpriteCount);
    let r = Math.floor(rightWheelsDist % this.wheelSpriteCount);
    if (l < 0) l = this.wheelSpriteCount + l;
    if (r < 0) r = this.wheelSpriteCount + r;
    this.wheelProgram.use();
    this.wheelProgram.prepare();
    this.drawWheel(l, 0.82, -0.85, leftWheelsAngle);
    this.drawWheel(l, 0.82, -0.18, 0);
    this.drawWheel(l, 0.82, 0.48, -leftWheelsAngle);
    this.drawWheel(r, -0.82, -0.85, rightWheelsAngle);
    this.drawWheel(r, -0.82, -0.18, 0);
    this.drawWheel(r, -0.82, 0.48, -rightWheelsAngle);
    this.wheelProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.wheelProgram.draw();
    this.bodyProgram.prepare();
    this.bodyProgram.use();
    this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, -scale * 0.8, -scale * 1.15, scale * 1.6, scale * 2);
    this.bodyProgram.setLightAngle(-angle);
    this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.bodyProgram.draw();
    camera.matrix.restore();
  }

  drawWheel(sprite, x, y, angle) {
    let scale = this.size;
    this.spriteMatrix.save();
    this.spriteMatrix.translate(scale * x, scale * y);
    if (angle) this.spriteMatrix.rotate(angle);
    this.wheelProgram.drawSprite(this.wheelSprites[sprite], -scale * 0.18, -scale * 0.3, scale * 0.36, scale * 0.6);
    this.spriteMatrix.restore();
  }

}

class MonsterTank extends ClientTank {
  constructor(model) {
    super(model);
    this.engine = new Engine({
      sound: FX.ENGINE_1,
      gears: [{
        high: 1.9,
        gearing: 1
      }, {
        low: 1.4,
        gearing: 0.8
      }],
      multiplier: 20,
      pitch: 0.8
    });
  }

  static getDrawer() {
    return Drawer;
  }

  static getModel() {
    return MonsterTankModel;
  }

  static getName() {
    return "Монстр";
  }

  static getDescription() {
    return "Рассекайте шоссе 66 на монстре! Скоростной пулемёт " + "поможет сбить прицел соперника, а мощный двигатель и " + "хорошая маневренность позволят оторваться почти от " + "любых видов военной техники.";
  }

  static getStats() {
    return {
      damage: 4,
      health: 20,
      speed: 46,
      shootrate: 2,
      reload: 7
    };
  }

}

ClientTank.register(MonsterTank);
module.exports = MonsterTank;
},{}],74:[function(require,module,exports){
const ClientTank = require(71);

const TankDrawer = require(48);

const NastyTankModel = require(136);

const Engine = require(17);

const FX = require(69);

const Sprite = require(70);

const LightMaskTextureProgram = require(52);

const TextureProgram = require(55);

const Matrix3 = require(50);

class Drawer extends TankDrawer {
  constructor(tank, ctx) {
    super(tank, ctx);
    this.size = 9;
    this.bodyBrightSprite = Sprite.named("tanks/nasty/body-bright");
    this.bodyDarkSprite = Sprite.named("tanks/nasty/body-dark");
    this.bodyLightMask = Sprite.named("tanks/nasty/mask");
    this.ruderSprite = Sprite.named("tanks/nasty/ruder");
    this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx);
    this.textureProgram = new TextureProgram("tank-texture-drawer", ctx);
    this.propellerSprites = [];
    this.spriteMatrix = new Matrix3();
    this.spriteMatrix.translate(0, -this.size * 1.22);
    this.ruderAngle = Math.PI / 4;

    for (let i = 1; i <= 4; i++) this.propellerSprites.push(Sprite.named("tanks/nasty/propeller_" + i));
  }

  draw(camera, dt) {
    let angle = this.tank.model.body.GetAngle();
    camera.matrix.save();
    this.drawSmoke(dt);
    const scale = this.size;
    let position = this.tank.model.body.GetPosition();
    camera.matrix.translate(position.x, position.y);
    camera.matrix.rotate(-angle);
    let propellerDist = this.tank.model.behaviour.details.propellerDist;
    let ruderAngle = this.tank.model.controls.getSteer() * this.ruderAngle;
    const propeller = this.propellerSprites[Math.round(propellerDist) % 4];
    this.bodyProgram.use();
    this.bodyProgram.prepare();
    this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, -scale * 0.96, -scale * 1.32, scale * 1.92, scale * 2.64);
    this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.bodyProgram.setLightAngle(-angle);
    this.bodyProgram.draw();
    this.textureProgram.use();
    this.textureProgram.prepare();
    this.textureProgram.drawSprite(propeller, -scale * 0.76, -scale * 1.06, scale * 0.6, scale * 0.08);
    this.textureProgram.drawSprite(propeller, scale * 0.17, -scale * 1.06, scale * 0.6, scale * 0.08);
    this.textureProgram.setTransform(this.spriteMatrix);
    this.spriteMatrix.save();
    this.spriteMatrix.translate(-scale * 0.46, 0);
    let ruderSine = Math.sin(ruderAngle);
    let ruderCos = Math.cos(ruderAngle);
    this.spriteMatrix.turn(ruderSine, ruderCos);
    this.textureProgram.drawSprite(this.ruderSprite, -scale * 0.06, -scale * 0.44, scale * 0.12, scale * 0.5);
    this.spriteMatrix.restore();
    this.spriteMatrix.save();
    this.spriteMatrix.translate(scale * 0.46, 0);
    this.spriteMatrix.turn(ruderSine, ruderCos);
    this.textureProgram.drawSprite(this.ruderSprite, -scale * 0.06, -scale * 0.44, scale * 0.12, scale * 0.5);
    this.spriteMatrix.restore();
    this.textureProgram.setTransform(null);
    this.textureProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.textureProgram.draw();
    camera.matrix.restore();
  }

}

class NastyTank extends ClientTank {
  constructor(model) {
    super(model);
    this.engine = new Engine({
      sound: FX.ENGINE_4,
      multiplier: 20,
      pitch: 0.9,
      volume: 0.6
    });
  }

  static getDrawer() {
    return Drawer;
  }

  static getModel() {
    return NastyTankModel;
  }

  static getName() {
    return "Мерзила";
  }

  static getDescription() {
    return "Любите запах напалма на утрам? Тогда эта машина - " + "идеальный выбор для вас! Сложный в управлении, но чудовищно " + "разрушительный танк с огнемётом на воздушной подушке.";
  }

  static getStats() {
    return {
      damage: 4,
      health: 15,
      speed: 110,
      shootrate: undefined,
      reload: undefined
    };
  }

}

ClientTank.register(NastyTank);
module.exports = NastyTank;
},{}],75:[function(require,module,exports){
const ClientTank = require(71);

const TankDrawer = require(48);

const SniperTankModel = require(137);

const Engine = require(17);

const FX = require(69);

const Sprite = require(70);

const LightMaskTextureProgram = require(52);

const TruckProgram = require(56);

class Drawer extends TankDrawer {
  constructor(tank, ctx) {
    super(tank, ctx);
    this.size = 9;
    this.bodyBrightSprite = Sprite.named("tanks/sniper/body-bright");
    this.bodyDarkSprite = Sprite.named("tanks/sniper/body-dark");
    this.bodyLightMask = Sprite.named("tanks/sniper/mask");
    this.truckSprite = Sprite.named("tanks/sniper/truck");
    this.bodyProgram = new LightMaskTextureProgram("tank-body-drawer", ctx);
    this.truckProgram = new TruckProgram("tank-truck-drawer", ctx);
    Sprite.setMipMapLevel(0);
    this.truckProgram.use();
    this.truckProgram.textureUniform.set1i(0);
    this.truckProgram.setSprite(this.truckSprite);
    this.truckProgram.setTruckLength(4.0);
    this.truckProgram.setTruckRadius(0.25);
  }

  draw(camera, dt) {
    let angle = this.tank.model.body.GetAngle();
    camera.matrix.save();
    Sprite.setMipMapLevel(0);
    this.drawSmoke(dt);
    const scale = this.size;
    const dscale = scale * 2;
    const segment = dscale / 4;
    let leftTrackDist = this.tank.model.behaviour.details.leftTrackDist;
    let rightTrackDist = this.tank.model.behaviour.details.rightTrackDist;
    let position = this.tank.model.body.GetPosition();
    camera.matrix.translate(position.x, position.y);
    camera.matrix.rotate(-angle);
    this.truckProgram.use();
    this.truckProgram.prepare();
    this.truckProgram.drawTruck(scale / 2, -scale * 0.8, segment, dscale, 4, leftTrackDist);
    this.truckProgram.drawTruck(-scale, -scale * 0.8, segment, dscale, 4, rightTrackDist);
    this.truckProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.truckProgram.draw();
    this.bodyProgram.prepare();
    this.bodyProgram.use();
    this.bodyProgram.drawMaskedSprite(this.bodyBrightSprite, this.bodyDarkSprite, this.bodyLightMask, -scale * 0.9, -scale * 0.7, scale * 1.8, scale * 2);
    let normalizedAngle = -angle / Math.PI / 2 % 1;
    if (normalizedAngle < 0) normalizedAngle += 1;
    this.bodyProgram.angleUniform.set1f(normalizedAngle);
    this.bodyProgram.matrixUniform.setMatrix(camera.matrix.m);
    this.bodyProgram.draw();
    camera.matrix.restore();
  }

}

class SniperTank extends ClientTank {
  constructor(model) {
    super(model);
    this.engine = new Engine({
      sound: FX.ENGINE_2,
      gears: [{
        high: 1.9,
        gearing: 1
      }, {
        low: 1.4,
        high: 2,
        gearing: 0.8
      }, {
        low: 1.4,
        high: 2,
        gearing: 0.6
      }, {
        low: 1.4,
        high: 2,
        gearing: 0.4
      }],
      multiplier: 20,
      pitch: 1
    });
  }

  static getDrawer() {
    return Drawer;
  }

  static getModel() {
    return SniperTankModel;
  }

  static getName() {
    return "Снайпер";
  }

  static getDescription() {
    return "Классический танк. Довольно быстрый и маневренный. " + "Его длинное дуло обеспечит точнейший выстрел. Отлично " + "подходит для всех ситуаций на поле битвы";
  }

  static getStats() {
    return {
      damage: 3,
      health: 10,
      speed: 90,
      shootrate: 1,
      reload: 5
    };
  }

}

ClientTank.register(SniperTank);
module.exports = SniperTank;
},{}],76:[function(require,module,exports){
const View = require(80);

class Dropdown extends View {
  constructor() {
    super();
    this.element.addClass("dropdown");
    this.element.on("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
      if (!this.collapsed) return;
      let wrapper = $(e.target).closest(".select-wrapper");
      if (!wrapper.length) return;
      this.selectOption(wrapper);
    });
    $(document.body).click(() => this.collapse());
    this.prototypeCell = $("<div>").addClass("select-wrapper");
    this.collapsed = true;
  }

  collapse() {
    if (this.collapsed) return;
    this.collapsed = true;
    this.element.removeClass("expanded");
    this.emit("collapse");
  }

  expand() {
    if (!this.collapsed) return;
    this.collapsed = false;
    this.element.addClass("expanded");
    this.emit("expand");
  }

  toggle() {
    this.collapsed ? this.expand() : this.collapse();
  }

  setOptionCount(count) {
    let children = this.getOptions();

    if (children.length > count) {
      while (children.length > count) {
        children.pop().remove();
      }
    } else if (children.length < count) {
      while (children.length < count) {
        this.element.append(this.prototypeCell.clone());
        count--;
      }
    }
  }
  /**
   * @return {jQuery}
   */


  getOptions() {
    return this.element.children();
  }

  selectOption(option) {
    this.element.find(".select-wrapper.selected").removeClass("selected");

    if (option) {
      option.addClass("selected");
      this.element.addClass("selected");
    } else {
      this.element.removeClass("selected");
    }

    this.emit("select", option);
  }

}

module.exports = Dropdown;
},{}],77:[function(require,module,exports){
const EventEmitter = require(145);

class Overlay extends EventEmitter {
  constructor(options) {
    super();
    this.overlay = $("<div>").addClass("overlay");
    this.shown = false;
    this.root = options.root;
    this.root.append(this.overlay);
    this.overlay.hide();
  }

  show() {
    if (this.shown) {
      return;
    }

    this.shown = true;
    this.overlay.show();
    this.overlay.fadeIn();
    this.overlay[0].focus();
  }

  hide(callback) {
    if (!this.shown) {
      return;
    }

    this.shown = false;
    this.overlay.fadeOut(700, callback);
    this.overlay[0].blur();
  }

}

module.exports = Overlay;
},{}],78:[function(require,module,exports){
const View = require(80);

const EventView = require(79);

class EventContainer extends View {
  constructor() {
    super();
    this.element.addClass("event-container");
  }

  cascade() {
    let top = 0;
    let children = this.element.children(".event-view");

    for (let i = children.length - 1; i >= 0; i--) {
      let child = children[i];
      top += child.clientHeight + 10;
      child.style.top = "-" + top + "px";
    }
  }

  createEvent(text) {
    let view = new EventView(text);
    this.element.append(view.element);
    this.cascade();
    view.appear();
    setTimeout(() => {
      view.disappear(() => {
        view.element.remove();
        this.cascade();
      });
    }, 2000);
  }

}

module.exports = EventContainer;
},{}],79:[function(require,module,exports){
const View = require(80);

class EventView extends View {
  constructor(text) {
    super();
    this.element.addClass("menu event-view");
    this.element.css("opacity", "0");
    this.element.text(text);
  }

  appear() {
    this.element.css("opacity", "1");
  }

  disappear(callback) {
    this.element.css("opacity", "0");
    setTimeout(callback, 500);
  }

}

module.exports = EventView;
},{}],80:[function(require,module,exports){
const EventEmitter = require(145);

class View extends EventEmitter {
  /**
   * View raw element
   * @type {jQuery}
   */
  constructor() {
    super();
    this.element = null;
    this.element = $("<div>");
  }

}

module.exports = View;
},{}],81:[function(require,module,exports){
module.exports = function () {
  const canvas = document.createElement("canvas");
  let ctx;

  try {
    ctx = canvas.getContext("webgl");
  } catch (ignored) {}

  try {
    ctx = canvas.getContext("experimental-webgl");
  } catch (ignored) {}

  if (!ctx) throw new Error("WebGL not supported");
  ctx.clearColor(1.0, 1.0, 1.0, 1.0);
  ctx.blendFuncSeparate(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA, ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
  ctx.enable(ctx.BLEND);
  return {
    canvas: canvas,
    ctx: ctx
  };
};
},{}],82:[function(require,module,exports){
const Progress = require(83);

class Downloader {
  static getXHR(dataType, progress) {
    let xhr = new XMLHttpRequest();
    if (dataType) xhr.responseType = dataType;

    if (progress) {
      xhr.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
          progress.setCompleted(evt.loaded);
          progress.setTarget(evt.total);
        }
      }, false);
    }

    return () => xhr;
  }

  static download(urls, handler, dataType, progress) {
    return new Promise((resolve, reject) => {
      let requests = [];
      let awaiting = urls.length;
      let cancelled = false;

      const assetReady = () => {
        if (! --awaiting) resolve();
      };

      for (let [i, url] of urls.entries()) {
        if (cancelled) break;
        let taskProgress = null;

        if (progress) {
          taskProgress = new Progress();
          progress.addSubtask(taskProgress);
        }

        requests.push($.ajax({
          url: url,
          index: i,
          xhr: this.getXHR(dataType, taskProgress)
        }).done(function () {
          if (cancelled) return;
          handler.apply(this, arguments);
          assetReady();
        }).fail(function (response, status, error) {
          if (cancelled) return;
          cancelled = true;
          let reason = "Failed to download " + urls[this.index] + ": " + error;

          for (let request of requests) {
            if (request !== this) request.abort();
          }

          reject(reason);
        }));
      }
    });
  }

}

module.exports = Downloader;
},{}],83:[function(require,module,exports){
class Progress {
  constructor() {
    this.completed = 0;
    this.target = 0;
    this.subtasks = [];
    this.fraction = 0;
    this.refresh = false;
    this.parent = null;
  }

  addSubtask(task) {
    task.parent = this;
    this.subtasks.push(task);
    this.setNeedsUpdate();
  }

  refreshFraction() {
    this.refresh = false;
    let total = this.target + this.subtasks.length;

    if (total === 0) {
      this.fraction = 0;
      return;
    }

    if (this.target === 0) {
      this.fraction = 0;
    } else {
      this.fraction = this.completed;
    }

    for (let task of this.subtasks) {
      this.fraction += task.completeFraction();
    }

    this.fraction /= total;
  }

  complete() {
    if (this.target === 0) {
      this.target = 1;
    }

    this.completed = this.target;
    this.setNeedsUpdate();
  }

  setNeedsUpdate() {
    if (this.parent) {
      this.parent.setNeedsUpdate();
    }

    this.refresh = true;
  }

  setTarget(target) {
    this.target = target;
    this.setNeedsUpdate();
  }

  getTarget() {
    return this.target;
  }

  setCompleted(completed) {
    this.completed = completed;
    this.setNeedsUpdate();
  }

  getCompleted() {
    return this.completed;
  }

  completeFraction() {
    if (this.refresh) {
      this.refreshFraction();
    }

    return this.fraction;
  }

}

module.exports = Progress;
},{}],84:[function(require,module,exports){
class AbstractEffect {
  /**
   * @type EffectModel
   */

  /**
   * @param {EffectModel} model
   */
  constructor(model) {
    this.model = void 0;
    this.model = model;
    this.dead = false;
  }

  tick(dt) {}
  /**
   * @type {Map<Class<EffectModel>, Class<AbstractEffect>>}
   */


  /**
   * @param modelClass {Class<EffectModel>}
   * @param effectClass {Class<AbstractEffect>}
   */
  static associate(modelClass, effectClass) {
    this.Types.set(modelClass, effectClass);
  }
  /**
   * @param model {EffectModel}
   * @returns {AbstractEffect | null}
   */


  static fromModel(model) {
    let clazz = this.Types.get(model.constructor);
    if (!clazz) return null;
    return new clazz(model);
  }

  die() {
    this.dead = true;
  }

}

AbstractEffect.Types = new Map();
module.exports = AbstractEffect;
},{}],85:[function(require,module,exports){
const BinarySerializable = require(124);
/**
 * @abstract
 * This class represents an effect model, which contains all necessary
 * data to create an side-specific effect class instance
 */


class EffectModel extends BinarySerializable {
  /**
   * @private
   * @type {number}
   */

  /**
   * Unique effect identifier
   */

  /**
   * @param {Object} [options]
   * @param {number} [options.id]
   */
  constructor(options) {
    super();
    this.id = void 0;

    if (options) {
      if (options.id === undefined) {
        this.id = EffectModel.globalId++;
      } else {
        this.id = options.id;
      }
    }
  }

  static groupName() {
    return 2;
  }

  toBinary(encoder) {
    encoder.writeFloat64(this.id);
  }

  static fromBinary(decoder) {
    return new this({
      id: decoder.readFloat64()
    });
  }

}

EffectModel.globalId = 0;
module.exports = EffectModel;
},{}],86:[function(require,module,exports){
const EffectModel = require(85);
/**
 * @abstract
 */


class TankEffectModel extends EffectModel {
  constructor(...args) {
    super(...args);
    this.tankId = void 0;
  }

  static fromBinary(decoder) {
    let model = super.fromBinary(decoder);
    model.tankId = decoder.readUint16();
    return model;
  }

  toBinary(encoder) {
    super.toBinary(encoder);
    encoder.writeUint16(this.tankId);
  }

}

module.exports = TankEffectModel;
},{}],87:[function(require,module,exports){
const TankEffectModel = require(86);

class TankFireEffectModel extends TankEffectModel {
  static typeName() {
    return 1;
  }

}

TankEffectModel.register(TankFireEffectModel);
module.exports = TankFireEffectModel;
},{}],88:[function(require,module,exports){
const WorldEffectModel = require(90);

class WorldExplodeEffectModel extends WorldEffectModel {
  static typeName() {
    return 2;
  }
  /**
   * Explode power
   * @type {number}
   */


  /**
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} [options.power]
   */
  constructor(options) {
    super(options);
    this.power = 4;
    if (options.power) this.power = options.power;
  }

  toBinary(encoder) {
    super.toBinary(encoder);
    encoder.writeFloat32(this.power);
  }

  static fromBinary(decoder) {
    let effect = super.fromBinary(decoder);
    effect.power = decoder.readFloat32();
    return effect;
  }

}

WorldEffectModel.register(WorldExplodeEffectModel);
module.exports = WorldExplodeEffectModel;
},{}],89:[function(require,module,exports){
const GameMap = require(159);

const Box2D = require(99);

class WorldExplodeEffectModelPool {
  /**
   * @type GameWorld
   */
  constructor(config) {
    this.world = void 0;
    this.world = config.world;
    this.powerDamping = 0.01;
    this.stepsPerSecond = 30;
    this.stepsWaiting = 0;
    /**
     * @type Map<number, Map<number, Object>>
     */

    this.walkers = new Map();
    this.gridSize = GameMap.BLOCK_SIZE;
    this.offsetMap = [1, 0, 1, -1, 0, -1, -1, -1, -1, 0, -1, 1, 0, 1, 1, 1];

    this.roundOffsetMap = (() => {
      let array = [];

      for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
        array.push(Math.sin(i));
        array.push(Math.cos(i));
      }

      return array;
    })(); // Сколько единиц скорости соответствует
    // одной единицы энергии ячейки


    this.waveCoefficient = 1; // 10% энергии взрыва уходит на урон блокам
    // Остальные 90% остаются у блока

    this.damageEnergyFraction = 0.1; // Какому усилию соответствует единица скорости волны
    // Этот коэффициент настраивает силу отталкивания танков

    this.forceCoefficient = 10000; // Практика показала, что если смотреть на два блока,
    // а не на один, при рассчете разницы давления, то
    // сила отталкивания будет рассчитана более правильно.

    this.pressureDifferentialDistance = this.gridSize * 2;
  }

  isBlock(x, y) {
    let block = this.world.map.getBlock(Math.floor(x / GameMap.BLOCK_SIZE), Math.floor(y / GameMap.BLOCK_SIZE));
    if (!block) return true;
    return block.constructor.isSolid;
  }
  /**
   * Adds a high pressure zone to this pool (aka an explosion source). If
   * given coordinates does not match the pool grid, the pressure will
   * be distributed among the nearest grid cells according to the
   * linear interpolation algorhitm
   * @param {Number} x
   * @param {Number} y
   * @param {Number} power
   */


  start(x, y, power) {
    let shift = this.gridSize / 2;
    power /= 4;
    this.startParticular(x + shift, y + shift, power);
    this.startParticular(x - shift, y + shift, power);
    this.startParticular(x + shift, y - shift, power);
    this.startParticular(x - shift, y - shift, power);
  }
  /**
   * @private
   * @param x
   * @param y
   * @param power
   * @return {[{vx: Number, vy: Number, x: Number, vn: Number, y: Number, power: Number}]}
   */


  interpolateWalkers(x, y, power) {
    // Linear interpolation alghoritm
    let gridX = x / this.gridSize;
    let gridY = y / this.gridSize;
    let dx = gridX - (gridX = Math.floor(gridX - 0.5) + 0.5);
    let dy = gridY - (gridY = Math.floor(gridY - 0.5) + 0.5);
    let walkers = [this.walker(gridX * this.gridSize, gridY * this.gridSize, 0, 0, power * (1 - dx))];
    if (dx > 0) walkers.push(this.walker((gridX + 1) * this.gridSize, gridY * this.gridSize, 0, 0, power * dx));

    if (dy > 0) {
      if (dx > 0) {
        walkers.push(this.walker((gridX + 1) * this.gridSize, (gridY + 1) * this.gridSize, 0, 0, walkers[1].power * dy));
        walkers[1].power *= 1 - dy;
      }

      walkers.push(this.walker(gridX * this.gridSize, (gridY + 1) * this.gridSize, 0, 0, walkers[0].power * dy));
      walkers[0].power *= 1 - dy;
    }

    return walkers;
  }
  /**
   * @private
   * @param x
   * @param y
   * @param power
   */


  startParticular(x, y, power) {
    let walkers = this.interpolateWalkers(x, y, power); // Координаты ячейки, находящейся ближе всего к взрыву

    const sourceX = (Math.floor(x / this.gridSize) + 0.5) * this.gridSize;
    const sourceY = (Math.floor(y / this.gridSize) + 0.5) * this.gridSize; // Надоело строить из себя англичанина. Короче, эта функция говорит,
    // есть ли путь из точки, куда попал снаряд, в соседнюю точку. Сам по
    // себе взрыв в начале распространяется по четырем ячейкам, так
    // что здесь проверяются только углы (sourceX, y), (x, sourceY) А если
    // что-то из этого равно исходным координатам, достаточно проверить только
    // одну точку - ту, которая дается в параметр

    const possible = (x, y) => {
      if (this.isBlock(x, y)) return false;
      return x === sourceX || y === sourceY || !this.isBlock(sourceX, y) || !this.isBlock(x, sourceY);
    };

    let powerToSpread = 0;
    let succeededWalkers = []; // Здесь мы ищем, на какие точки давление может быть
    // распределено, а на какие - нет.

    for (let walker of walkers) {
      if (possible(walker.x, walker.y)) {
        succeededWalkers.push(walker);
      } else {
        powerToSpread += walker.power;
      }
    }

    powerToSpread /= succeededWalkers.length;

    for (let walker of succeededWalkers) {
      let current = this.getWalker(this.walkers, walker.x, walker.y);

      if (current) {
        current.power += powerToSpread + walker.power;
      } else {
        walker.power += powerToSpread;
        this.addWalker(this.walkers, walker);
      }
    }
  } // Не хочется оборачивать эту структуру в класс, потому что это замедлит код.

  /**
   * @private
   * @param x
   * @param y
   * @param vx
   * @param vy
   * @param power
   * @return {{vx: *, vy: *, x: *, vn: number, y: *, power: *}}
   */


  walker(x, y, vx, vy, power) {
    return {
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      vn: 1,
      power: power
    };
  }
  /**
   * @private
   * @param map
   * @param x
   * @param y
   * @return {{vx: *, vy: *, x: *, vn: number, y: *, power: *}|null}
   */


  getWalker(map, x, y) {
    let row, column;

    if ((row = map.get(x)) && (column = row.get(y))) {
      return column;
    }

    return null;
  }
  /**
   * @private
   * @param map
   * @param walker
   */


  addWalker(map, walker) {
    let row;

    if (row = map.get(walker.x)) {
      row.set(walker.y, walker);
    } else {
      map.set(walker.x, new Map([[walker.y, walker]]));
    }
  }
  /**
   * @private
   * @param dt
   */


  step(dt) {
    this.tickEntities(dt);
    this.stepsWaiting -= 1;
    let newWalkers = new Map();

    const walk = (walker, dx, dy, power) => {
      let x = walker.x + dx * this.gridSize;
      let y = walker.y + dy * this.gridSize;
      if (this.isBlock(x, y)) return;
      let vx = walker.vx + dx * power * this.waveCoefficient;
      let vy = walker.vy + dy * power * this.waveCoefficient;
      let current = this.getWalker(newWalkers, x, y);

      if (current) {
        current.vx += vx;
        current.vy += vy;
        current.vn++;
        current.power += power;
      } else {
        this.addWalker(newWalkers, this.walker(x, y, vx, vy, power));
      }
    };

    let sibling = new Array(8);

    for (let columns of this.walkers.values()) {
      for (let walker of columns.values()) {
        let x = walker.x;
        let y = walker.y;
        let total = 1;

        for (let j = 0, i = 0; j < 8; j++) {
          let dx = this.offsetMap[i++];
          let dy = this.offsetMap[i++];

          if (this.isBlock(x + dx * this.gridSize, y + dy * this.gridSize)) {
            sibling[j] = -this.damageEnergyFraction; // Reflection algorithm
            // Sibling element is negative meaning block is being damaged

            if (dx && !dy && dx > 0 === walker.vx > 0) walker.vx = -walker.vx;
            if (!dx && dy && dy > 0 === walker.vy > 0) walker.vy = -walker.vy;
          } else sibling[j] = 1;
        }

        for (let j = 0, i = 0; j < 8; j++) {
          let dx = this.offsetMap[i++];
          let dy = this.offsetMap[i++];
          if (j % 2 === 1) continue;
          let power = dx * walker.vx + dy * walker.vy;
          if (sibling[j] < 0) power /= this.waveCoefficient;
          power += 1;

          if (power > 0) {
            sibling[j] *= power;
          } else {
            sibling[j] = 0;
          }
        }

        for (let j = 1; j <= 7; j += 2) {
          sibling[j] *= Math.max(0, sibling[j - 1]) + Math.max(0, sibling[(j + 1) % 8]);
        }

        for (let j = 0; j < 8; j++) {
          total += Math.abs(sibling[j]);
        }

        walker.power = (walker.power - this.powerDamping) / total;
        walker.vx /= total;
        walker.vy /= total;
        if (walker.power <= 0) continue;
        walk(walker, 0, 0, walker.power);

        for (let j = 0, i = 0; j < 8; j++) {
          let dx = this.offsetMap[i++];
          let dy = this.offsetMap[i++];

          if (sibling[j] > 0) {
            walk(walker, dx, dy, walker.power * sibling[j]);
          } else if (sibling[j] < 0) {
            this.damageBlock(walker.x + dx * this.gridSize, walker.y + dy * this.gridSize, -sibling[j] * walker.power);
          }
        }
      }
    }

    for (let columns of this.walkers.values()) {
      for (let walker of columns.values()) {
        walker.vx /= walker.vn;
        walker.vy /= walker.vn;
        walker.vn = 1;
      }
    }

    this.walkers = newWalkers;
  }

  damageBlock(x, y, damage) {}

  mapPower(walkers, x, y) {
    const relX = x / this.gridSize - 0.5;
    const relY = y / this.gridSize - 0.5;
    const fromX = (Math.floor(relX) + 0.5) * this.gridSize;
    const fromY = (Math.floor(relY) + 0.5) * this.gridSize;
    const toX = (Math.ceil(relX) + 0.5) * this.gridSize;
    const toY = (Math.ceil(relY) + 0.5) * this.gridSize;
    let resultPower = 0;

    for (let gridX = fromX; gridX <= toX; gridX += this.gridSize) {
      let row = this.walkers.get(gridX);
      if (!row) continue;

      for (let gridY = fromY; gridY <= toY; gridY += this.gridSize) {
        let walker = row.get(gridY);
        if (!walker) continue;
        let dx = 1 - Math.abs(gridX - x) / this.gridSize;
        let dy = 1 - Math.abs(gridY - y) / this.gridSize;
        let fraction = dx * dy;
        resultPower += walker.power * fraction;
      }
    }

    return resultPower;
  }

  tickEntities(dt) {
    let gridDifference = this.gridSize / GameMap.BLOCK_SIZE;

    for (let player of this.world.players.values()) {
      let tank = player.tank;
      if (!tank) continue;
      let position = tank.model.body.GetPosition();
      const x = position.x;
      const y = position.y;
      const sourceWalkerPower = this.mapPower(this.walkers, x, y);
      let resultVx = 0;
      let resultVy = 0;
      let maxPowerDifference = 0; // Checking nearby walkers

      for (let i = 0; i < this.roundOffsetMap.length;) {
        let dx = this.roundOffsetMap[i++];
        let dy = this.roundOffsetMap[i++];
        let skip = false;
        let gridX;
        let gridY;

        for (let distance = this.gridSize; distance <= this.pressureDifferentialDistance; distance += GameMap.BLOCK_SIZE) {
          gridX = x + dx * distance;
          gridY = y + dy * distance;

          if (this.isBlock(gridX, gridY)) {
            skip = true;
            continue;
          }
        }

        if (skip) continue;
        let power = this.mapPower(this.walkers, gridX, gridY);
        let powerDifference = sourceWalkerPower - power;
        if (powerDifference > maxPowerDifference) maxPowerDifference = powerDifference;
        resultVx += dx * powerDifference;
        resultVy += dy * powerDifference;
      }

      let length = Math.sqrt(resultVx ** 2 + resultVy ** 2);
      if (length == 0) return 0;
      resultVx /= length;
      resultVy /= length;
      maxPowerDifference *= this.forceCoefficient;
      resultVx *= maxPowerDifference;
      resultVy *= maxPowerDifference;
      tank.model.body.ApplyImpulse(new Box2D.b2Vec2(resultVx, resultVy), position);
    }
  }

  normalize(x) {
    return (1 - 1 / (Math.abs(x) + 1)) * Math.sign(x);
  }

  tick(dt) {
    if (this.walkers.size === 0) return;
    this.stepsWaiting += this.stepsPerSecond * dt;

    while (this.stepsWaiting > 1) this.step(1 / this.stepsPerSecond);
  }

}

module.exports = WorldExplodeEffectModelPool;
},{}],90:[function(require,module,exports){
const EffectModel = require(85);
/**
 * @abstract
 */


class WorldEffectModel extends EffectModel {
  /**
   * @type Number
   */

  /**
   * @type Number
   */

  /**
   * @param {Object} options
   * @param {number} options.x
   * @param {number} options.y
   */
  constructor(options) {
    super(options);
    this.x = void 0;
    this.y = void 0;
    this.x = options.x;
    this.y = options.y;
  }

  toBinary(encoder) {
    super.toBinary(encoder);
    encoder.writeFloat32(this.x);
    encoder.writeFloat32(this.y);
  }

  static fromBinary(decoder) {
    let model = super.fromBinary(decoder);
    model.x = decoder.readFloat32();
    model.y = decoder.readFloat32();
    return model;
  }

}

module.exports = WorldEffectModel;
},{}],91:[function(require,module,exports){
const EntityModel = require(97);

class AbstractEntity {
  /**
   * @type EntityModel
   */
  constructor(model) {
    this.model = null;
    this.model = model;
  }

  tick(dt) {
    this.model.tick(dt);
  }

}

module.exports = AbstractEntity;
},{}],92:[function(require,module,exports){
const EntityModel = require(97);

class BulletModel extends EntityModel {
  constructor() {
    super();
  }

}

module.exports = BulletModel;
},{}],93:[function(require,module,exports){
const BulletModel = require(92);

class BulletModel16mm extends BulletModel {
  static typeName() {
    return 4;
  }

  constructor() {
    super();
  }

}

BulletModel.register(BulletModel16mm);
module.exports = BulletModel16mm;
},{}],94:[function(require,module,exports){
const BulletModel = require(92);

class BulletModel42mm extends BulletModel {
  static typeName() {
    return 0;
  }

  constructor() {
    super();
  }

}

BulletModel.register(BulletModel42mm);
module.exports = BulletModel42mm;
},{}],95:[function(require,module,exports){
const BulletModel = require(92);

class BulletModelCannonball extends BulletModel {
  static typeName() {
    return 2;
  }

  constructor() {
    super();
  }

}

BulletModel.register(BulletModelCannonball); // module.exports = new BulletType({
// 	name: "cannonball",
// 	explodePower: 2,
// 	mass: 30,
// 	wallDamage: 7600,
// 	playerDamage: 4,
// 	velocity: 600,
// 	explodes: false,
// 	id: 2
// })

module.exports = BulletModelCannonball;
},{}],96:[function(require,module,exports){
const BulletModel = require(92);

class BulletModelMine extends BulletModel {
  static typeName() {
    return 7;
  }

  constructor(config) {
    super(config);
  }

} // module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })


BulletModel.register(BulletModelMine);
module.exports = BulletModelMine;
},{}],97:[function(require,module,exports){
const BinarySerializable = require(124);
/**
 * Entity model. Describes entity position,
 * velocity and angle. Each entity type should
 * inherit this class.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */


class EntityModel extends BinarySerializable {
  static groupName() {
    return 5;
  }
  /**
   * Per-screen unique entity identifier
   * @type number
   */


  constructor() {
    super();
    this.id = void 0;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.rotation = 0;
    this.dead = false;
    this.id = 0;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.rotation = 0;
  }

  tick(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }

  toBinary(encoder) {
    encoder.writeUint32(this.id);
    this.encodeDynamicData(encoder);
  }

  encodeDynamicData(encoder) {
    encoder.writeFloat32(this.x);
    encoder.writeFloat32(this.y);
    encoder.writeFloat32(this.dx);
    encoder.writeFloat32(this.dy);
    encoder.writeFloat32(this.rotation);
  }

  decodeDynamicData(decoder) {
    this.x = decoder.readFloat32();
    this.y = decoder.readFloat32();
    this.dx = decoder.readFloat32();
    this.dy = decoder.readFloat32();
    this.rotation = decoder.readFloat32();
  }

  static fromBinary(decoder) {
    const entity = new this();
    entity.id = decoder.readUint32();
    entity.decodeDynamicData(decoder);
    return entity;
  }

}

module.exports = EntityModel;
},{}],98:[function(require,module,exports){
const Box2D = require(99);

const GameMap = require(159);

const EventEmitter = require(145);

const WorldExplodeEffectModelPool = require(89);

class GameWorld extends EventEmitter {
  /**
   * @type {Map<number, GameWorld>}
   */

  /**
   * @type {GameMap}
   */

  /**
   * @type {Map<number, Player>}
   */

  /**
   * @type {Map<number, AbstractEntity>}
   */

  /**
   * @type {Map<number, AbstractEffect>}
   */

  /**
   * @type WorldExplodeEffectModelPool
   */
  constructor(options) {
    super();
    this.world = void 0;
    this.map = void 0;
    this.players = new Map();
    this.entities = new Map();
    this.effects = new Map();
    this.explosionEffectPool = void 0;
    options = Object.assign({
      physicsTick: 0.002,
      maxTicks: 10,
      positionSteps: 1,
      velocitySteps: 1
    }, options);
    this.world = new Box2D.b2World(new Box2D.b2Vec2(), true);
    this.map = options.map;
    this.physicsTick = options.physicsTick;
    this.maxTicks = options.maxTicks;
    this.positionSteps = options.positionSteps;
    this.velocitySteps = options.velocitySteps;
    this.createExplosionPool();
  }

  createExplosionPool() {
    this.explosionEffectPool = new WorldExplodeEffectModelPool({
      world: this
    });
  } // TODO: Вынести в отдельный класс


  rebuildBlockPhysics() {
    for (let player of this.players.values()) {
      if (!player.tank) continue;
      let position = player.tank.model.body.GetPosition();
      const x = Math.floor(position.x / GameMap.BLOCK_SIZE);
      const y = Math.floor(position.y / GameMap.BLOCK_SIZE);
      const tx = x + 2;
      const ty = y + 2;
      let n = 0;

      for (let i = x - 2; i <= tx; i++) {
        for (let j = y - 2; j <= ty; j++, n++) {
          if (i === x && j === y) continue;
          let block = player.blockMap[n];
          let mapBlock = this.map.getBlock(i, j);

          if (mapBlock && mapBlock.constructor.isSolid || i < 0 || j < 0 || i >= this.map.width || j >= this.map.height) {
            let pos = block.GetPosition();
            pos.x = (i + 0.5) * GameMap.BLOCK_SIZE;
            pos.y = (j + 0.5) * GameMap.BLOCK_SIZE;
            block.SetPosition(pos);
            block.m_fixtureList.m_filter.maskBits = 0xFFFF;
          } else {
            if (block.m_fixtureList.m_filter.maskBits) {
              let pos = block.GetPosition();
              pos.Set(-1000, -1000);
              block.SetPosition(pos);
            }

            block.m_fixtureList.m_filter.maskBits = 0;
          }
        }
      }
    }
  }

  processPhysics(dt) {
    this.explosionEffectPool.tick(dt);
    let steps = Math.floor(dt / this.physicsTick);
    if (steps > this.maxTicks) steps = this.maxTicks;

    for (let i = 0; i < steps; i++) this.world.Step(this.physicsTick, 1, 1);

    this.rebuildBlockPhysics();
    this.world.ClearForces();

    for (let player of this.players.values()) {
      if (player.tank) player.tank.tick(dt);
    }
  }

  processEntities(dt) {
    for (let entity of this.entities.values()) {
      entity.tick(dt);
      if (entity.model.dead) this.removeEntity(entity);
    }
  }

  processEffects(dt) {
    for (let effect of this.effects.values()) {
      effect.tick(dt);

      if (effect.dead) {
        this.removeEffect(effect);
      }
    }
  }

  tick(dt) {
    // Processing entities first because
    // otherwise processPhysics method
    // does an excessive initial tick
    // to new bullets
    this.processEntities(dt);
    this.processPhysics(dt);
    this.processEffects(dt);
  }

  createEntity(entity) {
    entity.game = this;
    this.entities.set(entity.model.id, entity);
    this.emit("entity-create", entity);
  }

  removeEntity(entity) {
    this.entities.delete(entity.model.id);
    this.emit("entity-remove", entity);
  }

  createPlayer(player) {
    if (this.players.has(player.id)) {
      this.players.get(player.id).destroy();
    }

    player.world = this;
    this.players.set(player.id, player);
    player.setupPhysics();
    this.emit("player-create", player);
  }

  removePlayer(player) {
    player.destroy(); //player.team.remove(player);

    this.players.delete(player.id);
    this.emit("player-remove", player);
  }

  addTankEffect(effect, tank) {
    this.emit("effect-create", effect, tank);
  }

  removeTankEffect(effect, tank) {
    this.emit("effect-remove", effect, tank);
  }

  addEffect(effect) {
    if (this.effects.has(effect.model.id)) return;
    this.effects.set(effect.model.id, effect);
    this.emit("effect-create", effect);
  }

  removeEffect(effect) {
    if (this.effects.delete(effect.model.id)) {
      this.emit("effect-remove", effect);
    }
  }

}

module.exports = GameWorld;
},{}],99:[function(require,module,exports){
function extend(a, b) {
  for (var c in b) {
    a[c] = b[c];
  }
}

function isInstanceOf(obj, _constructor) {
  while (typeof obj === "object") {
    if (obj.constructor === _constructor) {
      return true;
    }

    obj = obj._super;
  }

  return false;
}

;

var b2BoundValues = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2BoundValues.prototype.__constructor = function () {
  this.lowerValues = new Array();
  this.lowerValues[0] = 0;
  this.lowerValues[1] = 0;
  this.upperValues = new Array();
  this.upperValues[0] = 0;
  this.upperValues[1] = 0;
};

b2BoundValues.prototype.__varz = function () {};

b2BoundValues.prototype.lowerValues = null;
b2BoundValues.prototype.upperValues = null;

var b2PairManager = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2PairManager.prototype.__constructor = function () {
  this.m_pairs = new Array();
  this.m_pairBuffer = new Array();
  this.m_pairCount = 0;
  this.m_pairBufferCount = 0;
  this.m_freePair = null;
};

b2PairManager.prototype.__varz = function () {};

b2PairManager.prototype.AddPair = function (proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];

  if (pair != null) {
    return pair;
  }

  if (this.m_freePair == null) {
    this.m_freePair = new b2Pair();
    this.m_pairs.push(this.m_freePair);
  }

  pair = this.m_freePair;
  this.m_freePair = pair.next;
  pair.proxy1 = proxy1;
  pair.proxy2 = proxy2;
  pair.status = 0;
  pair.userData = null;
  pair.next = null;
  proxy1.pairs[proxy2] = pair;
  proxy2.pairs[proxy1] = pair;
  ++this.m_pairCount;
  return pair;
};

b2PairManager.prototype.RemovePair = function (proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];

  if (pair == null) {
    return null;
  }

  var userData = pair.userData;
  delete proxy1.pairs[proxy2];
  delete proxy2.pairs[proxy1];
  pair.next = this.m_freePair;
  pair.proxy1 = null;
  pair.proxy2 = null;
  pair.userData = null;
  pair.status = 0;
  this.m_freePair = pair;
  --this.m_pairCount;
  return userData;
};

b2PairManager.prototype.Find = function (proxy1, proxy2) {
  return proxy1.pairs[proxy2];
};

b2PairManager.prototype.ValidateBuffer = function () {};

b2PairManager.prototype.ValidateTable = function () {};

b2PairManager.prototype.Initialize = function (broadPhase) {
  this.m_broadPhase = broadPhase;
};

b2PairManager.prototype.AddBufferedPair = function (proxy1, proxy2) {
  var pair = this.AddPair(proxy1, proxy2);

  if (pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount;
  }

  pair.ClearRemoved();

  if (b2BroadPhase.s_validate) {
    this.ValidateBuffer();
  }
};

b2PairManager.prototype.RemoveBufferedPair = function (proxy1, proxy2) {
  var pair = this.Find(proxy1, proxy2);

  if (pair == null) {
    return;
  }

  if (pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount;
  }

  pair.SetRemoved();

  if (b2BroadPhase.s_validate) {
    this.ValidateBuffer();
  }
};

b2PairManager.prototype.Commit = function (callback) {
  var i = 0;
  var removeCount = 0;

  for (i = 0; i < this.m_pairBufferCount; ++i) {
    var pair = this.m_pairBuffer[i];
    pair.ClearBuffered();
    var proxy1 = pair.proxy1;
    var proxy2 = pair.proxy2;

    if (pair.IsRemoved()) {} else {
      if (pair.IsFinal() == false) {
        callback(proxy1.userData, proxy2.userData);
      }
    }
  }

  this.m_pairBufferCount = 0;

  if (b2BroadPhase.s_validate) {
    this.ValidateTable();
  }
};

b2PairManager.prototype.m_broadPhase = null;
b2PairManager.prototype.m_pairs = null;
b2PairManager.prototype.m_freePair = null;
b2PairManager.prototype.m_pairCount = 0;
b2PairManager.prototype.m_pairBuffer = null;
b2PairManager.prototype.m_pairBufferCount = 0;

var b2TimeStep = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2TimeStep.prototype.__constructor = function () {};

b2TimeStep.prototype.__varz = function () {};

b2TimeStep.prototype.Set = function (step) {
  this.dt = step.dt;
  this.inv_dt = step.inv_dt;
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  this.warmStarting = step.warmStarting;
};

b2TimeStep.prototype.dt = null;
b2TimeStep.prototype.inv_dt = null;
b2TimeStep.prototype.dtRatio = null;
b2TimeStep.prototype.velocityIterations = 0;
b2TimeStep.prototype.positionIterations = 0;
b2TimeStep.prototype.warmStarting = null;

var b2Controller = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Controller.prototype.__constructor = function () {};

b2Controller.prototype.__varz = function () {};

b2Controller.prototype.Step = function (step) {};

b2Controller.prototype.Draw = function (debugDraw) {};

b2Controller.prototype.AddBody = function (body) {
  var edge = new b2ControllerEdge();
  edge.controller = this;
  edge.body = body;
  edge.nextBody = m_bodyList;
  edge.prevBody = null;
  m_bodyList = edge;

  if (edge.nextBody) {
    edge.nextBody.prevBody = edge;
  }

  m_bodyCount++;
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  body.m_controllerList = edge;

  if (edge.nextController) {
    edge.nextController.prevController = edge;
  }

  body.m_controllerCount++;
};

b2Controller.prototype.RemoveBody = function (body) {
  var edge = body.m_controllerList;

  while (edge && edge.controller != this) {
    edge = edge.nextController;
  }

  if (edge.prevBody) {
    edge.prevBody.nextBody = edge.nextBody;
  }

  if (edge.nextBody) {
    edge.nextBody.prevBody = edge.prevBody;
  }

  if (edge.nextController) {
    edge.nextController.prevController = edge.prevController;
  }

  if (edge.prevController) {
    edge.prevController.nextController = edge.nextController;
  }

  if (m_bodyList == edge) {
    m_bodyList = edge.nextBody;
  }

  if (body.m_controllerList == edge) {
    body.m_controllerList = edge.nextController;
  }

  body.m_controllerCount--;
  m_bodyCount--;
};

b2Controller.prototype.Clear = function () {
  while (m_bodyList) {
    this.RemoveBody(m_bodyList.body);
  }
};

b2Controller.prototype.GetNext = function () {
  return this.m_next;
};

b2Controller.prototype.GetWorld = function () {
  return this.m_world;
};

b2Controller.prototype.GetBodyList = function () {
  return m_bodyList;
};

b2Controller.prototype.m_next = null;
b2Controller.prototype.m_prev = null;
b2Controller.prototype.m_world = null;

var b2GravityController = function () {
  b2Controller.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2GravityController.prototype, b2Controller.prototype);
b2GravityController.prototype._super = b2Controller.prototype;

b2GravityController.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2GravityController.prototype.__varz = function () {};

b2GravityController.prototype.Step = function (step) {
  var i = null;
  var body1 = null;
  var p1 = null;
  var mass1 = 0;
  var j = null;
  var body2 = null;
  var p2 = null;
  var dx = 0;
  var dy = 0;
  var r2 = 0;
  var f = null;

  if (this.invSqr) {
    for (i = m_bodyList; i; i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();

      for (j = m_bodyList; j != i; j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;

        if (r2 < Number.MIN_VALUE) {
          continue;
        }

        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());

        if (body1.IsAwake()) {
          body1.ApplyForce(f, p1);
        }

        f.Multiply(-1);

        if (body2.IsAwake()) {
          body2.ApplyForce(f, p2);
        }
      }
    }
  } else {
    for (i = m_bodyList; i; i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();

      for (j = m_bodyList; j != i; j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;

        if (r2 < Number.MIN_VALUE) {
          continue;
        }

        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 * mass1 * body2.GetMass());

        if (body1.IsAwake()) {
          body1.ApplyForce(f, p1);
        }

        f.Multiply(-1);

        if (body2.IsAwake()) {
          body2.ApplyForce(f, p2);
        }
      }
    }
  }
};

b2GravityController.prototype.G = 1;
b2GravityController.prototype.invSqr = true;

var b2DestructionListener = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DestructionListener.prototype.__constructor = function () {};

b2DestructionListener.prototype.__varz = function () {};

b2DestructionListener.prototype.SayGoodbyeJoint = function (joint) {};

b2DestructionListener.prototype.SayGoodbyeFixture = function (fixture) {};

var b2ContactEdge = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactEdge.prototype.__constructor = function () {};

b2ContactEdge.prototype.__varz = function () {};

b2ContactEdge.prototype.other = null;
b2ContactEdge.prototype.contact = null;
b2ContactEdge.prototype.prev = null;
b2ContactEdge.prototype.next = null;

var b2EdgeChainDef = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2EdgeChainDef.prototype.__constructor = function () {
  this.vertexCount = 0;
  this.isALoop = true;
  this.vertices = [];
};

b2EdgeChainDef.prototype.__varz = function () {};

b2EdgeChainDef.prototype.vertices = null;
b2EdgeChainDef.prototype.vertexCount = null;
b2EdgeChainDef.prototype.isALoop = null;

class b2Vec2 {
  constructor(x_, y_) {
    this.x = 0;
    this.y = 0;

    if (arguments.length == 2) {
      this.x = x_;
      this.y = y_;
    }
  }

  SetZero() {
    this.x = 0;
    this.y = 0;
  }

  Set(x_, y_) {
    this.x = x_;
    this.y = y_;
  }

  SetV(v) {
    this.x = v.x;
    this.y = v.y;
  }

  GetNegative() {
    return new b2Vec2(-this.x, -this.y);
  }

  NegativeSelf() {
    this.x = -this.x;
    this.y = -this.y;
  }

  Copy() {
    return new b2Vec2(this.x, this.y);
  }

  Add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  Subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  Multiply(a) {
    this.x *= a;
    this.y *= a;
  }

  MulM(A) {
    var tX = this.x;
    this.x = A.col1.x * tX + A.col2.x * this.y;
    this.y = A.col1.y * tX + A.col2.y * this.y;
  }

  MulTM(A) {
    var tX = b2Math.Dot(this, A.col1);
    this.y = b2Math.Dot(this, A.col2);
    this.x = tX;
  }

  CrossVF(s) {
    var tX = this.x;
    this.x = s * this.y;
    this.y = -s * tX;
  }

  CrossFV(s) {
    var tX = this.x;
    this.x = -s * this.y;
    this.y = s * tX;
  }

  MinV(b) {
    this.x = this.x < b.x ? this.x : b.x;
    this.y = this.y < b.y ? this.y : b.y;
  }

  MaxV(b) {
    this.x = this.x > b.x ? this.x : b.x;
    this.y = this.y > b.y ? this.y : b.y;
  }

  Abs() {
    if (this.x < 0) {
      this.x = -this.x;
    }

    if (this.y < 0) {
      this.y = -this.y;
    }
  }

  Length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  LengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  Normalize() {
    var length = Math.sqrt(this.x * this.x + this.y * this.y);

    if (length < Number.MIN_VALUE) {
      return 0;
    }

    var invLength = 1 / length;
    this.x *= invLength;
    this.y *= invLength;
    return length;
  }

  IsValid() {
    return b2Math.IsValid(this.x) && b2Math.IsValid(this.y);
  }

  static Make(x_, y_) {
    return new b2Vec2(x_, y_);
  }

}

class b2Vec3 {
  constructor(x, y, z) {
    this.x = 0;
    this.y = 0;
    this.z = 0;

    if (arguments.length == 3) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  SetZero() {
    this.x = this.y = this.z = 0;
  }

  Set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  SetV(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  GetNegative() {
    return new b2Vec3(-this.x, -this.y, -this.z);
  }

  NegativeSelf() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  }

  Copy() {
    return new b2Vec3(this.x, this.y, this.z);
  }

  Add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  Subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }

  Multiply(a) {
    this.x *= a;
    this.y *= a;
    this.z *= a;
  }

}

var b2DistanceProxy = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DistanceProxy.prototype.__constructor = function () {};

b2DistanceProxy.prototype.__varz = function () {};

b2DistanceProxy.prototype.Set = function (shape) {
  switch (shape.GetType()) {
    case b2Shape.e_circleShape:
      var circle = shape;
      this.m_vertices = new Array(1);
      this.m_vertices[0] = circle.m_p;
      this.m_count = 1;
      this.m_radius = circle.m_radius;
      break;

    case b2Shape.e_polygonShape:
      var polygon = shape;
      this.m_vertices = polygon.m_vertices;
      this.m_count = polygon.m_vertexCount;
      this.m_radius = polygon.m_radius;
      break;

    default:
      b2Settings.b2Assert(false);
  }
};

b2DistanceProxy.prototype.GetSupport = function (d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;

  for (var i = 1; i < this.m_count; ++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;

    if (value > bestValue) {
      bestIndex = i;
      bestValue = value;
    }
  }

  return bestIndex;
};

b2DistanceProxy.prototype.GetSupportVertex = function (d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;

  for (var i = 1; i < this.m_count; ++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;

    if (value > bestValue) {
      bestIndex = i;
      bestValue = value;
    }
  }

  return this.m_vertices[bestIndex];
};

b2DistanceProxy.prototype.GetVertexCount = function () {
  return this.m_count;
};

b2DistanceProxy.prototype.GetVertex = function (index) {
  b2Settings.b2Assert(0 <= index && index < this.m_count);
  return this.m_vertices[index];
};

b2DistanceProxy.prototype.m_vertices = null;
b2DistanceProxy.prototype.m_count = 0;
b2DistanceProxy.prototype.m_radius = null;

var b2ContactFactory = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactFactory.prototype.__constructor = function (allocator) {
  this.m_allocator = allocator;
  this.InitializeRegisters();
};

b2ContactFactory.prototype.__varz = function () {};

b2ContactFactory.prototype.AddType = function (createFcn, destroyFcn, type1, type2) {
  this.m_registers[type1][type2].createFcn = createFcn;
  this.m_registers[type1][type2].destroyFcn = destroyFcn;
  this.m_registers[type1][type2].primary = true;

  if (type1 != type2) {
    this.m_registers[type2][type1].createFcn = createFcn;
    this.m_registers[type2][type1].destroyFcn = destroyFcn;
    this.m_registers[type2][type1].primary = false;
  }
};

b2ContactFactory.prototype.InitializeRegisters = function () {
  this.m_registers = new Array(b2Shape.e_shapeTypeCount);

  for (var i = 0; i < b2Shape.e_shapeTypeCount; i++) {
    this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);

    for (var j = 0; j < b2Shape.e_shapeTypeCount; j++) {
      this.m_registers[i][j] = new b2ContactRegister();
    }
  }

  this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
  this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
  this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape);
};

b2ContactFactory.prototype.Create = function (fixtureA, fixtureB) {
  var type1 = fixtureA.GetType();
  var type2 = fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  var c;

  if (reg.pool) {
    c = reg.pool;
    reg.pool = c.m_next;
    reg.poolCount--;
    c.Reset(fixtureA, fixtureB);
    return c;
  }

  var createFcn = reg.createFcn;

  if (createFcn != null) {
    if (reg.primary) {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureA, fixtureB);
      return c;
    } else {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureB, fixtureA);
      return c;
    }
  } else {
    return null;
  }
};

b2ContactFactory.prototype.Destroy = function (contact) {
  if (contact.m_manifold.m_pointCount > 0) {
    contact.m_fixtureA.m_body.SetAwake(true);
    contact.m_fixtureB.m_body.SetAwake(true);
  }

  var type1 = contact.m_fixtureA.GetType();
  var type2 = contact.m_fixtureB.GetType();
  var reg = this.m_registers[type1][type2];

  if (true) {
    reg.poolCount++;
    contact.m_next = reg.pool;
    reg.pool = contact;
  }

  var destroyFcn = reg.destroyFcn;
  destroyFcn(contact, this.m_allocator);
};

b2ContactFactory.prototype.m_registers = null;
b2ContactFactory.prototype.m_allocator = null;

var b2ConstantAccelController = function () {
  b2Controller.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2ConstantAccelController.prototype, b2Controller.prototype);
b2ConstantAccelController.prototype._super = b2Controller.prototype;

b2ConstantAccelController.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2ConstantAccelController.prototype.__varz = function () {
  this.A = new b2Vec2(0, 0);
};

b2ConstantAccelController.prototype.Step = function (step) {
  var smallA = new b2Vec2(this.A.x * step.dt, this.A.y * step.dt);

  for (var i = m_bodyList; i; i = i.nextBody) {
    var body = i.body;

    if (!body.IsAwake()) {
      continue;
    }

    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + smallA.y));
  }
};

b2ConstantAccelController.prototype.A = new b2Vec2(0, 0);

var b2SeparationFunction = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2SeparationFunction.prototype.__constructor = function () {};

b2SeparationFunction.prototype.__varz = function () {
  this.m_localPoint = new b2Vec2();
  this.m_axis = new b2Vec2();
};

b2SeparationFunction.e_points = 1;
b2SeparationFunction.e_faceA = 2;
b2SeparationFunction.e_faceB = 4;

b2SeparationFunction.prototype.Initialize = function (cache, proxyA, transformA, proxyB, transformB) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  var count = cache.count;
  b2Settings.b2Assert(0 < count && count < 3);
  var localPointA;
  var localPointA1;
  var localPointA2;
  var localPointB;
  var localPointB1;
  var localPointB2;
  var pointAX;
  var pointAY;
  var pointBX;
  var pointBY;
  var normalX;
  var normalY;
  var tMat;
  var tVec;
  var s;
  var sgn;

  if (count == 1) {
    this.m_type = b2SeparationFunction.e_points;
    localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    tVec = localPointA;
    tMat = transformA.R;
    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = localPointB;
    tMat = transformB.R;
    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_axis.x = pointBX - pointAX;
    this.m_axis.y = pointBY - pointAY;
    this.m_axis.Normalize();
  } else {
    if (cache.indexB[0] == cache.indexB[1]) {
      this.m_type = b2SeparationFunction.e_faceA;
      localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
      localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
      localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
      this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
      this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
      this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
      this.m_axis.Normalize();
      tVec = this.m_axis;
      tMat = transformA.R;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tVec = this.m_localPoint;
      tMat = transformA.R;
      pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tVec = localPointB;
      tMat = transformB.R;
      pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;

      if (s < 0) {
        this.m_axis.NegativeSelf();
      }
    } else {
      if (cache.indexA[0] == cache.indexA[0]) {
        this.m_type = b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;

        if (s < 0) {
          this.m_axis.NegativeSelf();
        }
      } else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var pA = b2Math.MulX(transformA, localPointA);
        var dA = b2Math.MulMV(transformA.R, b2Math.SubtractVV(localPointA2, localPointA1));
        var pB = b2Math.MulX(transformB, localPointB);
        var dB = b2Math.MulMV(transformB.R, b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0;

        if (denom != 0) {
          s = b2Math.Clamp((b * f - c * e) / denom, 0, 1);
        }

        var t = (b * s + f) / e;

        if (t < 0) {
          t = 0;
          s = b2Math.Clamp((b - c) / a, 0, 1);
        }

        localPointA = new b2Vec2();
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = new b2Vec2();
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);

        if (s == 0 || s == 1) {
          this.m_type = b2SeparationFunction.e_faceB;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
          this.m_axis.Normalize();
          this.m_localPoint = localPointB;
          tVec = this.m_axis;
          tMat = transformB.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointA;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;

          if (s < 0) {
            this.m_axis.NegativeSelf();
          }
        } else {
          this.m_type = b2SeparationFunction.e_faceA;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
          this.m_localPoint = localPointA;
          tVec = this.m_axis;
          tMat = transformA.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointB;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;

          if (s < 0) {
            this.m_axis.NegativeSelf();
          }
        }
      }
    }
  }
};

b2SeparationFunction.prototype.Evaluate = function (transformA, transformB) {
  var axisA;
  var axisB;
  var localPointA;
  var localPointB;
  var pointA;
  var pointB;
  var seperation;
  var normal;

  switch (this.m_type) {
    case b2SeparationFunction.e_points:
      axisA = b2Math.MulTMV(transformA.R, this.m_axis);
      axisB = b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointA = b2Math.MulX(transformA, localPointA);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
      return seperation;

    case b2SeparationFunction.e_faceA:
      normal = b2Math.MulMV(transformA.R, this.m_axis);
      pointA = b2Math.MulX(transformA, this.m_localPoint);
      axisB = b2Math.MulTMV(transformB.R, normal.GetNegative());
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
      return seperation;

    case b2SeparationFunction.e_faceB:
      normal = b2Math.MulMV(transformB.R, this.m_axis);
      pointB = b2Math.MulX(transformB, this.m_localPoint);
      axisA = b2Math.MulTMV(transformA.R, normal.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      pointA = b2Math.MulX(transformA, localPointA);
      seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
      return seperation;

    default:
      b2Settings.b2Assert(false);
      return 0;
  }
};

b2SeparationFunction.prototype.m_proxyA = null;
b2SeparationFunction.prototype.m_proxyB = null;
b2SeparationFunction.prototype.m_type = 0;
b2SeparationFunction.prototype.m_localPoint = new b2Vec2();
b2SeparationFunction.prototype.m_axis = new b2Vec2();

var b2DynamicTreePair = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DynamicTreePair.prototype.__constructor = function () {};

b2DynamicTreePair.prototype.__varz = function () {};

b2DynamicTreePair.prototype.proxyA = null;
b2DynamicTreePair.prototype.proxyB = null;

var b2ContactConstraintPoint = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactConstraintPoint.prototype.__constructor = function () {};

b2ContactConstraintPoint.prototype.__varz = function () {
  this.localPoint = new b2Vec2();
  this.rA = new b2Vec2();
  this.rB = new b2Vec2();
};

b2ContactConstraintPoint.prototype.localPoint = new b2Vec2();
b2ContactConstraintPoint.prototype.rA = new b2Vec2();
b2ContactConstraintPoint.prototype.rB = new b2Vec2();
b2ContactConstraintPoint.prototype.normalImpulse = null;
b2ContactConstraintPoint.prototype.tangentImpulse = null;
b2ContactConstraintPoint.prototype.normalMass = null;
b2ContactConstraintPoint.prototype.tangentMass = null;
b2ContactConstraintPoint.prototype.equalizedMass = null;
b2ContactConstraintPoint.prototype.velocityBias = null;

var b2ControllerEdge = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ControllerEdge.prototype.__constructor = function () {};

b2ControllerEdge.prototype.__varz = function () {};

b2ControllerEdge.prototype.controller = null;
b2ControllerEdge.prototype.body = null;
b2ControllerEdge.prototype.prevBody = null;
b2ControllerEdge.prototype.nextBody = null;
b2ControllerEdge.prototype.prevController = null;
b2ControllerEdge.prototype.nextController = null;

var b2DistanceInput = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DistanceInput.prototype.__constructor = function () {};

b2DistanceInput.prototype.__varz = function () {};

b2DistanceInput.prototype.proxyA = null;
b2DistanceInput.prototype.proxyB = null;
b2DistanceInput.prototype.transformA = null;
b2DistanceInput.prototype.transformB = null;
b2DistanceInput.prototype.useRadii = null;

var b2Settings = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Settings.prototype.__constructor = function () {};

b2Settings.prototype.__varz = function () {};

b2Settings.b2MixFriction = function (friction1, friction2) {
  return Math.sqrt(friction1 * friction2);
};

b2Settings.b2MixRestitution = function (restitution1, restitution2) {
  return restitution1 > restitution2 ? restitution1 : restitution2;
};

b2Settings.b2Assert = function (a) {
  if (!a) {
    throw "Assertion Failed";
  }
};

b2Settings.VERSION = "2.1alpha";
b2Settings.USHRT_MAX = 65535;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_aabbExtension = 0.1;
b2Settings.b2_aabbMultiplier = 2;
b2Settings.b2_polygonRadius = 2 * b2Settings.b2_linearSlop;
b2Settings.b2_linearSlop = 0.0050;
b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
b2Settings.b2_toiSlop = 8 * b2Settings.b2_linearSlop;
b2Settings.b2_maxTOIContactsPerIsland = 32;
b2Settings.b2_maxTOIJointsPerIsland = 32;
b2Settings.b2_velocityThreshold = 1;
b2Settings.b2_maxLinearCorrection = 0.2;
b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
b2Settings.b2_maxTranslation = 2;
b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
b2Settings.b2_maxRotation = 0.5 * b2Settings.b2_pi;
b2Settings.b2_maxRotationSquared = b2Settings.b2_maxRotation * b2Settings.b2_maxRotation;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5;
b2Settings.b2_linearSleepTolerance = 0.01;
b2Settings.b2_angularSleepTolerance = 2 / 180 * b2Settings.b2_pi;

var b2Proxy = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Proxy.prototype.__constructor = function () {};

b2Proxy.prototype.__varz = function () {
  this.lowerBounds = new Array(2);
  this.upperBounds = new Array(2);
  this.pairs = new Object();
};

b2Proxy.prototype.IsValid = function () {
  return this.overlapCount != b2BroadPhase.b2_invalid;
};

b2Proxy.prototype.lowerBounds = new Array(2);
b2Proxy.prototype.upperBounds = new Array(2);
b2Proxy.prototype.overlapCount = 0;
b2Proxy.prototype.timeStamp = 0;
b2Proxy.prototype.pairs = new Object();
b2Proxy.prototype.next = null;
b2Proxy.prototype.userData = null;

var b2Point = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Point.prototype.__constructor = function () {};

b2Point.prototype.__varz = function () {
  this.p = new b2Vec2();
};

b2Point.prototype.Support = function (xf, vX, vY) {
  return this.p;
};

b2Point.prototype.GetFirstVertex = function (xf) {
  return this.p;
};

b2Point.prototype.p = new b2Vec2();

var b2WorldManifold = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2WorldManifold.prototype.__constructor = function () {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.m_points[i] = new b2Vec2();
  }
};

b2WorldManifold.prototype.__varz = function () {
  this.m_normal = new b2Vec2();
};

b2WorldManifold.prototype.Initialize = function (manifold, xfA, radiusA, xfB, radiusB) {
  if (manifold.m_pointCount == 0) {
    return;
  }

  var i = 0;
  var tVec;
  var tMat;
  var normalX;
  var normalY;
  var planePointX;
  var planePointY;
  var clipPointX;
  var clipPointY;

  switch (manifold.m_type) {
    case b2Manifold.e_circles:
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_points[0].m_localPoint;
      var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;

      if (d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d;
      } else {
        this.m_normal.x = 1;
        this.m_normal.y = 0;
      }

      var cAX = pointAX + radiusA * this.m_normal.x;
      var cAY = pointAY + radiusA * this.m_normal.y;
      var cBX = pointBX - radiusB * this.m_normal.x;
      var cBY = pointBY - radiusB * this.m_normal.y;
      this.m_points[0].x = 0.5 * (cAX + cBX);
      this.m_points[0].y = 0.5 * (cAY + cBY);
      break;

    case b2Manifold.e_faceA:
      tMat = xfA.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = normalX;
      this.m_normal.y = normalY;

      for (i = 0; i < manifold.m_pointCount; i++) {
        tMat = xfB.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY;
      }

      break;

    case b2Manifold.e_faceB:
      tMat = xfB.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_localPoint;
      planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = -normalX;
      this.m_normal.y = -normalY;

      for (i = 0; i < manifold.m_pointCount; i++) {
        tMat = xfA.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY;
      }

      break;
  }
};

b2WorldManifold.prototype.m_normal = new b2Vec2();
b2WorldManifold.prototype.m_points = null;

var b2RayCastOutput = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2RayCastOutput.prototype.__constructor = function () {};

b2RayCastOutput.prototype.__varz = function () {
  this.normal = new b2Vec2();
};

b2RayCastOutput.prototype.normal = new b2Vec2();
b2RayCastOutput.prototype.fraction = null;

var b2ConstantForceController = function () {
  b2Controller.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2ConstantForceController.prototype, b2Controller.prototype);
b2ConstantForceController.prototype._super = b2Controller.prototype;

b2ConstantForceController.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2ConstantForceController.prototype.__varz = function () {
  this.F = new b2Vec2(0, 0);
};

b2ConstantForceController.prototype.Step = function (step) {
  for (var i = m_bodyList; i; i = i.nextBody) {
    var body = i.body;

    if (!body.IsAwake()) {
      continue;
    }

    body.ApplyForce(this.F, body.GetWorldCenter());
  }
};

b2ConstantForceController.prototype.F = new b2Vec2(0, 0);

var b2MassData = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2MassData.prototype.__constructor = function () {};

b2MassData.prototype.__varz = function () {
  this.center = new b2Vec2(0, 0);
};

b2MassData.prototype.mass = 0;
b2MassData.prototype.center = new b2Vec2(0, 0);
b2MassData.prototype.I = 0;

var b2DynamicTree = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DynamicTree.prototype.__constructor = function () {
  this.m_root = null;
  this.m_freeList = null;
  this.m_path = 0;
  this.m_insertionCount = 0;
};

b2DynamicTree.prototype.__varz = function () {};

b2DynamicTree.prototype.AllocateNode = function () {
  if (this.m_freeList) {
    var node = this.m_freeList;
    this.m_freeList = node.parent;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    return node;
  }

  return new b2DynamicTreeNode();
};

b2DynamicTree.prototype.FreeNode = function (node) {
  node.parent = this.m_freeList;
  this.m_freeList = node;
};

b2DynamicTree.prototype.InsertLeaf = function (leaf) {
  ++this.m_insertionCount;

  if (this.m_root == null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return;
  }

  var center = leaf.aabb.GetCenter();
  var sibling = this.m_root;

  if (sibling.IsLeaf() == false) {
    do {
      var child1 = sibling.child1;
      var child2 = sibling.child2;
      var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
      var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);

      if (norm1 < norm2) {
        sibling = child1;
      } else {
        sibling = child2;
      }
    } while (sibling.IsLeaf() == false);
  }

  var node1 = sibling.parent;
  var node2 = this.AllocateNode();
  node2.parent = node1;
  node2.userData = null;
  node2.aabb.Combine(leaf.aabb, sibling.aabb);

  if (node1) {
    if (sibling.parent.child1 == sibling) {
      node1.child1 = node2;
    } else {
      node1.child2 = node2;
    }

    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;

    do {
      if (node1.aabb.Contains(node2.aabb)) {
        break;
      }

      node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
      node2 = node1;
      node1 = node1.parent;
    } while (node1);
  } else {
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    this.m_root = node2;
  }
};

b2DynamicTree.prototype.RemoveLeaf = function (leaf) {
  if (leaf == this.m_root) {
    this.m_root = null;
    return;
  }

  var node2 = leaf.parent;
  var node1 = node2.parent;
  var sibling;

  if (node2.child1 == leaf) {
    sibling = node2.child2;
  } else {
    sibling = node2.child1;
  }

  if (node1) {
    if (node1.child1 == node2) {
      node1.child1 = sibling;
    } else {
      node1.child2 = sibling;
    }

    sibling.parent = node1;
    this.FreeNode(node2);

    while (node1) {
      var oldAABB = node1.aabb;
      node1.aabb = b2AABB.Combine(node1.child1.aabb, node1.child2.aabb);

      if (oldAABB.Contains(node1.aabb)) {
        break;
      }

      node1 = node1.parent;
    }
  } else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(node2);
  }
};

b2DynamicTree.prototype.CreateProxy = function (aabb, userData) {
  var node = this.AllocateNode();
  var extendX = b2Settings.b2_aabbExtension;
  var extendY = b2Settings.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  node.aabb.upperBound.x = aabb.upperBound.x + extendX;
  node.aabb.upperBound.y = aabb.upperBound.y + extendY;
  node.userData = userData;
  this.InsertLeaf(node);
  return node;
};

b2DynamicTree.prototype.DestroyProxy = function (proxy) {
  this.RemoveLeaf(proxy);
  this.FreeNode(proxy);
};

b2DynamicTree.prototype.MoveProxy = function (proxy, aabb, displacement) {
  b2Settings.b2Assert(proxy.IsLeaf());

  if (proxy.aabb.Contains(aabb)) {
    return false;
  }

  this.RemoveLeaf(proxy);
  var extendX = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : -displacement.x);
  var extendY = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : -displacement.y);
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
  proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
  this.InsertLeaf(proxy);
  return true;
};

b2DynamicTree.prototype.Rebalance = function (iterations) {
  if (this.m_root == null) {
    return;
  }

  for (var i = 0; i < iterations; i++) {
    var node = this.m_root;
    var bit = 0;

    while (node.IsLeaf() == false) {
      node = this.m_path >> bit & 1 ? node.child2 : node.child1;
      bit = bit + 1 & 31;
    }

    ++this.m_path;
    this.RemoveLeaf(node);
    this.InsertLeaf(node);
  }
};

b2DynamicTree.prototype.GetFatAABB = function (proxy) {
  return proxy.aabb;
};

b2DynamicTree.prototype.GetUserData = function (proxy) {
  return proxy.userData;
};

b2DynamicTree.prototype.Query = function (callback, aabb) {
  if (this.m_root == null) {
    return;
  }

  var stack = new Array();
  var count = 0;
  stack[count++] = this.m_root;

  while (count > 0) {
    var node = stack[--count];

    if (node.aabb.TestOverlap(aabb)) {
      if (node.IsLeaf()) {
        var proceed = callback(node);

        if (!proceed) {
          return;
        }
      } else {
        stack[count++] = node.child1;
        stack[count++] = node.child2;
      }
    }
  }
};

b2DynamicTree.prototype.RayCast = function (callback, input) {
  if (this.m_root == null) {
    return;
  }

  var p1 = input.p1;
  var p2 = input.p2;
  var r = b2Math.SubtractVV(p1, p2);
  r.Normalize();
  var v = b2Math.CrossFV(1, r);
  var abs_v = b2Math.AbsV(v);
  var maxFraction = input.maxFraction;
  var segmentAABB = new b2AABB();
  var tX;
  var tY;
  tX = p1.x + maxFraction * (p2.x - p1.x);
  tY = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = Math.min(p1.x, tX);
  segmentAABB.lowerBound.y = Math.min(p1.y, tY);
  segmentAABB.upperBound.x = Math.max(p1.x, tX);
  segmentAABB.upperBound.y = Math.max(p1.y, tY);
  var stack = new Array();
  var count = 0;
  stack[count++] = this.m_root;

  while (count > 0) {
    var node = stack[--count];

    if (node.aabb.TestOverlap(segmentAABB) == false) {
      continue;
    }

    var c = node.aabb.GetCenter();
    var h = node.aabb.GetExtents();
    var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;

    if (separation > 0) {
      continue;
    }

    if (node.IsLeaf()) {
      var subInput = new b2RayCastInput();
      subInput.p1 = input.p1;
      subInput.p2 = input.p2;
      subInput.maxFraction = input.maxFraction;
      maxFraction = callback(subInput, node);

      if (maxFraction == 0) {
        return;
      }

      tX = p1.x + maxFraction * (p2.x - p1.x);
      tY = p1.y + maxFraction * (p2.y - p1.y);
      segmentAABB.lowerBound.x = Math.min(p1.x, tX);
      segmentAABB.lowerBound.y = Math.min(p1.y, tY);
      segmentAABB.upperBound.x = Math.max(p1.x, tX);
      segmentAABB.upperBound.y = Math.max(p1.y, tY);
    } else {
      stack[count++] = node.child1;
      stack[count++] = node.child2;
    }
  }
};

b2DynamicTree.prototype.m_root = null;
b2DynamicTree.prototype.m_freeList = null;
b2DynamicTree.prototype.m_path = 0;
b2DynamicTree.prototype.m_insertionCount = 0;

var b2JointEdge = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2JointEdge.prototype.__constructor = function () {};

b2JointEdge.prototype.__varz = function () {};

b2JointEdge.prototype.other = null;
b2JointEdge.prototype.joint = null;
b2JointEdge.prototype.prev = null;
b2JointEdge.prototype.next = null;

var b2RayCastInput = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2RayCastInput.prototype.__constructor = function (p1, p2, maxFraction) {
  if (p1) {
    this.p1.SetV(p1);
  }

  if (p2) {
    this.p2.SetV(p2);
  }

  if (maxFraction) {
    this.maxFraction = maxFraction;
  }
};

b2RayCastInput.prototype.__varz = function () {
  this.p1 = new b2Vec2();
  this.p2 = new b2Vec2();
};

b2RayCastInput.prototype.p1 = new b2Vec2();
b2RayCastInput.prototype.p2 = new b2Vec2();
b2RayCastInput.prototype.maxFraction = null;

var Features = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

Features.prototype.__constructor = function () {};

Features.prototype.__varz = function () {};

Features.prototype.__defineGetter__("referenceEdge", function () {
  return this._referenceEdge;
});

Features.prototype.__defineSetter__("referenceEdge", function (value) {
  this._referenceEdge = value;
  this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255;
});

Features.prototype.__defineGetter__("incidentEdge", function () {
  return this._incidentEdge;
});

Features.prototype.__defineSetter__("incidentEdge", function (value) {
  this._incidentEdge = value;
  this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280;
});

Features.prototype.__defineGetter__("incidentVertex", function () {
  return this._incidentVertex;
});

Features.prototype.__defineSetter__("incidentVertex", function (value) {
  this._incidentVertex = value;
  this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680;
});

Features.prototype.__defineGetter__("flip", function () {
  return this._flip;
});

Features.prototype.__defineSetter__("flip", function (value) {
  this._flip = value;
  this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080;
});

Features.prototype._referenceEdge = 0;
Features.prototype._incidentEdge = 0;
Features.prototype._incidentVertex = 0;
Features.prototype._flip = 0;
Features.prototype._m_id = null;

var b2FilterData = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2FilterData.prototype.__constructor = function () {};

b2FilterData.prototype.__varz = function () {
  this.categoryBits = 1;
  this.maskBits = 65535;
};

b2FilterData.prototype.Copy = function () {
  var copy = new b2FilterData();
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy;
};

b2FilterData.prototype.categoryBits = 1;
b2FilterData.prototype.maskBits = 65535;
b2FilterData.prototype.groupIndex = 0;

var b2AABB = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2AABB.prototype.__constructor = function () {};

b2AABB.prototype.__varz = function () {
  this.lowerBound = new b2Vec2();
  this.upperBound = new b2Vec2();
};

b2AABB.Combine = function (aabb1, aabb2) {
  var aabb = new b2AABB();
  aabb.Combine(aabb1, aabb2);
  return aabb;
};

b2AABB.prototype.IsValid = function () {
  var dX = this.upperBound.x - this.lowerBound.x;
  var dY = this.upperBound.y - this.lowerBound.y;
  var valid = dX >= 0 && dY >= 0;
  valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
  return valid;
};

b2AABB.prototype.GetCenter = function () {
  return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2);
};

b2AABB.prototype.GetExtents = function () {
  return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2);
};

b2AABB.prototype.Contains = function (aabb) {
  var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
  return result;
};

b2AABB.prototype.RayCast = function (output, input) {
  var tmin = -Number.MAX_VALUE;
  var tmax = Number.MAX_VALUE;
  var pX = input.p1.x;
  var pY = input.p1.y;
  var dX = input.p2.x - input.p1.x;
  var dY = input.p2.y - input.p1.y;
  var absDX = Math.abs(dX);
  var absDY = Math.abs(dY);
  var normal = output.normal;
  var inv_d;
  var t1;
  var t2;
  var t3;
  var s;

  if (absDX < Number.MIN_VALUE) {
    if (pX < this.lowerBound.x || this.upperBound.x < pX) {
      return false;
    }
  } else {
    inv_d = 1 / dX;
    t1 = (this.lowerBound.x - pX) * inv_d;
    t2 = (this.upperBound.x - pX) * inv_d;
    s = -1;

    if (t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1;
    }

    if (t1 > tmin) {
      normal.x = s;
      normal.y = 0;
      tmin = t1;
    }

    tmax = Math.min(tmax, t2);

    if (tmin > tmax) {
      return false;
    }
  }

  if (absDY < Number.MIN_VALUE) {
    if (pY < this.lowerBound.y || this.upperBound.y < pY) {
      return false;
    }
  } else {
    inv_d = 1 / dY;
    t1 = (this.lowerBound.y - pY) * inv_d;
    t2 = (this.upperBound.y - pY) * inv_d;
    s = -1;

    if (t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1;
    }

    if (t1 > tmin) {
      normal.y = s;
      normal.x = 0;
      tmin = t1;
    }

    tmax = Math.min(tmax, t2);

    if (tmin > tmax) {
      return false;
    }
  }

  output.fraction = tmin;
  return true;
};

b2AABB.prototype.TestOverlap = function (other) {
  var d1X = other.lowerBound.x - this.upperBound.x;
  var d1Y = other.lowerBound.y - this.upperBound.y;
  var d2X = this.lowerBound.x - other.upperBound.x;
  var d2Y = this.lowerBound.y - other.upperBound.y;

  if (d1X > 0 || d1Y > 0) {
    return false;
  }

  if (d2X > 0 || d2Y > 0) {
    return false;
  }

  return true;
};

b2AABB.prototype.Combine = function (aabb1, aabb2) {
  this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
  this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
  this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
  this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
};

b2AABB.prototype.lowerBound = new b2Vec2();
b2AABB.prototype.upperBound = new b2Vec2();

var b2Jacobian = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Jacobian.prototype.__constructor = function () {};

b2Jacobian.prototype.__varz = function () {
  this.linearA = new b2Vec2();
  this.linearB = new b2Vec2();
};

b2Jacobian.prototype.SetZero = function () {
  this.linearA.SetZero();
  this.angularA = 0;
  this.linearB.SetZero();
  this.angularB = 0;
};

b2Jacobian.prototype.Set = function (x1, a1, x2, a2) {
  this.linearA.SetV(x1);
  this.angularA = a1;
  this.linearB.SetV(x2);
  this.angularB = a2;
};

b2Jacobian.prototype.Compute = function (x1, a1, x2, a2) {
  return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2;
};

b2Jacobian.prototype.linearA = new b2Vec2();
b2Jacobian.prototype.angularA = null;
b2Jacobian.prototype.linearB = new b2Vec2();
b2Jacobian.prototype.angularB = null;

var b2Bound = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Bound.prototype.__constructor = function () {};

b2Bound.prototype.__varz = function () {};

b2Bound.prototype.IsLower = function () {
  return (this.value & 1) == 0;
};

b2Bound.prototype.IsUpper = function () {
  return (this.value & 1) == 1;
};

b2Bound.prototype.Swap = function (b) {
  var tempValue = this.value;
  var tempProxy = this.proxy;
  var tempStabbingCount = this.stabbingCount;
  this.value = b.value;
  this.proxy = b.proxy;
  this.stabbingCount = b.stabbingCount;
  b.value = tempValue;
  b.proxy = tempProxy;
  b.stabbingCount = tempStabbingCount;
};

b2Bound.prototype.value = 0;
b2Bound.prototype.proxy = null;
b2Bound.prototype.stabbingCount = 0;

var b2SimplexVertex = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2SimplexVertex.prototype.__constructor = function () {};

b2SimplexVertex.prototype.__varz = function () {};

b2SimplexVertex.prototype.Set = function (other) {
  this.wA.SetV(other.wA);
  this.wB.SetV(other.wB);
  this.w.SetV(other.w);
  this.a = other.a;
  this.indexA = other.indexA;
  this.indexB = other.indexB;
};

b2SimplexVertex.prototype.wA = null;
b2SimplexVertex.prototype.wB = null;
b2SimplexVertex.prototype.w = null;
b2SimplexVertex.prototype.a = null;
b2SimplexVertex.prototype.indexA = 0;
b2SimplexVertex.prototype.indexB = 0;

var b2Mat22 = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Mat22.prototype.__constructor = function () {
  this.col1.x = this.col2.y = 1;
};

b2Mat22.prototype.__varz = function () {
  this.col1 = new b2Vec2();
  this.col2 = new b2Vec2();
};

b2Mat22.FromAngle = function (angle) {
  var mat = new b2Mat22();
  mat.Set(angle);
  return mat;
};

b2Mat22.FromVV = function (c1, c2) {
  var mat = new b2Mat22();
  mat.SetVV(c1, c2);
  return mat;
};

b2Mat22.prototype.Set = function (angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c;
};

b2Mat22.prototype.SetVV = function (c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
};

b2Mat22.prototype.Copy = function () {
  var mat = new b2Mat22();
  mat.SetM(this);
  return mat;
};

b2Mat22.prototype.SetM = function (m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
};

b2Mat22.prototype.AddM = function (m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
};

b2Mat22.prototype.SetIdentity = function () {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
};

b2Mat22.prototype.SetZero = function () {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
};

b2Mat22.prototype.GetAngle = function () {
  return Math.atan2(this.col1.y, this.col1.x);
};

b2Mat22.prototype.GetInverse = function (out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  var det = a * d - b * c;

  if (det != 0) {
    det = 1 / det;
  }

  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out;
};

b2Mat22.prototype.Solve = function (out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;

  if (det != 0) {
    det = 1 / det;
  }

  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out;
};

b2Mat22.prototype.Abs = function () {
  this.col1.Abs();
  this.col2.Abs();
};

b2Mat22.prototype.col1 = new b2Vec2();
b2Mat22.prototype.col2 = new b2Vec2();

var b2SimplexCache = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2SimplexCache.prototype.__constructor = function () {};

b2SimplexCache.prototype.__varz = function () {
  this.indexA = new Array(3);
  this.indexB = new Array(3);
};

b2SimplexCache.prototype.metric = null;
b2SimplexCache.prototype.count = 0;
b2SimplexCache.prototype.indexA = new Array(3);
b2SimplexCache.prototype.indexB = new Array(3);

var b2Shape = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Shape.prototype.__constructor = function () {
  this.m_type = b2Shape.e_unknownShape;
  this.m_radius = b2Settings.b2_linearSlop;
};

b2Shape.prototype.__varz = function () {};

b2Shape.TestOverlap = function (shape1, transform1, shape2, transform2) {
  var input = new b2DistanceInput();
  input.proxyA = new b2DistanceProxy();
  input.proxyA.Set(shape1);
  input.proxyB = new b2DistanceProxy();
  input.proxyB.Set(shape2);
  input.transformA = transform1;
  input.transformB = transform2;
  input.useRadii = true;
  var simplexCache = new b2SimplexCache();
  simplexCache.count = 0;
  var output = new b2DistanceOutput();
  b2Distance.Distance(output, simplexCache, input);
  return output.distance < 10 * Number.MIN_VALUE;
};

b2Shape.e_hitCollide = 1;
b2Shape.e_missCollide = 0;
b2Shape.e_startsInsideCollide = -1;
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_polygonShape = 1;
b2Shape.e_edgeShape = 2;
b2Shape.e_shapeTypeCount = 3;

b2Shape.prototype.Copy = function () {
  return null;
};

b2Shape.prototype.Set = function (other) {
  this.m_radius = other.m_radius;
};

b2Shape.prototype.GetType = function () {
  return this.m_type;
};

b2Shape.prototype.TestPoint = function (xf, p) {
  return false;
};

b2Shape.prototype.RayCast = function (output, input, transform) {
  return false;
};

b2Shape.prototype.ComputeAABB = function (aabb, xf) {};

b2Shape.prototype.ComputeMass = function (massData, density) {};

b2Shape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
  return 0;
};

b2Shape.prototype.m_type = 0;
b2Shape.prototype.m_radius = null;

var b2Segment = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Segment.prototype.__constructor = function () {};

b2Segment.prototype.__varz = function () {
  this.p1 = new b2Vec2();
  this.p2 = new b2Vec2();
};

b2Segment.prototype.TestSegment = function (lambda, normal, segment, maxLambda) {
  var s = segment.p1;
  var rX = segment.p2.x - s.x;
  var rY = segment.p2.y - s.y;
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var nX = dY;
  var nY = -dX;
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);

  if (denom > k_slop) {
    var bX = s.x - this.p1.x;
    var bY = s.y - this.p1.y;
    var a = bX * nX + bY * nY;

    if (0 <= a && a <= maxLambda * denom) {
      var mu2 = -rX * bY + rY * bX;

      if (-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        nX /= nLen;
        nY /= nLen;
        lambda[0] = a;
        normal.Set(nX, nY);
        return true;
      }
    }
  }

  return false;
};

b2Segment.prototype.Extend = function (aabb) {
  this.ExtendForward(aabb);
  this.ExtendBackward(aabb);
};

b2Segment.prototype.ExtendForward = function (aabb) {
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
  this.p2.x = this.p1.x + dX * lambda;
  this.p2.y = this.p1.y + dY * lambda;
};

b2Segment.prototype.ExtendBackward = function (aabb) {
  var dX = -this.p2.x + this.p1.x;
  var dY = -this.p2.y + this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
  this.p1.x = this.p2.x + dX * lambda;
  this.p1.y = this.p2.y + dY * lambda;
};

b2Segment.prototype.p1 = new b2Vec2();
b2Segment.prototype.p2 = new b2Vec2();

var b2ContactRegister = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactRegister.prototype.__constructor = function () {};

b2ContactRegister.prototype.__varz = function () {};

b2ContactRegister.prototype.createFcn = null;
b2ContactRegister.prototype.destroyFcn = null;
b2ContactRegister.prototype.primary = null;
b2ContactRegister.prototype.pool = null;
b2ContactRegister.prototype.poolCount = 0;

var b2DebugDraw = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DebugDraw.prototype.__constructor = function () {
  this.m_drawFlags = 0;
};

b2DebugDraw.prototype.__varz = function () {};

b2DebugDraw.e_shapeBit = 1;
b2DebugDraw.e_jointBit = 2;
b2DebugDraw.e_aabbBit = 4;
b2DebugDraw.e_pairBit = 8;
b2DebugDraw.e_centerOfMassBit = 16;
b2DebugDraw.e_controllerBit = 32;

b2DebugDraw.prototype.SetFlags = function (flags) {
  this.m_drawFlags = flags;
};

b2DebugDraw.prototype.GetFlags = function () {
  return this.m_drawFlags;
};

b2DebugDraw.prototype.AppendFlags = function (flags) {
  this.m_drawFlags |= flags;
};

b2DebugDraw.prototype.ClearFlags = function (flags) {
  this.m_drawFlags &= ~flags;
};

b2DebugDraw.prototype.SetSprite = function (sprite) {
  this.m_sprite = sprite;
};

b2DebugDraw.prototype.GetSprite = function () {
  return this.m_sprite;
};

b2DebugDraw.prototype.SetDrawScale = function (drawScale) {
  this.m_drawScale = drawScale;
};

b2DebugDraw.prototype.GetDrawScale = function () {
  return this.m_drawScale;
};

b2DebugDraw.prototype.SetLineThickness = function (lineThickness) {
  this.m_lineThickness = lineThickness;
};

b2DebugDraw.prototype.GetLineThickness = function () {
  return this.m_lineThickness;
};

b2DebugDraw.prototype.SetAlpha = function (alpha) {
  this.m_alpha = alpha;
};

b2DebugDraw.prototype.GetAlpha = function () {
  return this.m_alpha;
};

b2DebugDraw.prototype.SetFillAlpha = function (alpha) {
  this.m_fillAlpha = alpha;
};

b2DebugDraw.prototype.GetFillAlpha = function () {
  return this.m_fillAlpha;
};

b2DebugDraw.prototype.SetXFormScale = function (xformScale) {
  this.m_xformScale = xformScale;
};

b2DebugDraw.prototype.GetXFormScale = function () {
  return this.m_xformScale;
};

b2DebugDraw.prototype.Clear = function () {
  this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height);
};

b2DebugDraw.prototype.Y = function (y) {
  return this.m_sprite.canvas.height - y;
};

b2DebugDraw.prototype.ToWorldPoint = function (localPoint) {
  return new b2Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale);
};

b2DebugDraw.prototype.ColorStyle = function (color, alpha) {
  return "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")";
};

b2DebugDraw.prototype.DrawPolygon = function (vertices, vertexCount, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);

  for (var i = 1; i < vertexCount; i++) {
    this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale);
  }

  this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
};

b2DebugDraw.prototype.DrawSolidPolygon = function (vertices, vertexCount, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));

  for (var i = 1; i < vertexCount; i++) {
    this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale));
  }

  this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath();
};

b2DebugDraw.prototype.DrawCircle = function (center, radius, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale);
};

b2DebugDraw.prototype.DrawSolidCircle = function (center, radius, axis, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, Math.PI * 2, true);
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath();
};

b2DebugDraw.prototype.DrawSegment = function (p1, p2, color) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
  this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
};

b2DebugDraw.prototype.DrawTransform = function (xf) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(255, 0, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(0, 255, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
};

b2DebugDraw.prototype.m_drawFlags = 0;
b2DebugDraw.prototype.m_sprite = null;
b2DebugDraw.prototype.m_drawScale = 1;
b2DebugDraw.prototype.m_lineThickness = 1;
b2DebugDraw.prototype.m_alpha = 1;
b2DebugDraw.prototype.m_fillAlpha = 1;
b2DebugDraw.prototype.m_xformScale = 1;

var b2Sweep = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Sweep.prototype.__constructor = function () {};

b2Sweep.prototype.__varz = function () {
  this.localCenter = new b2Vec2();
  this.c0 = new b2Vec2();
  this.c = new b2Vec2();
};

b2Sweep.prototype.Set = function (other) {
  this.localCenter.SetV(other.localCenter);
  this.c0.SetV(other.c0);
  this.c.SetV(other.c);
  this.a0 = other.a0;
  this.a = other.a;
  this.t0 = other.t0;
};

b2Sweep.prototype.Copy = function () {
  var copy = new b2Sweep();
  copy.localCenter.SetV(this.localCenter);
  copy.c0.SetV(this.c0);
  copy.c.SetV(this.c);
  copy.a0 = this.a0;
  copy.a = this.a;
  copy.t0 = this.t0;
  return copy;
};

b2Sweep.prototype.GetTransform = function (xf, alpha) {
  xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
  xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
  var angle = (1 - alpha) * this.a0 + alpha * this.a;
  xf.R.Set(angle);
  var tMat = xf.R;
  xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
  xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y;
};

b2Sweep.prototype.Advance = function (t) {
  if (this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
    var alpha = (t - this.t0) / (1 - this.t0);
    this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
    this.t0 = t;
  }
};

b2Sweep.prototype.localCenter = new b2Vec2();
b2Sweep.prototype.c0 = new b2Vec2();
b2Sweep.prototype.c = new b2Vec2();
b2Sweep.prototype.a0 = null;
b2Sweep.prototype.a = null;
b2Sweep.prototype.t0 = null;

var b2DistanceOutput = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DistanceOutput.prototype.__constructor = function () {};

b2DistanceOutput.prototype.__varz = function () {
  this.pointA = new b2Vec2();
  this.pointB = new b2Vec2();
};

b2DistanceOutput.prototype.pointA = new b2Vec2();
b2DistanceOutput.prototype.pointB = new b2Vec2();
b2DistanceOutput.prototype.distance = null;
b2DistanceOutput.prototype.iterations = 0;

var b2Mat33 = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Mat33.prototype.__constructor = function (c1, c2, c3) {
  if (!c1 && !c2 && !c3) {
    this.col1.SetZero();
    this.col2.SetZero();
    this.col3.SetZero();
  } else {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3);
  }
};

b2Mat33.prototype.__varz = function () {
  this.col1 = new b2Vec3();
  this.col2 = new b2Vec3();
  this.col3 = new b2Vec3();
};

b2Mat33.prototype.SetVVV = function (c1, c2, c3) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
  this.col3.SetV(c3);
};

b2Mat33.prototype.Copy = function () {
  return new b2Mat33(this.col1, this.col2, this.col3);
};

b2Mat33.prototype.SetM = function (m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
  this.col3.SetV(m.col3);
};

b2Mat33.prototype.AddM = function (m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col1.z += m.col1.z;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
  this.col2.z += m.col2.z;
  this.col3.x += m.col3.x;
  this.col3.y += m.col3.y;
  this.col3.z += m.col3.z;
};

b2Mat33.prototype.SetIdentity = function () {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 1;
};

b2Mat33.prototype.SetZero = function () {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 0;
};

b2Mat33.prototype.Solve22 = function (out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;

  if (det != 0) {
    det = 1 / det;
  }

  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out;
};

b2Mat33.prototype.Solve33 = function (out, bX, bY, bZ) {
  var a11 = this.col1.x;
  var a21 = this.col1.y;
  var a31 = this.col1.z;
  var a12 = this.col2.x;
  var a22 = this.col2.y;
  var a32 = this.col2.z;
  var a13 = this.col3.x;
  var a23 = this.col3.y;
  var a33 = this.col3.z;
  var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);

  if (det != 0) {
    det = 1 / det;
  }

  out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
  out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
  out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
  return out;
};

b2Mat33.prototype.col1 = new b2Vec3();
b2Mat33.prototype.col2 = new b2Vec3();
b2Mat33.prototype.col3 = new b2Vec3();

var b2PositionSolverManifold = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2PositionSolverManifold.prototype.__constructor = function () {
  this.m_normal = new b2Vec2();
  this.m_separations = new Array(b2Settings.b2_maxManifoldPoints);
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.m_points[i] = new b2Vec2();
  }
};

b2PositionSolverManifold.prototype.__varz = function () {};

b2PositionSolverManifold.circlePointA = new b2Vec2();
b2PositionSolverManifold.circlePointB = new b2Vec2();

b2PositionSolverManifold.prototype.Initialize = function (cc) {
  b2Settings.b2Assert(cc.pointCount > 0);
  var i = 0;
  var clipPointX;
  var clipPointY;
  var tMat;
  var tVec;
  var planePointX;
  var planePointY;

  switch (cc.type) {
    case b2Manifold.e_circles:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.points[0].localPoint;
      var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;

      if (d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d;
      } else {
        this.m_normal.x = 1;
        this.m_normal.y = 0;
      }

      this.m_points[0].x = 0.5 * (pointAX + pointBX);
      this.m_points[0].y = 0.5 * (pointAY + pointBY);
      this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
      break;

    case b2Manifold.e_faceA:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;

      for (i = 0; i < cc.pointCount; ++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY;
      }

      break;

    case b2Manifold.e_faceB:
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyA.m_xf.R;

      for (i = 0; i < cc.pointCount; ++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY);
      }

      this.m_normal.x *= -1;
      this.m_normal.y *= -1;
      break;
  }
};

b2PositionSolverManifold.prototype.m_normal = null;
b2PositionSolverManifold.prototype.m_points = null;
b2PositionSolverManifold.prototype.m_separations = null;

var b2OBB = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2OBB.prototype.__constructor = function () {};

b2OBB.prototype.__varz = function () {
  this.R = new b2Mat22();
  this.center = new b2Vec2();
  this.extents = new b2Vec2();
};

b2OBB.prototype.R = new b2Mat22();
b2OBB.prototype.center = new b2Vec2();
b2OBB.prototype.extents = new b2Vec2();

var b2Pair = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Pair.prototype.__constructor = function () {};

b2Pair.prototype.__varz = function () {};

b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.e_pairBuffered = 1;
b2Pair.e_pairRemoved = 2;
b2Pair.e_pairFinal = 4;

b2Pair.prototype.SetBuffered = function () {
  this.status |= b2Pair.e_pairBuffered;
};

b2Pair.prototype.ClearBuffered = function () {
  this.status &= ~b2Pair.e_pairBuffered;
};

b2Pair.prototype.IsBuffered = function () {
  return (this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered;
};

b2Pair.prototype.SetRemoved = function () {
  this.status |= b2Pair.e_pairRemoved;
};

b2Pair.prototype.ClearRemoved = function () {
  this.status &= ~b2Pair.e_pairRemoved;
};

b2Pair.prototype.IsRemoved = function () {
  return (this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved;
};

b2Pair.prototype.SetFinal = function () {
  this.status |= b2Pair.e_pairFinal;
};

b2Pair.prototype.IsFinal = function () {
  return (this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal;
};

b2Pair.prototype.userData = null;
b2Pair.prototype.proxy1 = null;
b2Pair.prototype.proxy2 = null;
b2Pair.prototype.next = null;
b2Pair.prototype.status = 0;

var b2FixtureDef = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2FixtureDef.prototype.__constructor = function () {
  this.shape = null;
  this.userData = null;
  this.friction = 0.2;
  this.restitution = 0;
  this.density = 0;
  this.filter.categoryBits = 1;
  this.filter.maskBits = 65535;
  this.filter.groupIndex = 0;
  this.isSensor = false;
};

b2FixtureDef.prototype.__varz = function () {
  this.filter = new b2FilterData();
};

b2FixtureDef.prototype.shape = null;
b2FixtureDef.prototype.userData = null;
b2FixtureDef.prototype.friction = null;
b2FixtureDef.prototype.restitution = null;
b2FixtureDef.prototype.density = null;
b2FixtureDef.prototype.isSensor = null;
b2FixtureDef.prototype.filter = new b2FilterData();

var b2ContactID = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactID.prototype.__constructor = function () {
  this.features._m_id = this;
};

b2ContactID.prototype.__varz = function () {
  this.features = new Features();
};

b2ContactID.prototype.Set = function (id) {
  key = id._key;
};

b2ContactID.prototype.Copy = function () {
  var id = new b2ContactID();
  id.key = key;
  return id;
};

b2ContactID.prototype.__defineSetter__("key", function () {
  return this._key;
});

b2ContactID.prototype.__defineSetter__("key", function (value) {
  this._key = value;
  this.features._referenceEdge = this._key & 255;
  this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
  this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
  this.features._flip = (this._key & 4278190080) >> 24 & 255;
});

b2ContactID.prototype._key = 0;
b2ContactID.prototype.features = new Features();

var b2Transform = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Transform.prototype.__constructor = function (pos, r) {
  if (pos) {
    this.position.SetV(pos);
    this.R.SetM(r);
  }
};

b2Transform.prototype.__varz = function () {
  this.position = new b2Vec2();
  this.R = new b2Mat22();
};

b2Transform.prototype.Initialize = function (pos, r) {
  this.position.SetV(pos);
  this.R.SetM(r);
};

b2Transform.prototype.SetIdentity = function () {
  this.position.SetZero();
  this.R.SetIdentity();
};

b2Transform.prototype.Set = function (x) {
  this.position.SetV(x.position);
  this.R.SetM(x.R);
};

b2Transform.prototype.GetAngle = function () {
  return Math.atan2(this.R.col1.y, this.R.col1.x);
};

b2Transform.prototype.position = new b2Vec2();
b2Transform.prototype.R = new b2Mat22();

var b2EdgeShape = function () {
  b2Shape.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2EdgeShape.prototype, b2Shape.prototype);
b2EdgeShape.prototype._super = b2Shape.prototype;

b2EdgeShape.prototype.__constructor = function (v1, v2) {
  this._super.__constructor.apply(this, []);

  this.m_type = b2Shape.e_edgeShape;
  this.m_prevEdge = null;
  this.m_nextEdge = null;
  this.m_v1 = v1;
  this.m_v2 = v2;
  this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
  this.m_length = this.m_direction.Normalize();
  this.m_normal.Set(this.m_direction.y, -this.m_direction.x);
  this.m_coreV1.Set(-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
  this.m_coreV2.Set(-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
  this.m_cornerDir1 = this.m_normal;
  this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y);
};

b2EdgeShape.prototype.__varz = function () {
  this.s_supportVec = new b2Vec2();
  this.m_v1 = new b2Vec2();
  this.m_v2 = new b2Vec2();
  this.m_coreV1 = new b2Vec2();
  this.m_coreV2 = new b2Vec2();
  this.m_normal = new b2Vec2();
  this.m_direction = new b2Vec2();
  this.m_cornerDir1 = new b2Vec2();
  this.m_cornerDir2 = new b2Vec2();
};

b2EdgeShape.prototype.SetPrevEdge = function (edge, core, cornerDir, convex) {
  this.m_prevEdge = edge;
  this.m_coreV1 = core;
  this.m_cornerDir1 = cornerDir;
  this.m_cornerConvex1 = convex;
};

b2EdgeShape.prototype.SetNextEdge = function (edge, core, cornerDir, convex) {
  this.m_nextEdge = edge;
  this.m_coreV2 = core;
  this.m_cornerDir2 = cornerDir;
  this.m_cornerConvex2 = convex;
};

b2EdgeShape.prototype.TestPoint = function (transform, p) {
  return false;
};

b2EdgeShape.prototype.RayCast = function (output, input, transform) {
  var tMat;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
  var nY = -(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);

  if (denom > k_slop) {
    var bX = input.p1.x - v1X;
    var bY = input.p1.y - v1Y;
    var a = bX * nX + bY * nY;

    if (0 <= a && a <= input.maxFraction * denom) {
      var mu2 = -rX * bY + rY * bX;

      if (-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        output.fraction = a;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        output.normal.x = nX / nLen;
        output.normal.y = nY / nLen;
        return true;
      }
    }
  }

  return false;
};

b2EdgeShape.prototype.ComputeAABB = function (aabb, transform) {
  var tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
  var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);

  if (v1X < v2X) {
    aabb.lowerBound.x = v1X;
    aabb.upperBound.x = v2X;
  } else {
    aabb.lowerBound.x = v2X;
    aabb.upperBound.x = v1X;
  }

  if (v1Y < v2Y) {
    aabb.lowerBound.y = v1Y;
    aabb.upperBound.y = v2Y;
  } else {
    aabb.lowerBound.y = v2Y;
    aabb.upperBound.y = v1Y;
  }
};

b2EdgeShape.prototype.ComputeMass = function (massData, density) {
  massData.mass = 0;
  massData.center.SetV(this.m_v1);
  massData.I = 0;
};

b2EdgeShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
  var v0 = new b2Vec2(normal.x * offset, normal.y * offset);
  var v1 = b2Math.MulX(xf, this.m_v1);
  var v2 = b2Math.MulX(xf, this.m_v2);
  var d1 = b2Math.Dot(normal, v1) - offset;
  var d2 = b2Math.Dot(normal, v2) - offset;

  if (d1 > 0) {
    if (d2 > 0) {
      return 0;
    } else {
      v1.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v1.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y;
    }
  } else {
    if (d2 > 0) {
      v2.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v2.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y;
    } else {}
  }

  c.x = (v0.x + v1.x + v2.x) / 3;
  c.y = (v0.y + v1.y + v2.y) / 3;
  return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x));
};

b2EdgeShape.prototype.GetLength = function () {
  return this.m_length;
};

b2EdgeShape.prototype.GetVertex1 = function () {
  return this.m_v1;
};

b2EdgeShape.prototype.GetVertex2 = function () {
  return this.m_v2;
};

b2EdgeShape.prototype.GetCoreVertex1 = function () {
  return this.m_coreV1;
};

b2EdgeShape.prototype.GetCoreVertex2 = function () {
  return this.m_coreV2;
};

b2EdgeShape.prototype.GetNormalVector = function () {
  return this.m_normal;
};

b2EdgeShape.prototype.GetDirectionVector = function () {
  return this.m_direction;
};

b2EdgeShape.prototype.GetCorner1Vector = function () {
  return this.m_cornerDir1;
};

b2EdgeShape.prototype.GetCorner2Vector = function () {
  return this.m_cornerDir2;
};

b2EdgeShape.prototype.Corner1IsConvex = function () {
  return this.m_cornerConvex1;
};

b2EdgeShape.prototype.Corner2IsConvex = function () {
  return this.m_cornerConvex2;
};

b2EdgeShape.prototype.GetFirstVertex = function (xf) {
  var tMat = xf.R;
  return new b2Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y));
};

b2EdgeShape.prototype.GetNextEdge = function () {
  return this.m_nextEdge;
};

b2EdgeShape.prototype.GetPrevEdge = function () {
  return this.m_prevEdge;
};

b2EdgeShape.prototype.Support = function (xf, dX, dY) {
  var tMat = xf.R;
  var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
  var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
  var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
  var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);

  if (v1X * dX + v1Y * dY > v2X * dX + v2Y * dY) {
    this.s_supportVec.x = v1X;
    this.s_supportVec.y = v1Y;
  } else {
    this.s_supportVec.x = v2X;
    this.s_supportVec.y = v2Y;
  }

  return this.s_supportVec;
};

b2EdgeShape.prototype.s_supportVec = new b2Vec2();
b2EdgeShape.prototype.m_v1 = new b2Vec2();
b2EdgeShape.prototype.m_v2 = new b2Vec2();
b2EdgeShape.prototype.m_coreV1 = new b2Vec2();
b2EdgeShape.prototype.m_coreV2 = new b2Vec2();
b2EdgeShape.prototype.m_length = null;
b2EdgeShape.prototype.m_normal = new b2Vec2();
b2EdgeShape.prototype.m_direction = new b2Vec2();
b2EdgeShape.prototype.m_cornerDir1 = new b2Vec2();
b2EdgeShape.prototype.m_cornerDir2 = new b2Vec2();
b2EdgeShape.prototype.m_cornerConvex1 = null;
b2EdgeShape.prototype.m_cornerConvex2 = null;
b2EdgeShape.prototype.m_nextEdge = null;
b2EdgeShape.prototype.m_prevEdge = null;

var b2BuoyancyController = function () {
  b2Controller.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2BuoyancyController.prototype, b2Controller.prototype);
b2BuoyancyController.prototype._super = b2Controller.prototype;

b2BuoyancyController.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2BuoyancyController.prototype.__varz = function () {
  this.normal = new b2Vec2(0, -1);
  this.velocity = new b2Vec2(0, 0);
};

b2BuoyancyController.prototype.Step = function (step) {
  if (!m_bodyList) {
    return;
  }

  if (this.useWorldGravity) {
    this.gravity = this.GetWorld().GetGravity().Copy();
  }

  for (var i = m_bodyList; i; i = i.nextBody) {
    var body = i.body;

    if (body.IsAwake() == false) {
      continue;
    }

    var areac = new b2Vec2();
    var massc = new b2Vec2();
    var area = 0;
    var mass = 0;

    for (var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
      var sc = new b2Vec2();
      var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
      area += sarea;
      areac.x += sarea * sc.x;
      areac.y += sarea * sc.y;
      var shapeDensity;

      if (this.useDensity) {
        shapeDensity = 1;
      } else {
        shapeDensity = 1;
      }

      mass += sarea * shapeDensity;
      massc.x += sarea * sc.x * shapeDensity;
      massc.y += sarea * sc.y * shapeDensity;
    }

    areac.x /= area;
    areac.y /= area;
    massc.x /= mass;
    massc.y /= mass;

    if (area < Number.MIN_VALUE) {
      continue;
    }

    var buoyancyForce = this.gravity.GetNegative();
    buoyancyForce.Multiply(this.density * area);
    body.ApplyForce(buoyancyForce, massc);
    var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
    dragForce.Subtract(this.velocity);
    dragForce.Multiply(-this.linearDrag * area);
    body.ApplyForce(dragForce, areac);
    body.ApplyTorque(-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag);
  }
};

b2BuoyancyController.prototype.Draw = function (debugDraw) {
  var r = 1E3;
  var p1 = new b2Vec2();
  var p2 = new b2Vec2();
  p1.x = this.normal.x * this.offset + this.normal.y * r;
  p1.y = this.normal.y * this.offset - this.normal.x * r;
  p2.x = this.normal.x * this.offset - this.normal.y * r;
  p2.y = this.normal.y * this.offset + this.normal.x * r;
  var color = new b2Color(0, 0, 1);
  debugDraw.DrawSegment(p1, p2, color);
};

b2BuoyancyController.prototype.normal = new b2Vec2(0, -1);
b2BuoyancyController.prototype.offset = 0;
b2BuoyancyController.prototype.density = 0;
b2BuoyancyController.prototype.velocity = new b2Vec2(0, 0);
b2BuoyancyController.prototype.linearDrag = 2;
b2BuoyancyController.prototype.angularDrag = 1;
b2BuoyancyController.prototype.useDensity = false;
b2BuoyancyController.prototype.useWorldGravity = true;
b2BuoyancyController.prototype.gravity = null;

var b2Body = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Body.prototype.__constructor = function (bd, world) {
  this.m_flags = 0;

  if (bd.bullet) {
    this.m_flags |= b2Body.e_bulletFlag;
  }

  if (bd.fixedRotation) {
    this.m_flags |= b2Body.e_fixedRotationFlag;
  }

  if (bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag;
  }

  if (bd.awake) {
    this.m_flags |= b2Body.e_awakeFlag;
  }

  if (bd.active) {
    this.m_flags |= b2Body.e_activeFlag;
  }

  this.m_world = world;
  this.m_xf.position.SetV(bd.position);
  this.m_xf.R.Set(bd.angle);
  this.m_sweep.localCenter.SetZero();
  this.m_sweep.t0 = 1;
  this.m_sweep.a0 = this.m_sweep.a = bd.angle;
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_contactList = null;
  this.m_controllerCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_linearVelocity.SetV(bd.linearVelocity);
  this.m_angularVelocity = bd.angularVelocity;
  this.m_linearDamping = bd.linearDamping;
  this.m_angularDamping = bd.angularDamping;
  this.m_force.Set(0, 0);
  this.m_torque = 0;
  this.m_sleepTime = 0;
  this.m_type = bd.type;

  if (this.m_type == b2Body.b2_dynamicBody) {
    this.m_mass = 1;
    this.m_invMass = 1;
  } else {
    this.m_mass = 0;
    this.m_invMass = 0;
  }

  this.m_I = 0;
  this.m_invI = 0;
  this.m_inertiaScale = bd.inertiaScale;
  this.m_userData = bd.userData;
  this.m_fixtureList = null;
  this.m_fixtureCount = 0;
};

b2Body.prototype.__varz = function () {
  this.m_xf = new b2Transform();
  this.m_sweep = new b2Sweep();
  this.m_linearVelocity = new b2Vec2();
  this.m_force = new b2Vec2();
};

b2Body.b2_staticBody = 0;
b2Body.b2_kinematicBody = 1;
b2Body.b2_dynamicBody = 2;
b2Body.s_xf1 = new b2Transform();
b2Body.e_islandFlag = 1;
b2Body.e_awakeFlag = 2;
b2Body.e_allowSleepFlag = 4;
b2Body.e_bulletFlag = 8;
b2Body.e_fixedRotationFlag = 16;
b2Body.e_activeFlag = 32;

b2Body.prototype.connectEdges = function (s1, s2, angle1) {
  var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
  var coreOffset = Math.tan((angle2 - angle1) * 0.5);
  var core = b2Math.MulFV(coreOffset, s2.GetDirectionVector());
  core = b2Math.SubtractVV(core, s2.GetNormalVector());
  core = b2Math.MulFV(b2Settings.b2_toiSlop, core);
  core = b2Math.AddVV(core, s2.GetVertex1());
  var cornerDir = b2Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
  cornerDir.Normalize();
  var convex = b2Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
  s1.SetNextEdge(s2, core, cornerDir, convex);
  s2.SetPrevEdge(s1, core, cornerDir, convex);
  return angle2;
};

b2Body.prototype.SynchronizeFixtures = function () {
  var xf1 = b2Body.s_xf1;
  xf1.R.Set(this.m_sweep.a0);
  var tMat = xf1.R;
  var tVec = this.m_sweep.localCenter;
  xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var f;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;

  for (f = this.m_fixtureList; f; f = f.m_next) {
    f.Synchronize(broadPhase, xf1, this.m_xf);
  }
};

b2Body.prototype.SynchronizeTransform = function () {
  this.m_xf.R.Set(this.m_sweep.a);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
};

b2Body.prototype.ShouldCollide = function (other) {
  if (this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
    return false;
  }

  for (var jn = this.m_jointList; jn; jn = jn.next) {
    if (jn.other == other) {
      if (jn.joint.m_collideConnected == false) {
        return false;
      }
    }
  }

  return true;
};

b2Body.prototype.Advance = function (t) {
  this.m_sweep.Advance(t);
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_sweep.a = this.m_sweep.a0;
  this.SynchronizeTransform();
};

b2Body.prototype.CreateFixture = function (def) {
  if (this.m_world.IsLocked() == true) {
    return null;
  }

  var fixture = new b2Fixture();
  fixture.Create(this, this.m_xf, def);

  if (this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.CreateProxy(broadPhase, this.m_xf);
  }

  fixture.m_next = this.m_fixtureList;
  this.m_fixtureList = fixture;
  ++this.m_fixtureCount;
  fixture.m_body = this;

  if (fixture.m_density > 0) {
    this.ResetMassData();
  }

  this.m_world.m_flags |= b2World.e_newFixture;
  return fixture;
};

b2Body.prototype.CreateFixture2 = function (shape, density) {
  var def = new b2FixtureDef();
  def.shape = shape;
  def.density = density;
  return this.CreateFixture(def);
};

b2Body.prototype.DestroyFixture = function (fixture) {
  if (this.m_world.IsLocked() == true) {
    return;
  }

  var node = this.m_fixtureList;
  var ppF = null;
  var found = false;

  while (node != null) {
    if (node == fixture) {
      if (ppF) {
        ppF.m_next = fixture.m_next;
      } else {
        this.m_fixtureList = fixture.m_next;
      }

      found = true;
      break;
    }

    ppF = node;
    node = node.m_next;
  }

  var edge = this.m_contactList;

  while (edge) {
    var c = edge.contact;
    edge = edge.next;
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();

    if (fixture == fixtureA || fixture == fixtureB) {
      this.m_world.m_contactManager.Destroy(c);
    }
  }

  if (this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.DestroyProxy(broadPhase);
  } else {}

  fixture.Destroy();
  fixture.m_body = null;
  fixture.m_next = null;
  --this.m_fixtureCount;
  this.ResetMassData();
};

b2Body.prototype.SetPositionAndAngle = function (position, angle) {
  var f;

  if (this.m_world.IsLocked() == true) {
    return;
  }

  this.m_xf.R.Set(angle);
  this.m_xf.position.SetV(position);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_sweep.a0 = this.m_sweep.a = angle;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;

  for (f = this.m_fixtureList; f; f = f.m_next) {
    f.Synchronize(broadPhase, this.m_xf, this.m_xf);
  }

  this.m_world.m_contactManager.FindNewContacts();
};

b2Body.prototype.SetTransform = function (xf) {
  this.SetPositionAndAngle(xf.position, xf.GetAngle());
};

b2Body.prototype.GetTransform = function () {
  return this.m_xf;
};
/**
 * @returns {b2Vec2}
 */


b2Body.prototype.GetPosition = function () {
  return this.m_xf.position;
};

b2Body.prototype.SetPosition = function (position) {
  this.SetPositionAndAngle(position, this.GetAngle());
};

b2Body.prototype.GetAngle = function () {
  return this.m_sweep.a;
};

b2Body.prototype.SetAngle = function (angle) {
  this.SetPositionAndAngle(this.GetPosition(), angle);
};

b2Body.prototype.GetWorldCenter = function () {
  return this.m_sweep.c;
};

b2Body.prototype.GetLocalCenter = function () {
  return this.m_sweep.localCenter;
};

b2Body.prototype.SetLinearVelocity = function (v) {
  if (this.m_type == b2Body.b2_staticBody) {
    return;
  }

  this.m_linearVelocity.SetV(v);
};

b2Body.prototype.GetLinearVelocity = function () {
  return this.m_linearVelocity;
};

b2Body.prototype.SetAngularVelocity = function (omega) {
  if (this.m_type == b2Body.b2_staticBody) {
    return;
  }

  this.m_angularVelocity = omega;
};

b2Body.prototype.GetAngularVelocity = function () {
  return this.m_angularVelocity;
};

b2Body.prototype.GetDefinition = function () {
  var bd = new b2BodyDef();
  bd.type = this.GetType();
  bd.allowSleep = (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
  bd.angle = this.GetAngle();
  bd.angularDamping = this.m_angularDamping;
  bd.angularVelocity = this.m_angularVelocity;
  bd.fixedRotation = (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
  bd.bullet = (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
  bd.awake = (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
  bd.linearDamping = this.m_linearDamping;
  bd.linearVelocity.SetV(this.GetLinearVelocity());
  bd.position = this.GetPosition();
  bd.userData = this.GetUserData();
  return bd;
};

b2Body.prototype.ApplyForce = function (force, point) {
  if (this.m_type != b2Body.b2_dynamicBody) {
    return;
  }

  if (this.IsAwake() == false) {
    this.SetAwake(true);
  }

  this.m_force.x += force.x;
  this.m_force.y += force.y;
  this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x;
};

b2Body.prototype.ApplyTorque = function (torque) {
  if (this.m_type != b2Body.b2_dynamicBody) {
    return;
  }

  if (this.IsAwake() == false) {
    this.SetAwake(true);
  }

  this.m_torque += torque;
};

b2Body.prototype.ApplyImpulse = function (impulse, point) {
  if (this.m_type != b2Body.b2_dynamicBody) {
    return;
  }

  if (this.IsAwake() == false) {
    this.SetAwake(true);
  }

  this.m_linearVelocity.x += this.m_invMass * impulse.x;
  this.m_linearVelocity.y += this.m_invMass * impulse.y;
  this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
};

b2Body.prototype.Split = function (callback) {
  var linearVelocity = this.GetLinearVelocity().Copy();
  var angularVelocity = this.GetAngularVelocity();
  var center = this.GetWorldCenter();
  var body1 = this;
  var body2 = this.m_world.CreateBody(this.GetDefinition());
  var prev;

  for (var f = body1.m_fixtureList; f;) {
    if (callback(f)) {
      var next = f.m_next;

      if (prev) {
        prev.m_next = next;
      } else {
        body1.m_fixtureList = next;
      }

      body1.m_fixtureCount--;
      f.m_next = body2.m_fixtureList;
      body2.m_fixtureList = f;
      body2.m_fixtureCount++;
      f.m_body = body2;
      f = next;
    } else {
      prev = f;
      f = f.m_next;
    }
  }

  body1.ResetMassData();
  body2.ResetMassData();
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center1, center)));
  var velocity2 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center2, center)));
  body1.SetLinearVelocity(velocity1);
  body2.SetLinearVelocity(velocity2);
  body1.SetAngularVelocity(angularVelocity);
  body2.SetAngularVelocity(angularVelocity);
  body1.SynchronizeFixtures();
  body2.SynchronizeFixtures();
  return body2;
};

b2Body.prototype.Merge = function (other) {
  var f;

  for (f = other.m_fixtureList; f;) {
    var next = f.m_next;
    other.m_fixtureCount--;
    f.m_next = this.m_fixtureList;
    this.m_fixtureList = f;
    this.m_fixtureCount++;
    f.m_body = body2;
    f = next;
  }

  body1.m_fixtureCount = 0;
  var body1 = this;
  var body2 = other;
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = body1.GetLinearVelocity().Copy();
  var velocity2 = body2.GetLinearVelocity().Copy();
  var angular1 = body1.GetAngularVelocity();
  var angular = body2.GetAngularVelocity();
  body1.ResetMassData();
  this.SynchronizeFixtures();
};

b2Body.prototype.GetMass = function () {
  return this.m_mass;
};

b2Body.prototype.GetInertia = function () {
  return this.m_I;
};

b2Body.prototype.GetMassData = function (data) {
  data.mass = this.m_mass;
  data.I = this.m_I;
  data.center.SetV(this.m_sweep.localCenter);
};

b2Body.prototype.SetMassData = function (massData) {
  b2Settings.b2Assert(this.m_world.IsLocked() == false);

  if (this.m_world.IsLocked() == true) {
    return;
  }

  if (this.m_type != b2Body.b2_dynamicBody) {
    return;
  }

  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_mass = massData.mass;

  if (this.m_mass <= 0) {
    this.m_mass = 1;
  }

  this.m_invMass = 1 / this.m_mass;

  if (massData.I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
    this.m_invI = 1 / this.m_I;
  }

  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(massData.center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x);
};

b2Body.prototype.ResetMassData = function () {
  this.m_mass = 0;
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_sweep.localCenter.SetZero();

  if (this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
    return;
  }

  var center = b2Vec2.Make(0, 0);

  for (var f = this.m_fixtureList; f; f = f.m_next) {
    if (f.m_density == 0) {
      continue;
    }

    var massData = f.GetMassData();
    this.m_mass += massData.mass;
    center.x += massData.center.x * massData.mass;
    center.y += massData.center.y * massData.mass;
    this.m_I += massData.I;
  }

  if (this.m_mass > 0) {
    this.m_invMass = 1 / this.m_mass;
    center.x *= this.m_invMass;
    center.y *= this.m_invMass;
  } else {
    this.m_mass = 1;
    this.m_invMass = 1;
  }

  if (this.m_I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
    this.m_I *= this.m_inertiaScale;
    b2Settings.b2Assert(this.m_I > 0);
    this.m_invI = 1 / this.m_I;
  } else {
    this.m_I = 0;
    this.m_invI = 0;
  }

  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x);
};

b2Body.prototype.GetWorldPoint = function (localPoint) {
  var A = this.m_xf.R;
  var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  u.x += this.m_xf.position.x;
  u.y += this.m_xf.position.y;
  return u;
};

b2Body.prototype.GetWorldVector = function (localVector) {
  return b2Math.MulMV(this.m_xf.R, localVector);
};

b2Body.prototype.GetLocalPoint = function (worldPoint) {
  return b2Math.MulXT(this.m_xf, worldPoint);
};

b2Body.prototype.GetLocalVector = function (worldVector) {
  return b2Math.MulTMV(this.m_xf.R, worldVector);
};

b2Body.prototype.GetLinearVelocityFromWorldPoint = function (worldPoint) {
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
};

b2Body.prototype.GetLinearVelocityFromLocalPoint = function (localPoint) {
  var A = this.m_xf.R;
  var worldPoint = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  worldPoint.x += this.m_xf.position.x;
  worldPoint.y += this.m_xf.position.y;
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x));
};

b2Body.prototype.GetLinearDamping = function () {
  return this.m_linearDamping;
};

b2Body.prototype.SetLinearDamping = function (linearDamping) {
  this.m_linearDamping = linearDamping;
};

b2Body.prototype.GetAngularDamping = function () {
  return this.m_angularDamping;
};

b2Body.prototype.SetAngularDamping = function (angularDamping) {
  this.m_angularDamping = angularDamping;
};

b2Body.prototype.SetType = function (type) {
  if (this.m_type == type) {
    return;
  }

  this.m_type = type;
  this.ResetMassData();

  if (this.m_type == b2Body.b2_staticBody) {
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
  }

  this.SetAwake(true);
  this.m_force.SetZero();
  this.m_torque = 0;

  for (var ce = this.m_contactList; ce; ce = ce.next) {
    ce.contact.FlagForFiltering();
  }
};

b2Body.prototype.GetType = function () {
  return this.m_type;
};

b2Body.prototype.SetBullet = function (flag) {
  if (flag) {
    this.m_flags |= b2Body.e_bulletFlag;
  } else {
    this.m_flags &= ~b2Body.e_bulletFlag;
  }
};

b2Body.prototype.IsBullet = function () {
  return (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
};

b2Body.prototype.SetSleepingAllowed = function (flag) {
  if (flag) {
    this.m_flags |= b2Body.e_allowSleepFlag;
  } else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.SetAwake(true);
  }
};

b2Body.prototype.SetAwake = function (flag) {
  if (flag) {
    this.m_flags |= b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
  } else {
    this.m_flags &= ~b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
    this.m_force.SetZero();
    this.m_torque = 0;
  }
};

b2Body.prototype.IsAwake = function () {
  return (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
};

b2Body.prototype.SetFixedRotation = function (fixed) {
  if (fixed) {
    this.m_flags |= b2Body.e_fixedRotationFlag;
  } else {
    this.m_flags &= ~b2Body.e_fixedRotationFlag;
  }

  this.ResetMassData();
};

b2Body.prototype.IsFixedRotation = function () {
  return (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
};

b2Body.prototype.SetActive = function (flag) {
  if (flag == this.IsActive()) {
    return;
  }

  var broadPhase;
  var f;

  if (flag) {
    this.m_flags |= b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;

    for (f = this.m_fixtureList; f; f = f.m_next) {
      f.CreateProxy(broadPhase, this.m_xf);
    }
  } else {
    this.m_flags &= ~b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;

    for (f = this.m_fixtureList; f; f = f.m_next) {
      f.DestroyProxy(broadPhase);
    }

    var ce = this.m_contactList;

    while (ce) {
      var ce0 = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact);
    }

    this.m_contactList = null;
  }
};

b2Body.prototype.IsActive = function () {
  return (this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag;
};

b2Body.prototype.IsSleepingAllowed = function () {
  return (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
};

b2Body.prototype.GetFixtureList = function () {
  return this.m_fixtureList;
};

b2Body.prototype.GetJointList = function () {
  return this.m_jointList;
};

b2Body.prototype.GetControllerList = function () {
  return this.m_controllerList;
};

b2Body.prototype.GetContactList = function () {
  return this.m_contactList;
};

b2Body.prototype.GetNext = function () {
  return this.m_next;
};

b2Body.prototype.GetUserData = function () {
  return this.m_userData;
};

b2Body.prototype.SetUserData = function (data) {
  this.m_userData = data;
};

b2Body.prototype.GetWorld = function () {
  return this.m_world;
};

b2Body.prototype.m_flags = 0;
b2Body.prototype.m_type = 0;
b2Body.prototype.m_islandIndex = 0;
b2Body.prototype.m_xf = new b2Transform();
b2Body.prototype.m_sweep = new b2Sweep();
b2Body.prototype.m_linearVelocity = new b2Vec2();
b2Body.prototype.m_angularVelocity = null;
b2Body.prototype.m_force = new b2Vec2();
b2Body.prototype.m_torque = null;
b2Body.prototype.m_world = null;
b2Body.prototype.m_prev = null;
b2Body.prototype.m_next = null;
b2Body.prototype.m_fixtureList = null;
b2Body.prototype.m_fixtureCount = 0;
b2Body.prototype.m_controllerList = null;
b2Body.prototype.m_controllerCount = 0;
b2Body.prototype.m_jointList = null;
b2Body.prototype.m_contactList = null;
b2Body.prototype.m_mass = null;
b2Body.prototype.m_invMass = null;
b2Body.prototype.m_I = null;
b2Body.prototype.m_invI = null;
b2Body.prototype.m_inertiaScale = null;
b2Body.prototype.m_linearDamping = null;
b2Body.prototype.m_angularDamping = null;
b2Body.prototype.m_sleepTime = null;
b2Body.prototype.m_userData = null;

var b2ContactImpulse = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactImpulse.prototype.__constructor = function () {};

b2ContactImpulse.prototype.__varz = function () {
  this.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
  this.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);
};

b2ContactImpulse.prototype.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
b2ContactImpulse.prototype.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);

var b2TensorDampingController = function () {
  b2Controller.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2TensorDampingController.prototype, b2Controller.prototype);
b2TensorDampingController.prototype._super = b2Controller.prototype;

b2TensorDampingController.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2TensorDampingController.prototype.__varz = function () {
  this.T = new b2Mat22();
};

b2TensorDampingController.prototype.SetAxisAligned = function (xDamping, yDamping) {
  this.T.col1.x = -xDamping;
  this.T.col1.y = 0;
  this.T.col2.x = 0;
  this.T.col2.y = -yDamping;

  if (xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / Math.max(xDamping, yDamping);
  } else {
    this.maxTimestep = 0;
  }
};

b2TensorDampingController.prototype.Step = function (step) {
  var timestep = step.dt;

  if (timestep <= Number.MIN_VALUE) {
    return;
  }

  if (timestep > this.maxTimestep && this.maxTimestep > 0) {
    timestep = this.maxTimestep;
  }

  for (var i = m_bodyList; i; i = i.nextBody) {
    var body = i.body;

    if (!body.IsAwake()) {
      continue;
    }

    var damping = body.GetWorldVector(b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep));
  }
};

b2TensorDampingController.prototype.T = new b2Mat22();
b2TensorDampingController.prototype.maxTimestep = 0;

var b2ManifoldPoint = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ManifoldPoint.prototype.__constructor = function () {
  this.Reset();
};

b2ManifoldPoint.prototype.__varz = function () {
  this.m_localPoint = new b2Vec2();
  this.m_id = new b2ContactID();
};

b2ManifoldPoint.prototype.Reset = function () {
  this.m_localPoint.SetZero();
  this.m_normalImpulse = 0;
  this.m_tangentImpulse = 0;
  this.m_id.key = 0;
};

b2ManifoldPoint.prototype.Set = function (m) {
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_normalImpulse = m.m_normalImpulse;
  this.m_tangentImpulse = m.m_tangentImpulse;
  this.m_id.Set(m.m_id);
};

b2ManifoldPoint.prototype.m_localPoint = new b2Vec2();
b2ManifoldPoint.prototype.m_normalImpulse = null;
b2ManifoldPoint.prototype.m_tangentImpulse = null;
b2ManifoldPoint.prototype.m_id = new b2ContactID();

var b2PolygonShape = function () {
  b2Shape.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PolygonShape.prototype, b2Shape.prototype);
b2PolygonShape.prototype._super = b2Shape.prototype;

b2PolygonShape.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.m_type = b2Shape.e_polygonShape;
  this.m_centroid = new b2Vec2();
  this.m_vertices = new Array();
  this.m_normals = new Array();
};

b2PolygonShape.prototype.__varz = function () {};

b2PolygonShape.AsArray = function (vertices, vertexCount) {
  var polygonShape = new b2PolygonShape();
  polygonShape.SetAsArray(vertices, vertexCount);
  return polygonShape;
};

b2PolygonShape.AsVector = function (vertices, vertexCount) {
  var polygonShape = new b2PolygonShape();
  polygonShape.SetAsVector(vertices, vertexCount);
  return polygonShape;
};

b2PolygonShape.AsBox = function (hx, hy) {
  var polygonShape = new b2PolygonShape();
  polygonShape.SetAsBox(hx, hy);
  return polygonShape;
};

b2PolygonShape.AsOrientedBox = function (hx, hy, center, angle) {
  var polygonShape = new b2PolygonShape();
  polygonShape.SetAsOrientedBox(hx, hy, center, angle);
  return polygonShape;
};

b2PolygonShape.AsEdge = function (v1, v2) {
  var polygonShape = new b2PolygonShape();
  polygonShape.SetAsEdge(v1, v2);
  return polygonShape;
};

b2PolygonShape.ComputeCentroid = function (vs, count) {
  var c = new b2Vec2();
  var area = 0;
  var p1X = 0;
  var p1Y = 0;
  var inv3 = 1 / 3;

  for (var i = 0; i < count; ++i) {
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[parseInt(i + 1)] : vs[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
  }

  c.x *= 1 / area;
  c.y *= 1 / area;
  return c;
};

b2PolygonShape.ComputeOBB = function (obb, vs, count) {
  var i = 0;
  var p = new Array(count + 1);

  for (i = 0; i < count; ++i) {
    p[i] = vs[i];
  }

  p[count] = p[0];
  var minArea = Number.MAX_VALUE;

  for (i = 1; i <= count; ++i) {
    var root = p[parseInt(i - 1)];
    var uxX = p[i].x - root.x;
    var uxY = p[i].y - root.y;
    var length = Math.sqrt(uxX * uxX + uxY * uxY);
    uxX /= length;
    uxY /= length;
    var uyX = -uxY;
    var uyY = uxX;
    var lowerX = Number.MAX_VALUE;
    var lowerY = Number.MAX_VALUE;
    var upperX = -Number.MAX_VALUE;
    var upperY = -Number.MAX_VALUE;

    for (var j = 0; j < count; ++j) {
      var dX = p[j].x - root.x;
      var dY = p[j].y - root.y;
      var rX = uxX * dX + uxY * dY;
      var rY = uyX * dX + uyY * dY;

      if (rX < lowerX) {
        lowerX = rX;
      }

      if (rY < lowerY) {
        lowerY = rY;
      }

      if (rX > upperX) {
        upperX = rX;
      }

      if (rY > upperY) {
        upperY = rY;
      }
    }

    var area = (upperX - lowerX) * (upperY - lowerY);

    if (area < 0.95 * minArea) {
      minArea = area;
      obb.R.col1.x = uxX;
      obb.R.col1.y = uxY;
      obb.R.col2.x = uyX;
      obb.R.col2.y = uyY;
      var centerX = 0.5 * (lowerX + upperX);
      var centerY = 0.5 * (lowerY + upperY);
      var tMat = obb.R;
      obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
      obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
      obb.extents.x = 0.5 * (upperX - lowerX);
      obb.extents.y = 0.5 * (upperY - lowerY);
    }
  }
};

b2PolygonShape.s_mat = new b2Mat22();

b2PolygonShape.prototype.Validate = function () {
  return false;
};

b2PolygonShape.prototype.Reserve = function (count) {
  for (var i = this.m_vertices.length; i < count; i++) {
    this.m_vertices[i] = new b2Vec2();
    this.m_normals[i] = new b2Vec2();
  }
};

b2PolygonShape.prototype.Copy = function () {
  var s = new b2PolygonShape();
  s.Set(this);
  return s;
};

b2PolygonShape.prototype.Set = function (other) {
  this._super.Set.apply(this, [other]);

  if (isInstanceOf(other, b2PolygonShape)) {
    var other2 = other;
    this.m_centroid.SetV(other2.m_centroid);
    this.m_vertexCount = other2.m_vertexCount;
    this.Reserve(this.m_vertexCount);

    for (var i = 0; i < this.m_vertexCount; i++) {
      this.m_vertices[i].SetV(other2.m_vertices[i]);
      this.m_normals[i].SetV(other2.m_normals[i]);
    }
  }
};

b2PolygonShape.prototype.SetAsArray = function (vertices, vertexCount) {
  var v = new Array();

  for (var i = 0, tVec = null; i < vertices.length, tVec = vertices[i]; i++) {
    v.push(tVec);
  }

  this.SetAsVector(v, vertexCount);
};

b2PolygonShape.prototype.SetAsVector = function (vertices, vertexCount) {
  if (typeof vertexCount == "undefined") {
    vertexCount = vertices.length;
  }

  b2Settings.b2Assert(2 <= vertexCount);
  this.m_vertexCount = vertexCount;
  this.Reserve(vertexCount);
  var i = 0;

  for (i = 0; i < this.m_vertexCount; i++) {
    this.m_vertices[i].SetV(vertices[i]);
  }

  for (i = 0; i < this.m_vertexCount; ++i) {
    var i1 = i;
    var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
    var edge = b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
    b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
    this.m_normals[i].SetV(b2Math.CrossVF(edge, 1));
    this.m_normals[i].Normalize();
  }

  this.m_centroid = b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount);
};

b2PolygonShape.prototype.SetAsBox = function (hx, hy) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid.SetZero();
};

b2PolygonShape.prototype.SetAsOrientedBox = function (hx, hy, center, angle) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid = center;
  var xf = new b2Transform();
  xf.position = center;
  xf.R.Set(angle);

  for (var i = 0; i < this.m_vertexCount; ++i) {
    this.m_vertices[i] = b2Math.MulX(xf, this.m_vertices[i]);
    this.m_normals[i] = b2Math.MulMV(xf.R, this.m_normals[i]);
  }
};

b2PolygonShape.prototype.SetAsEdge = function (v1, v2) {
  this.m_vertexCount = 2;
  this.Reserve(2);
  this.m_vertices[0].SetV(v1);
  this.m_vertices[1].SetV(v2);
  this.m_centroid.x = 0.5 * (v1.x + v2.x);
  this.m_centroid.y = 0.5 * (v1.y + v2.y);
  this.m_normals[0] = b2Math.CrossVF(b2Math.SubtractVV(v2, v1), 1);
  this.m_normals[0].Normalize();
  this.m_normals[1].x = -this.m_normals[0].x;
  this.m_normals[1].y = -this.m_normals[0].y;
};

b2PolygonShape.prototype.TestPoint = function (xf, p) {
  var tVec;
  var tMat = xf.R;
  var tX = p.x - xf.position.x;
  var tY = p.y - xf.position.y;
  var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
  var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;

  for (var i = 0; i < this.m_vertexCount; ++i) {
    tVec = this.m_vertices[i];
    tX = pLocalX - tVec.x;
    tY = pLocalY - tVec.y;
    tVec = this.m_normals[i];
    var dot = tVec.x * tX + tVec.y * tY;

    if (dot > 0) {
      return false;
    }
  }

  return true;
};

b2PolygonShape.prototype.RayCast = function (output, input, transform) {
  var lower = 0;
  var upper = input.maxFraction;
  var tX;
  var tY;
  var tMat;
  var tVec;
  tX = input.p1.x - transform.position.x;
  tY = input.p1.y - transform.position.y;
  tMat = transform.R;
  var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
  tX = input.p2.x - transform.position.x;
  tY = input.p2.y - transform.position.y;
  tMat = transform.R;
  var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var index = -1;

  for (var i = 0; i < this.m_vertexCount; ++i) {
    tVec = this.m_vertices[i];
    tX = tVec.x - p1X;
    tY = tVec.y - p1Y;
    tVec = this.m_normals[i];
    var numerator = tVec.x * tX + tVec.y * tY;
    var denominator = tVec.x * dX + tVec.y * dY;

    if (denominator == 0) {
      if (numerator < 0) {
        return false;
      }
    } else {
      if (denominator < 0 && numerator < lower * denominator) {
        lower = numerator / denominator;
        index = i;
      } else {
        if (denominator > 0 && numerator < upper * denominator) {
          upper = numerator / denominator;
        }
      }
    }

    if (upper < lower - Number.MIN_VALUE) {
      return false;
    }
  }

  if (index >= 0) {
    output.fraction = lower;
    tMat = transform.R;
    tVec = this.m_normals[index];
    output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    return true;
  }

  return false;
};

b2PolygonShape.prototype.ComputeAABB = function (aabb, xf) {
  var tMat = xf.R;
  var tVec = this.m_vertices[0];
  var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var upperX = lowerX;
  var upperY = lowerY;

  for (var i = 1; i < this.m_vertexCount; ++i) {
    tVec = this.m_vertices[i];
    var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    lowerX = lowerX < vX ? lowerX : vX;
    lowerY = lowerY < vY ? lowerY : vY;
    upperX = upperX > vX ? upperX : vX;
    upperY = upperY > vY ? upperY : vY;
  }

  aabb.lowerBound.x = lowerX - this.m_radius;
  aabb.lowerBound.y = lowerY - this.m_radius;
  aabb.upperBound.x = upperX + this.m_radius;
  aabb.upperBound.y = upperY + this.m_radius;
};

b2PolygonShape.prototype.ComputeMass = function (massData, density) {
  if (this.m_vertexCount == 2) {
    massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
    massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
    massData.mass = 0;
    massData.I = 0;
    return;
  }

  var centerX = 0;
  var centerY = 0;
  var area = 0;
  var I = 0;
  var p1X = 0;
  var p1Y = 0;
  var k_inv3 = 1 / 3;

  for (var i = 0; i < this.m_vertexCount; ++i) {
    var p2 = this.m_vertices[i];
    var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)] : this.m_vertices[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
    centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
    var px = p1X;
    var py = p1Y;
    var ex1 = e1X;
    var ey1 = e1Y;
    var ex2 = e2X;
    var ey2 = e2Y;
    var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
    I += D * (intx2 + inty2);
  }

  massData.mass = density * area;
  centerX *= 1 / area;
  centerY *= 1 / area;
  massData.center.Set(centerX, centerY);
  massData.I = density * I;
};

b2PolygonShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
  var normalL = b2Math.MulTMV(xf.R, normal);
  var offsetL = offset - b2Math.Dot(normal, xf.position);
  var depths = new Array();
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;
  var lastSubmerged = false;
  var i = 0;

  for (i = 0; i < this.m_vertexCount; ++i) {
    depths[i] = b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < -Number.MIN_VALUE;

    if (i > 0) {
      if (isSubmerged) {
        if (!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++;
        }
      } else {
        if (lastSubmerged) {
          outoIndex = i - 1;
          diveCount++;
        }
      }
    }

    lastSubmerged = isSubmerged;
  }

  switch (diveCount) {
    case 0:
      if (lastSubmerged) {
        var md = new b2MassData();
        this.ComputeMass(md, 1);
        c.SetV(b2Math.MulX(xf, md.center));
        return md.mass;
      } else {
        return 0;
      }

      break;

    case 1:
      if (intoIndex == -1) {
        intoIndex = this.m_vertexCount - 1;
      } else {
        outoIndex = this.m_vertexCount - 1;
      }

      break;
  }

  var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
  var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
  var intoVec = new b2Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = new b2Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
  var area = 0;
  var center = new b2Vec2();
  var p2 = this.m_vertices[intoIndex2];
  var p3;
  i = intoIndex2;

  while (i != outoIndex2) {
    i = (i + 1) % this.m_vertexCount;

    if (i == outoIndex2) {
      p3 = outoVec;
    } else {
      p3 = this.m_vertices[i];
    }

    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
    p2 = p3;
  }

  center.Multiply(1 / area);
  c.SetV(b2Math.MulX(xf, center));
  return area;
};

b2PolygonShape.prototype.GetVertexCount = function () {
  return this.m_vertexCount;
};

b2PolygonShape.prototype.GetVertices = function () {
  return this.m_vertices;
};

b2PolygonShape.prototype.GetNormals = function () {
  return this.m_normals;
};

b2PolygonShape.prototype.GetSupport = function (d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;

  for (var i = 1; i < this.m_vertexCount; ++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;

    if (value > bestValue) {
      bestIndex = i;
      bestValue = value;
    }
  }

  return bestIndex;
};

b2PolygonShape.prototype.GetSupportVertex = function (d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;

  for (var i = 1; i < this.m_vertexCount; ++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;

    if (value > bestValue) {
      bestIndex = i;
      bestValue = value;
    }
  }

  return this.m_vertices[bestIndex];
};

b2PolygonShape.prototype.m_centroid = null;
b2PolygonShape.prototype.m_vertices = null;
b2PolygonShape.prototype.m_normals = null;
b2PolygonShape.prototype.m_vertexCount = 0;

var b2Fixture = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Fixture.prototype.__constructor = function () {
  this.m_aabb = new b2AABB();
  this.m_userData = null;
  this.m_body = null;
  this.m_next = null;
  this.m_shape = null;
  this.m_density = 0;
  this.m_friction = 0;
  this.m_restitution = 0;
};

b2Fixture.prototype.__varz = function () {
  this.m_filter = new b2FilterData();
};

b2Fixture.prototype.Create = function (body, xf, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;
  this.m_next = null;
  this.m_filter = def.filter.Copy();
  this.m_isSensor = def.isSensor;
  this.m_shape = def.shape.Copy();
  this.m_density = def.density;
};

b2Fixture.prototype.Destroy = function () {
  this.m_shape = null;
};

b2Fixture.prototype.CreateProxy = function (broadPhase, xf) {
  this.m_shape.ComputeAABB(this.m_aabb, xf);
  this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this);
};

b2Fixture.prototype.DestroyProxy = function (broadPhase) {
  if (this.m_proxy == null) {
    return;
  }

  broadPhase.DestroyProxy(this.m_proxy);
  this.m_proxy = null;
};

b2Fixture.prototype.Synchronize = function (broadPhase, transform1, transform2) {
  if (!this.m_proxy) {
    return;
  }

  var aabb1 = new b2AABB();
  var aabb2 = new b2AABB();
  this.m_shape.ComputeAABB(aabb1, transform1);
  this.m_shape.ComputeAABB(aabb2, transform2);
  this.m_aabb.Combine(aabb1, aabb2);
  var displacement = b2Math.SubtractVV(transform2.position, transform1.position);
  broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement);
};

b2Fixture.prototype.GetType = function () {
  return this.m_shape.GetType();
};

b2Fixture.prototype.GetShape = function () {
  return this.m_shape;
};

b2Fixture.prototype.SetSensor = function (sensor) {
  if (this.m_isSensor == sensor) {
    return;
  }

  this.m_isSensor = sensor;

  if (this.m_body == null) {
    return;
  }

  var edge = this.m_body.GetContactList();

  while (edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();

    if (fixtureA == this || fixtureB == this) {
      contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor());
    }

    edge = edge.next;
  }
};

b2Fixture.prototype.IsSensor = function () {
  return this.m_isSensor;
};

b2Fixture.prototype.SetFilterData = function (filter) {
  this.m_filter = filter.Copy();
  this.Refilter();
};

b2Fixture.prototype.Refilter = function () {
  if (!this.m_body) {
    return;
  }

  var edge = this.m_body.GetContactList();

  while (edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();

    if (fixtureA == this || fixtureB == this) {
      contact.FlagForFiltering();
    }

    edge = edge.next;
  }
};

b2Fixture.prototype.GetFilterData = function () {
  return this.m_filter.Copy();
};

b2Fixture.prototype.GetBody = function () {
  return this.m_body;
};

b2Fixture.prototype.GetNext = function () {
  return this.m_next;
};

b2Fixture.prototype.GetUserData = function () {
  return this.m_userData;
};

b2Fixture.prototype.SetUserData = function (data) {
  this.m_userData = data;
};

b2Fixture.prototype.TestPoint = function (p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
};

b2Fixture.prototype.RayCast = function (output, input) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform());
};

b2Fixture.prototype.GetMassData = function (massData) {
  if (massData == null) {
    massData = new b2MassData();
  }

  this.m_shape.ComputeMass(massData, this.m_density);
  return massData;
};

b2Fixture.prototype.SetDensity = function (density) {
  this.m_density = density;
};

b2Fixture.prototype.GetDensity = function () {
  return this.m_density;
};

b2Fixture.prototype.GetFriction = function () {
  return this.m_friction;
};

b2Fixture.prototype.SetFriction = function (friction) {
  this.m_friction = friction;
};

b2Fixture.prototype.GetRestitution = function () {
  return this.m_restitution;
};

b2Fixture.prototype.SetRestitution = function (restitution) {
  this.m_restitution = restitution;
};

b2Fixture.prototype.GetAABB = function () {
  return this.m_aabb;
};

b2Fixture.prototype.m_massData = null;
b2Fixture.prototype.m_aabb = null;
b2Fixture.prototype.m_density = null;
b2Fixture.prototype.m_next = null;
b2Fixture.prototype.m_body = null;
b2Fixture.prototype.m_shape = null;
b2Fixture.prototype.m_friction = null;
b2Fixture.prototype.m_restitution = null;
b2Fixture.prototype.m_proxy = null;
b2Fixture.prototype.m_filter = new b2FilterData();
b2Fixture.prototype.m_isSensor = null;
b2Fixture.prototype.m_userData = null;

var b2DynamicTreeNode = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DynamicTreeNode.prototype.__constructor = function () {};

b2DynamicTreeNode.prototype.__varz = function () {
  this.aabb = new b2AABB();
};

b2DynamicTreeNode.prototype.IsLeaf = function () {
  return this.child1 == null;
};

b2DynamicTreeNode.prototype.userData = null;
b2DynamicTreeNode.prototype.aabb = new b2AABB();
b2DynamicTreeNode.prototype.parent = null;
b2DynamicTreeNode.prototype.child1 = null;
b2DynamicTreeNode.prototype.child2 = null;

var b2BodyDef = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2BodyDef.prototype.__constructor = function () {
  this.userData = null;
  this.position.Set(0, 0);
  this.angle = 0;
  this.linearVelocity.Set(0, 0);
  this.angularVelocity = 0;
  this.linearDamping = 0;
  this.angularDamping = 0;
  this.allowSleep = true;
  this.awake = true;
  this.fixedRotation = false;
  this.bullet = false;
  this.type = b2Body.b2_staticBody;
  this.active = true;
  this.inertiaScale = 1;
};

b2BodyDef.prototype.__varz = function () {
  this.position = new b2Vec2();
  this.linearVelocity = new b2Vec2();
};

b2BodyDef.prototype.type = 0;
b2BodyDef.prototype.position = new b2Vec2();
b2BodyDef.prototype.angle = null;
b2BodyDef.prototype.linearVelocity = new b2Vec2();
b2BodyDef.prototype.angularVelocity = null;
b2BodyDef.prototype.linearDamping = null;
b2BodyDef.prototype.angularDamping = null;
b2BodyDef.prototype.allowSleep = null;
b2BodyDef.prototype.awake = null;
b2BodyDef.prototype.fixedRotation = null;
b2BodyDef.prototype.bullet = null;
b2BodyDef.prototype.active = null;
b2BodyDef.prototype.userData = null;
b2BodyDef.prototype.inertiaScale = null;

var b2DynamicTreeBroadPhase = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2DynamicTreeBroadPhase.prototype.__constructor = function () {};

b2DynamicTreeBroadPhase.prototype.__varz = function () {
  this.m_tree = new b2DynamicTree();
  this.m_moveBuffer = new Array();
  this.m_pairBuffer = new Array();
};

b2DynamicTreeBroadPhase.prototype.BufferMove = function (proxy) {
  this.m_moveBuffer[this.m_moveBuffer.length] = proxy;
};

b2DynamicTreeBroadPhase.prototype.UnBufferMove = function (proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer.splice(i, 1);
};

b2DynamicTreeBroadPhase.prototype.ComparePairs = function (pair1, pair2) {
  return 0;
};

b2DynamicTreeBroadPhase.prototype.CreateProxy = function (aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy;
};

b2DynamicTreeBroadPhase.prototype.DestroyProxy = function (proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy);
};

b2DynamicTreeBroadPhase.prototype.MoveProxy = function (proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);

  if (buffer) {
    this.BufferMove(proxy);
  }
};

b2DynamicTreeBroadPhase.prototype.TestOverlap = function (proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return aabbA.TestOverlap(aabbB);
};

b2DynamicTreeBroadPhase.prototype.GetUserData = function (proxy) {
  return this.m_tree.GetUserData(proxy);
};

b2DynamicTreeBroadPhase.prototype.GetFatAABB = function (proxy) {
  return this.m_tree.GetFatAABB(proxy);
};

b2DynamicTreeBroadPhase.prototype.GetProxyCount = function () {
  return this.m_proxyCount;
};

b2DynamicTreeBroadPhase.prototype.UpdatePairs = function (callback) {
  this.m_pairCount = 0;

  for (var i = 0, queryProxy = null; i < this.m_moveBuffer.length, queryProxy = this.m_moveBuffer[i]; i++) {
    var that = this;

    function QueryCallback(proxy) {
      if (proxy == queryProxy) {
        return true;
      }

      if (that.m_pairCount == that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new b2DynamicTreePair();
      }

      var pair = that.m_pairBuffer[that.m_pairCount];
      pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      ++that.m_pairCount;
      return true;
    }

    var fatAABB = this.m_tree.GetFatAABB(queryProxy);
    this.m_tree.Query(QueryCallback, fatAABB);
  }

  this.m_moveBuffer.length = 0;

  for (var i = 0; i < this.m_pairCount;) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
    callback(userDataA, userDataB);
    ++i;

    while (i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];

      if (pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
        break;
      }

      ++i;
    }
  }
};

b2DynamicTreeBroadPhase.prototype.Query = function (callback, aabb) {
  this.m_tree.Query(callback, aabb);
};

b2DynamicTreeBroadPhase.prototype.RayCast = function (callback, input) {
  this.m_tree.RayCast(callback, input);
};

b2DynamicTreeBroadPhase.prototype.Validate = function () {};

b2DynamicTreeBroadPhase.prototype.Rebalance = function (iterations) {
  this.m_tree.Rebalance(iterations);
};

b2DynamicTreeBroadPhase.prototype.m_tree = new b2DynamicTree();
b2DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
b2DynamicTreeBroadPhase.prototype.m_moveBuffer = new Array();
b2DynamicTreeBroadPhase.prototype.m_pairBuffer = new Array();
b2DynamicTreeBroadPhase.prototype.m_pairCount = 0;

var b2BroadPhase = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2BroadPhase.prototype.__constructor = function (worldAABB) {
  var i = 0;
  this.m_pairManager.Initialize(this);
  this.m_worldAABB = worldAABB;
  this.m_proxyCount = 0;
  this.m_bounds = new Array();

  for (i = 0; i < 2; i++) {
    this.m_bounds[i] = new Array();
  }

  var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
  var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
  this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
  this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;
  this.m_timeStamp = 1;
  this.m_queryResultCount = 0;
};

b2BroadPhase.prototype.__varz = function () {
  this.m_pairManager = new b2PairManager();
  this.m_proxyPool = new Array();
  this.m_querySortKeys = new Array();
  this.m_queryResults = new Array();
  this.m_quantizationFactor = new b2Vec2();
};

b2BroadPhase.BinarySearch = function (bounds, count, value) {
  var low = 0;
  var high = count - 1;

  while (low <= high) {
    var mid = Math.round((low + high) / 2);
    var bound = bounds[mid];

    if (bound.value > value) {
      high = mid - 1;
    } else {
      if (bound.value < value) {
        low = mid + 1;
      } else {
        return parseInt(mid);
      }
    }
  }

  return parseInt(low);
};

b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;

b2BroadPhase.prototype.ComputeBounds = function (lowerValues, upperValues, aabb) {
  var minVertexX = aabb.lowerBound.x;
  var minVertexY = aabb.lowerBound.y;
  minVertexX = b2Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
  minVertexY = b2Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
  minVertexX = b2Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
  minVertexY = b2Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
  var maxVertexX = aabb.upperBound.x;
  var maxVertexY = aabb.upperBound.y;
  maxVertexX = b2Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
  maxVertexY = b2Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
  maxVertexX = b2Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
  maxVertexY = b2Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
  lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x)) & b2Settings.USHRT_MAX - 1;
  upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x)) % 65535 | 1;
  lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y)) & b2Settings.USHRT_MAX - 1;
  upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y)) % 65535 | 1;
};

b2BroadPhase.prototype.TestOverlapValidate = function (p1, p2) {
  for (var axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var bound1 = bounds[p1.lowerBounds[axis]];
    var bound2 = bounds[p2.upperBounds[axis]];

    if (bound1.value > bound2.value) {
      return false;
    }

    bound1 = bounds[p1.upperBounds[axis]];
    bound2 = bounds[p2.lowerBounds[axis]];

    if (bound1.value < bound2.value) {
      return false;
    }
  }

  return true;
};

b2BroadPhase.prototype.QueryAxis = function (lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis) {
  var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
  var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);
  var bound;

  for (var j = lowerQuery; j < upperQuery; ++j) {
    bound = bounds[j];

    if (bound.IsLower()) {
      this.IncrementOverlapCount(bound.proxy);
    }
  }

  if (lowerQuery > 0) {
    var i = lowerQuery - 1;
    bound = bounds[i];
    var s = bound.stabbingCount;

    while (s) {
      bound = bounds[i];

      if (bound.IsLower()) {
        var proxy = bound.proxy;

        if (lowerQuery <= proxy.upperBounds[axis]) {
          this.IncrementOverlapCount(bound.proxy);
          --s;
        }
      }

      --i;
    }
  }

  lowerQueryOut[0] = lowerQuery;
  upperQueryOut[0] = upperQuery;
};

b2BroadPhase.prototype.IncrementOverlapCount = function (proxy) {
  if (proxy.timeStamp < this.m_timeStamp) {
    proxy.timeStamp = this.m_timeStamp;
    proxy.overlapCount = 1;
  } else {
    proxy.overlapCount = 2;
    this.m_queryResults[this.m_queryResultCount] = proxy;
    ++this.m_queryResultCount;
  }
};

b2BroadPhase.prototype.IncrementTimeStamp = function () {
  if (this.m_timeStamp == b2Settings.USHRT_MAX) {
    for (var i = 0; i < this.m_proxyPool.length; ++i) {
      this.m_proxyPool[i].timeStamp = 0;
    }

    this.m_timeStamp = 1;
  } else {
    ++this.m_timeStamp;
  }
};

b2BroadPhase.prototype.InRange = function (aabb) {
  var dX;
  var dY;
  var d2X;
  var d2Y;
  dX = aabb.lowerBound.x;
  dY = aabb.lowerBound.y;
  dX -= this.m_worldAABB.upperBound.x;
  dY -= this.m_worldAABB.upperBound.y;
  d2X = this.m_worldAABB.lowerBound.x;
  d2Y = this.m_worldAABB.lowerBound.y;
  d2X -= aabb.upperBound.x;
  d2Y -= aabb.upperBound.y;
  dX = b2Math.Max(dX, d2X);
  dY = b2Math.Max(dY, d2Y);
  return b2Math.Max(dX, dY) < 0;
};

b2BroadPhase.prototype.CreateProxy = function (aabb, userData) {
  var index = 0;
  var proxy;
  var i = 0;
  var j = 0;

  if (!this.m_freeProxy) {
    this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new b2Proxy();
    this.m_freeProxy.next = null;
    this.m_freeProxy.timeStamp = 0;
    this.m_freeProxy.overlapCount = b2BroadPhase.b2_invalid;
    this.m_freeProxy.userData = null;

    for (i = 0; i < 2; i++) {
      j = this.m_proxyCount * 2;
      this.m_bounds[i][j++] = new b2Bound();
      this.m_bounds[i][j] = new b2Bound();
    }
  }

  proxy = this.m_freeProxy;
  this.m_freeProxy = proxy.next;
  proxy.overlapCount = 0;
  proxy.userData = userData;
  var boundCount = 2 * this.m_proxyCount;
  var lowerValues = new Array();
  var upperValues = new Array();
  this.ComputeBounds(lowerValues, upperValues, aabb);

  for (var axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut = new Array();
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut = new Array();
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
    lowerIndex = lowerIndexOut[0];
    upperIndex = upperIndexOut[0];
    bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    ++upperIndex;
    var tBound1 = bounds[lowerIndex];
    var tBound2 = bounds[upperIndex];
    tBound1.value = lowerValues[axis];
    tBound1.proxy = proxy;
    tBound2.value = upperValues[axis];
    tBound2.proxy = proxy;
    var tBoundAS3 = bounds[parseInt(lowerIndex - 1)];
    tBound1.stabbingCount = lowerIndex == 0 ? 0 : tBoundAS3.stabbingCount;
    tBoundAS3 = bounds[parseInt(upperIndex - 1)];
    tBound2.stabbingCount = tBoundAS3.stabbingCount;

    for (index = lowerIndex; index < upperIndex; ++index) {
      tBoundAS3 = bounds[index];
      tBoundAS3.stabbingCount++;
    }

    for (index = lowerIndex; index < boundCount + 2; ++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;

      if (tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index;
      } else {
        proxy2.upperBounds[axis] = index;
      }
    }
  }

  ++this.m_proxyCount;

  for (i = 0; i < this.m_queryResultCount; ++i) {
    this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i]);
  }

  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return proxy;
};

b2BroadPhase.prototype.DestroyProxy = function (proxy_) {
  var proxy = proxy_;
  var tBound1;
  var tBound2;
  var boundCount = 2 * this.m_proxyCount;

  for (var axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    tBound1 = bounds[lowerIndex];
    var lowerValue = tBound1.value;
    tBound2 = bounds[upperIndex];
    var upperValue = tBound2.value;
    bounds.splice(upperIndex, 1);
    bounds.splice(lowerIndex, 1);
    bounds.push(tBound1);
    bounds.push(tBound2);
    var tEnd = boundCount - 2;

    for (var index = lowerIndex; index < tEnd; ++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;

      if (tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index;
      } else {
        proxy2.upperBounds[axis] = index;
      }
    }

    tEnd = upperIndex - 1;

    for (var index2 = lowerIndex; index2 < tEnd; ++index2) {
      tBound1 = bounds[index2];
      tBound1.stabbingCount--;
    }

    var ignore = new Array();
    this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis);
  }

  for (var i = 0; i < this.m_queryResultCount; ++i) {
    this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i]);
  }

  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  proxy.userData = null;
  proxy.overlapCount = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[1] = b2BroadPhase.b2_invalid;
  proxy.next = this.m_freeProxy;
  this.m_freeProxy = proxy;
  --this.m_proxyCount;
};

b2BroadPhase.prototype.MoveProxy = function (proxy_, aabb, displacement) {
  var proxy = proxy_;
  var as3arr;
  var as3int = 0;
  var axis = 0;
  var index = 0;
  var bound;
  var prevBound;
  var nextBound;
  var nextProxyId = 0;
  var nextProxy;

  if (proxy == null) {
    return;
  }

  if (aabb.IsValid() == false) {
    return;
  }

  var boundCount = 2 * this.m_proxyCount;
  var newValues = new b2BoundValues();
  this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
  var oldValues = new b2BoundValues();

  for (axis = 0; axis < 2; ++axis) {
    bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
    oldValues.lowerValues[axis] = bound.value;
    bound = this.m_bounds[axis][proxy.upperBounds[axis]];
    oldValues.upperValues[axis] = bound.value;
  }

  for (axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    var lowerValue = newValues.lowerValues[axis];
    var upperValue = newValues.upperValues[axis];
    bound = bounds[lowerIndex];
    var deltaLower = lowerValue - bound.value;
    bound.value = lowerValue;
    bound = bounds[upperIndex];
    var deltaUpper = upperValue - bound.value;
    bound.value = upperValue;

    if (deltaLower < 0) {
      index = lowerIndex;

      while (index > 0 && lowerValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        var prevProxy = prevBound.proxy;
        prevBound.stabbingCount++;

        if (prevBound.IsUpper() == true) {
          if (this.TestOverlapBound(newValues, prevProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, prevProxy);
          }

          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++;
        } else {
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--;
        }

        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        --index;
      }
    }

    if (deltaUpper > 0) {
      index = upperIndex;

      while (index < boundCount - 1 && bounds[parseInt(index + 1)].value <= upperValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount++;

        if (nextBound.IsLower() == true) {
          if (this.TestOverlapBound(newValues, nextProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, nextProxy);
          }

          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++;
        } else {
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--;
        }

        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++;
      }
    }

    if (deltaLower > 0) {
      index = lowerIndex;

      while (index < boundCount - 1 && bounds[parseInt(index + 1)].value <= lowerValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount--;

        if (nextBound.IsUpper()) {
          if (this.TestOverlapBound(oldValues, nextProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, nextProxy);
          }

          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--;
        } else {
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++;
        }

        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++;
      }
    }

    if (deltaUpper < 0) {
      index = upperIndex;

      while (index > 0 && upperValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        prevProxy = prevBound.proxy;
        prevBound.stabbingCount--;

        if (prevBound.IsLower() == true) {
          if (this.TestOverlapBound(oldValues, prevProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, prevProxy);
          }

          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--;
        } else {
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++;
        }

        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        index--;
      }
    }
  }
};

b2BroadPhase.prototype.UpdatePairs = function (callback) {
  this.m_pairManager.Commit(callback);
};

b2BroadPhase.prototype.TestOverlap = function (proxyA, proxyB) {
  var proxyA_ = proxyA;
  var proxyB_ = proxyB;

  if (proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]) {
    return false;
  }

  if (proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]) {
    return false;
  }

  if (proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]) {
    return false;
  }

  if (proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]) {
    return false;
  }

  return true;
};

b2BroadPhase.prototype.GetUserData = function (proxy) {
  return proxy.userData;
};

b2BroadPhase.prototype.GetFatAABB = function (proxy_) {
  var aabb = new b2AABB();
  var proxy = proxy_;
  aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
  aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
  aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
  aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
  return aabb;
};

b2BroadPhase.prototype.GetProxyCount = function () {
  return this.m_proxyCount;
};

b2BroadPhase.prototype.Query = function (callback, aabb) {
  var lowerValues = new Array();
  var upperValues = new Array();
  this.ComputeBounds(lowerValues, upperValues, aabb);
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array();
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array();
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);

  for (var i = 0; i < this.m_queryResultCount; ++i) {
    var proxy = this.m_queryResults[i];

    if (!callback(proxy)) {
      break;
    }
  }

  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
};

b2BroadPhase.prototype.Validate = function () {
  var pair;
  var proxy1;
  var proxy2;
  var overlap;

  for (var axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var boundCount = 2 * this.m_proxyCount;
    var stabbingCount = 0;

    for (var i = 0; i < boundCount; ++i) {
      var bound = bounds[i];

      if (bound.IsLower() == true) {
        stabbingCount++;
      } else {
        stabbingCount--;
      }
    }
  }
};

b2BroadPhase.prototype.Rebalance = function (iterations) {};

b2BroadPhase.prototype.RayCast = function (callback, input) {
  var subInput = new b2RayCastInput();
  subInput.p1.SetV(input.p1);
  subInput.p2.SetV(input.p2);
  subInput.maxFraction = input.maxFraction;
  var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
  var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
  var sx = dx < -Number.MIN_VALUE ? -1 : dx > Number.MIN_VALUE ? 1 : 0;
  var sy = dy < -Number.MIN_VALUE ? -1 : dy > Number.MIN_VALUE ? 1 : 0;
  var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
  var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
  var startValues = new Array();
  var startValues2 = new Array();
  startValues[0] = parseInt(p1x) & b2Settings.USHRT_MAX - 1;
  startValues[1] = parseInt(p1y) & b2Settings.USHRT_MAX - 1;
  startValues2[0] = startValues[0] + 1;
  startValues2[1] = startValues[1] + 1;
  var startIndices = new Array();
  var xIndex = 0;
  var yIndex = 0;
  var proxy;
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array();
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array();
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);

  if (sx >= 0) {
    xIndex = upperIndexOut[0] - 1;
  } else {
    xIndex = lowerIndexOut[0];
  }

  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);

  if (sy >= 0) {
    yIndex = upperIndexOut[0] - 1;
  } else {
    yIndex = lowerIndexOut[0];
  }

  for (var i = 0; i < this.m_queryResultCount; i++) {
    subInput.maxFraction = callback(this.m_queryResults[i], subInput);
  }

  for (;;) {
    var xProgress = 0;
    var yProgress = 0;
    xIndex += sx >= 0 ? 1 : -1;

    if (xIndex < 0 || xIndex >= this.m_proxyCount * 2) {
      break;
    }

    if (sx != 0) {
      xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx;
    }

    yIndex += sy >= 0 ? 1 : -1;

    if (yIndex < 0 || yIndex >= this.m_proxyCount * 2) {
      break;
    }

    if (sy != 0) {
      yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy;
    }

    for (;;) {
      if (sy == 0 || sx != 0 && xProgress < yProgress) {
        if (xProgress > subInput.maxFraction) {
          break;
        }

        if (sx > 0 ? this.m_bounds[0][xIndex].IsLower() : this.m_bounds[0][xIndex].IsUpper()) {
          proxy = this.m_bounds[0][xIndex].proxy;

          if (sy >= 0) {
            if (proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex) {
              subInput.maxFraction = callback(proxy, subInput);
            }
          } else {
            if (proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput);
            }
          }
        }

        if (subInput.maxFraction == 0) {
          break;
        }

        if (sx > 0) {
          xIndex++;

          if (xIndex == this.m_proxyCount * 2) {
            break;
          }
        } else {
          xIndex--;

          if (xIndex < 0) {
            break;
          }
        }

        xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx;
      } else {
        if (yProgress > subInput.maxFraction) {
          break;
        }

        if (sy > 0 ? this.m_bounds[1][yIndex].IsLower() : this.m_bounds[1][yIndex].IsUpper()) {
          proxy = this.m_bounds[1][yIndex].proxy;

          if (sx >= 0) {
            if (proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex) {
              subInput.maxFraction = callback(proxy, subInput);
            }
          } else {
            if (proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput);
            }
          }
        }

        if (subInput.maxFraction == 0) {
          break;
        }

        if (sy > 0) {
          yIndex++;

          if (yIndex == this.m_proxyCount * 2) {
            break;
          }
        } else {
          yIndex--;

          if (yIndex < 0) {
            break;
          }
        }

        yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy;
      }
    }

    break;
  }

  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return;
};

b2BroadPhase.prototype.TestOverlapBound = function (b, p) {
  for (var axis = 0; axis < 2; ++axis) {
    var bounds = this.m_bounds[axis];
    var bound = bounds[p.upperBounds[axis]];

    if (b.lowerValues[axis] > bound.value) {
      return false;
    }

    bound = bounds[p.lowerBounds[axis]];

    if (b.upperValues[axis] < bound.value) {
      return false;
    }
  }

  return true;
};

b2BroadPhase.prototype.m_pairManager = new b2PairManager();
b2BroadPhase.prototype.m_proxyPool = new Array();
b2BroadPhase.prototype.m_freeProxy = null;
b2BroadPhase.prototype.m_bounds = null;
b2BroadPhase.prototype.m_querySortKeys = new Array();
b2BroadPhase.prototype.m_queryResults = new Array();
b2BroadPhase.prototype.m_queryResultCount = 0;
b2BroadPhase.prototype.m_worldAABB = null;
b2BroadPhase.prototype.m_quantizationFactor = new b2Vec2();
b2BroadPhase.prototype.m_proxyCount = 0;
b2BroadPhase.prototype.m_timeStamp = 0;

var b2Manifold = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Manifold.prototype.__constructor = function () {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.m_points[i] = new b2ManifoldPoint();
  }

  this.m_localPlaneNormal = new b2Vec2();
  this.m_localPoint = new b2Vec2();
};

b2Manifold.prototype.__varz = function () {};

b2Manifold.e_circles = 1;
b2Manifold.e_faceA = 2;
b2Manifold.e_faceB = 4;

b2Manifold.prototype.Reset = function () {
  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.m_points[i].Reset();
  }

  this.m_localPlaneNormal.SetZero();
  this.m_localPoint.SetZero();
  this.m_type = 0;
  this.m_pointCount = 0;
};

b2Manifold.prototype.Set = function (m) {
  this.m_pointCount = m.m_pointCount;

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.m_points[i].Set(m.m_points[i]);
  }

  this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_type = m.m_type;
};

b2Manifold.prototype.Copy = function () {
  var copy = new b2Manifold();
  copy.Set(this);
  return copy;
};

b2Manifold.prototype.m_points = null;
b2Manifold.prototype.m_localPlaneNormal = null;
b2Manifold.prototype.m_localPoint = null;
b2Manifold.prototype.m_type = 0;
b2Manifold.prototype.m_pointCount = 0;

var b2CircleShape = function () {
  b2Shape.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2CircleShape.prototype, b2Shape.prototype);
b2CircleShape.prototype._super = b2Shape.prototype;

b2CircleShape.prototype.__constructor = function (radius) {
  this._super.__constructor.apply(this, []);

  this.m_type = b2Shape.e_circleShape;
  this.m_radius = radius;
};

b2CircleShape.prototype.__varz = function () {
  this.m_p = new b2Vec2();
};

b2CircleShape.prototype.Copy = function () {
  var s = new b2CircleShape();
  s.Set(this);
  return s;
};

b2CircleShape.prototype.Set = function (other) {
  this._super.Set.apply(this, [other]);

  if (isInstanceOf(other, b2CircleShape)) {
    var other2 = other;
    this.m_p.SetV(other2.m_p);
  }
};

b2CircleShape.prototype.TestPoint = function (transform, p) {
  var tMat = transform.R;
  var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  dX = p.x - dX;
  dY = p.y - dY;
  return dX * dX + dY * dY <= this.m_radius * this.m_radius;
};

b2CircleShape.prototype.RayCast = function (output, input, transform) {
  var tMat = transform.R;
  var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  var sX = input.p1.x - positionX;
  var sY = input.p1.y - positionY;
  var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  var c = sX * rX + sY * rY;
  var rr = rX * rX + rY * rY;
  var sigma = c * c - rr * b;

  if (sigma < 0 || rr < Number.MIN_VALUE) {
    return false;
  }

  var a = -(c + Math.sqrt(sigma));

  if (0 <= a && a <= input.maxFraction * rr) {
    a /= rr;
    output.fraction = a;
    output.normal.x = sX + a * rX;
    output.normal.y = sY + a * rY;
    output.normal.Normalize();
    return true;
  }

  return false;
};

b2CircleShape.prototype.ComputeAABB = function (aabb, transform) {
  var tMat = transform.R;
  var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
  aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius);
};

b2CircleShape.prototype.ComputeMass = function (massData, density) {
  massData.mass = density * b2Settings.b2_pi * this.m_radius * this.m_radius;
  massData.center.SetV(this.m_p);
  massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
};

b2CircleShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
  var p = b2Math.MulX(xf, this.m_p);
  var l = -(b2Math.Dot(normal, p) - offset);

  if (l < -this.m_radius + Number.MIN_VALUE) {
    return 0;
  }

  if (l > this.m_radius) {
    c.SetV(p);
    return Math.PI * this.m_radius * this.m_radius;
  }

  var r2 = this.m_radius * this.m_radius;
  var l2 = l * l;
  var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
  var com = -2 / 3 * Math.pow(r2 - l2, 1.5) / area;
  c.x = p.x + normal.x * com;
  c.y = p.y + normal.y * com;
  return area;
};

b2CircleShape.prototype.GetLocalPosition = function () {
  return this.m_p;
};

b2CircleShape.prototype.SetLocalPosition = function (position) {
  this.m_p.SetV(position);
};

b2CircleShape.prototype.GetRadius = function () {
  return this.m_radius;
};

b2CircleShape.prototype.SetRadius = function (radius) {
  this.m_radius = radius;
};

b2CircleShape.prototype.m_p = new b2Vec2();

var b2Joint = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Joint.prototype.__constructor = function (def) {
  b2Settings.b2Assert(def.bodyA != def.bodyB);
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;
  this.m_collideConnected = def.collideConnected;
  this.m_islandFlag = false;
  this.m_userData = def.userData;
};

b2Joint.prototype.__varz = function () {
  this.m_edgeA = new b2JointEdge();
  this.m_edgeB = new b2JointEdge();
  this.m_localCenterA = new b2Vec2();
  this.m_localCenterB = new b2Vec2();
};

b2Joint.Create = function (def, allocator) {
  var joint = null;

  switch (def.type) {
    case b2Joint.e_distanceJoint:
      joint = new b2DistanceJoint(def);
      break;

    case b2Joint.e_mouseJoint:
      joint = new b2MouseJoint(def);
      break;

    case b2Joint.e_prismaticJoint:
      joint = new b2PrismaticJoint(def);
      break;

    case b2Joint.e_revoluteJoint:
      joint = new b2RevoluteJoint(def);
      break;

    case b2Joint.e_pulleyJoint:
      joint = new b2PulleyJoint(def);
      break;

    case b2Joint.e_gearJoint:
      joint = new b2GearJoint(def);
      break;

    case b2Joint.e_lineJoint:
      joint = new b2LineJoint(def);
      break;

    case b2Joint.e_weldJoint:
      joint = new b2WeldJoint(def);
      break;

    case b2Joint.e_frictionJoint:
      joint = new b2FrictionJoint(def);
      break;

    default:
      break;
  }

  return joint;
};

b2Joint.Destroy = function (joint, allocator) {};

b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_lineJoint = 7;
b2Joint.e_weldJoint = 8;
b2Joint.e_frictionJoint = 9;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;

b2Joint.prototype.InitVelocityConstraints = function (step) {};

b2Joint.prototype.SolveVelocityConstraints = function (step) {};

b2Joint.prototype.FinalizeVelocityConstraints = function () {};

b2Joint.prototype.SolvePositionConstraints = function (baumgarte) {
  return false;
};

b2Joint.prototype.GetType = function () {
  return this.m_type;
};

b2Joint.prototype.GetAnchorA = function () {
  return null;
};

b2Joint.prototype.GetAnchorB = function () {
  return null;
};

b2Joint.prototype.GetReactionForce = function (inv_dt) {
  return null;
};

b2Joint.prototype.GetReactionTorque = function (inv_dt) {
  return 0;
};

b2Joint.prototype.GetBodyA = function () {
  return this.m_bodyA;
};

b2Joint.prototype.GetBodyB = function () {
  return this.m_bodyB;
};

b2Joint.prototype.GetNext = function () {
  return this.m_next;
};

b2Joint.prototype.GetUserData = function () {
  return this.m_userData;
};

b2Joint.prototype.SetUserData = function (data) {
  this.m_userData = data;
};

b2Joint.prototype.IsActive = function () {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
};

b2Joint.prototype.m_type = 0;
b2Joint.prototype.m_prev = null;
b2Joint.prototype.m_next = null;
b2Joint.prototype.m_edgeA = new b2JointEdge();
b2Joint.prototype.m_edgeB = new b2JointEdge();
b2Joint.prototype.m_bodyA = null;
b2Joint.prototype.m_bodyB = null;
b2Joint.prototype.m_islandFlag = null;
b2Joint.prototype.m_collideConnected = null;
b2Joint.prototype.m_userData = null;
b2Joint.prototype.m_localCenterA = new b2Vec2();
b2Joint.prototype.m_localCenterB = new b2Vec2();
b2Joint.prototype.m_invMassA = null;
b2Joint.prototype.m_invMassB = null;
b2Joint.prototype.m_invIA = null;
b2Joint.prototype.m_invIB = null;

var b2LineJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2LineJoint.prototype, b2Joint.prototype);
b2LineJoint.prototype._super = b2Joint.prototype;

b2LineJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero();
};

b2LineJoint.prototype.__varz = function () {
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_localXAxis1 = new b2Vec2();
  this.m_localYAxis1 = new b2Vec2();
  this.m_axis = new b2Vec2();
  this.m_perp = new b2Vec2();
  this.m_K = new b2Mat22();
  this.m_impulse = new b2Vec2();
};

b2LineJoint.prototype.InitVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;

  if (this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;

    if (b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits;
    } else {
      if (jointTransition <= this.m_lowerTranslation) {
        if (this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.y = 0;
        }
      } else {
        if (jointTransition >= this.m_upperTranslation) {
          if (this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.y = 0;
          }
        } else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.y = 0;
        }
      }
    }
  } else {
    this.m_limitState = b2Joint.e_inactiveLimit;
  }

  if (this.m_enableMotor == false) {
    this.m_motorImpulse = 0;
  }

  if (step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2;
  } else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
  }
};

b2LineJoint.prototype.SolveVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;

  if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  }

  var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;

  if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve(new b2Vec2(), -Cdot1, -Cdot2);
    this.m_impulse.Add(df);

    if (this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.y = b2Math.Max(this.m_impulse.y, 0);
    } else {
      if (this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.y = b2Math.Min(this.m_impulse.y, 0);
      }
    }

    var b = -Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
    var f2r;

    if (this.m_K.col1.x != 0) {
      f2r = b / this.m_K.col1.x + f1.x;
    } else {
      f2r = f1.x;
    }

    this.m_impulse.x = f2r;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y * this.m_a1;
    L2 = df.x * this.m_s2 + df.y * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  } else {
    var df2;

    if (this.m_K.col1.x != 0) {
      df2 = -Cdot1 / this.m_K.col1.x;
    } else {
      df2 = 0;
    }

    this.m_impulse.x += df2;
    PX = df2 * this.m_perp.x;
    PY = df2 * this.m_perp.y;
    L1 = df2 * this.m_s1;
    L2 = df2 * this.m_s2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  }

  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2;
};

b2LineJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;

  if (this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;

    if (b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true;
    } else {
      if (translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true;
      } else {
        if (translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true;
        }
      }
    }
  }

  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec2();
  var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1));
  angularError = 0;

  if (active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve(impulse, -C1, -C2);
  } else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var impulse1;

    if (k11 != 0) {
      impulse1 = -C1 / k11;
    } else {
      impulse1 = 0;
    }

    impulse.x = impulse1;
    impulse.y = 0;
  }

  var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;
};

b2LineJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2LineJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2LineJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y));
};

b2LineJoint.prototype.GetReactionTorque = function (inv_dt) {
  return inv_dt * this.m_impulse.y;
};

b2LineJoint.prototype.GetJointTranslation = function () {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation;
};

b2LineJoint.prototype.GetJointSpeed = function () {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed;
};

b2LineJoint.prototype.IsLimitEnabled = function () {
  return this.m_enableLimit;
};

b2LineJoint.prototype.EnableLimit = function (flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag;
};

b2LineJoint.prototype.GetLowerLimit = function () {
  return this.m_lowerTranslation;
};

b2LineJoint.prototype.GetUpperLimit = function () {
  return this.m_upperTranslation;
};

b2LineJoint.prototype.SetLimits = function (lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper;
};

b2LineJoint.prototype.IsMotorEnabled = function () {
  return this.m_enableMotor;
};

b2LineJoint.prototype.EnableMotor = function (flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag;
};

b2LineJoint.prototype.SetMotorSpeed = function (speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed;
};

b2LineJoint.prototype.GetMotorSpeed = function () {
  return this.m_motorSpeed;
};

b2LineJoint.prototype.SetMaxMotorForce = function (force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force;
};

b2LineJoint.prototype.GetMaxMotorForce = function () {
  return this.m_maxMotorForce;
};

b2LineJoint.prototype.GetMotorForce = function () {
  return this.m_motorImpulse;
};

b2LineJoint.prototype.m_localAnchor1 = new b2Vec2();
b2LineJoint.prototype.m_localAnchor2 = new b2Vec2();
b2LineJoint.prototype.m_localXAxis1 = new b2Vec2();
b2LineJoint.prototype.m_localYAxis1 = new b2Vec2();
b2LineJoint.prototype.m_axis = new b2Vec2();
b2LineJoint.prototype.m_perp = new b2Vec2();
b2LineJoint.prototype.m_s1 = null;
b2LineJoint.prototype.m_s2 = null;
b2LineJoint.prototype.m_a1 = null;
b2LineJoint.prototype.m_a2 = null;
b2LineJoint.prototype.m_K = new b2Mat22();
b2LineJoint.prototype.m_impulse = new b2Vec2();
b2LineJoint.prototype.m_motorMass = null;
b2LineJoint.prototype.m_motorImpulse = null;
b2LineJoint.prototype.m_lowerTranslation = null;
b2LineJoint.prototype.m_upperTranslation = null;
b2LineJoint.prototype.m_maxMotorForce = null;
b2LineJoint.prototype.m_motorSpeed = null;
b2LineJoint.prototype.m_enableLimit = null;
b2LineJoint.prototype.m_enableMotor = null;
b2LineJoint.prototype.m_limitState = 0;

var b2ContactSolver = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactSolver.prototype.__constructor = function () {};

b2ContactSolver.prototype.__varz = function () {
  this.m_step = new b2TimeStep();
  this.m_constraints = new Array();
};

b2ContactSolver.s_worldManifold = new b2WorldManifold();
b2ContactSolver.s_psm = new b2PositionSolverManifold();

b2ContactSolver.prototype.Initialize = function (step, contacts, contactCount, allocator) {
  var contact;
  this.m_step.Set(step);
  this.m_allocator = allocator;
  var i = 0;
  var tVec;
  var tMat;
  this.m_constraintCount = contactCount;

  while (this.m_constraints.length < this.m_constraintCount) {
    this.m_constraints[this.m_constraints.length] = new b2ContactConstraint();
  }

  for (i = 0; i < contactCount; ++i) {
    contact = contacts[i];
    var fixtureA = contact.m_fixtureA;
    var fixtureB = contact.m_fixtureB;
    var shapeA = fixtureA.m_shape;
    var shapeB = fixtureB.m_shape;
    var radiusA = shapeA.m_radius;
    var radiusB = shapeB.m_radius;
    var bodyA = fixtureA.m_body;
    var bodyB = fixtureB.m_body;
    var manifold = contact.GetManifold();
    var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
    var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
    var vAX = bodyA.m_linearVelocity.x;
    var vAY = bodyA.m_linearVelocity.y;
    var vBX = bodyB.m_linearVelocity.x;
    var vBY = bodyB.m_linearVelocity.y;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    b2Settings.b2Assert(manifold.m_pointCount > 0);
    b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
    var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
    var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
    var cc = this.m_constraints[i];
    cc.bodyA = bodyA;
    cc.bodyB = bodyB;
    cc.manifold = manifold;
    cc.normal.x = normalX;
    cc.normal.y = normalY;
    cc.pointCount = manifold.m_pointCount;
    cc.friction = friction;
    cc.restitution = restitution;
    cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
    cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
    cc.localPoint.x = manifold.m_localPoint.x;
    cc.localPoint.y = manifold.m_localPoint.y;
    cc.radius = radiusA + radiusB;
    cc.type = manifold.m_type;

    for (var k = 0; k < cc.pointCount; ++k) {
      var cp = manifold.m_points[k];
      var ccp = cc.points[k];
      ccp.normalImpulse = cp.m_normalImpulse;
      ccp.tangentImpulse = cp.m_tangentImpulse;
      ccp.localPoint.SetV(cp.m_localPoint);
      var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
      var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
      var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
      var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
      var rnA = rAX * normalY - rAY * normalX;
      var rnB = rBX * normalY - rBY * normalX;
      rnA *= rnA;
      rnB *= rnB;
      var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
      ccp.normalMass = 1 / kNormal;
      var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
      kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
      ccp.equalizedMass = 1 / kEqualized;
      var tangentX = normalY;
      var tangentY = -normalX;
      var rtA = rAX * tangentY - rAY * tangentX;
      var rtB = rBX * tangentY - rBY * tangentX;
      rtA *= rtA;
      rtB *= rtB;
      var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
      ccp.tangentMass = 1 / kTangent;
      ccp.velocityBias = 0;
      var tX = vBX + -wB * rBY - vAX - -wA * rAY;
      var tY = vBY + wB * rBX - vAY - wA * rAX;
      var vRel = cc.normal.x * tX + cc.normal.y * tY;

      if (vRel < -b2Settings.b2_velocityThreshold) {
        ccp.velocityBias += -cc.restitution * vRel;
      }
    }

    if (cc.pointCount == 2) {
      var ccp1 = cc.points[0];
      var ccp2 = cc.points[1];
      var invMassA = bodyA.m_invMass;
      var invIA = bodyA.m_invI;
      var invMassB = bodyB.m_invMass;
      var invIB = bodyB.m_invI;
      var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
      var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
      var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
      var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
      var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
      var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
      var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
      var k_maxConditionNumber = 100;

      if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
        cc.K.col1.Set(k11, k12);
        cc.K.col2.Set(k12, k22);
        cc.K.GetInverse(cc.normalMass);
      } else {
        cc.pointCount = 1;
      }
    }
  }
};

b2ContactSolver.prototype.InitVelocityConstraints = function (step) {
  var tVec;
  var tVec2;
  var tMat;

  for (var i = 0; i < this.m_constraintCount; ++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var tX;
    var j = 0;
    var tCount = 0;

    if (step.warmStarting) {
      tCount = c.pointCount;

      for (j = 0; j < tCount; ++j) {
        var ccp = c.points[j];
        ccp.normalImpulse *= step.dtRatio;
        ccp.tangentImpulse *= step.dtRatio;
        var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
        var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
        bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
        bodyA.m_linearVelocity.x -= invMassA * PX;
        bodyA.m_linearVelocity.y -= invMassA * PY;
        bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
        bodyB.m_linearVelocity.x += invMassB * PX;
        bodyB.m_linearVelocity.y += invMassB * PY;
      }
    } else {
      tCount = c.pointCount;

      for (j = 0; j < tCount; ++j) {
        var ccp2 = c.points[j];
        ccp2.normalImpulse = 0;
        ccp2.tangentImpulse = 0;
      }
    }
  }
};

b2ContactSolver.prototype.SolveVelocityConstraints = function () {
  var j = 0;
  var ccp;
  var rAX;
  var rAY;
  var rBX;
  var rBY;
  var dvX;
  var dvY;
  var vn;
  var vt;
  var lambda;
  var maxFriction;
  var newImpulse;
  var PX;
  var PY;
  var dX;
  var dY;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var tMat;
  var tVec;

  for (var i = 0; i < this.m_constraintCount; ++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    var vA = bodyA.m_linearVelocity;
    var vB = bodyB.m_linearVelocity;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var friction = c.friction;
    var tX;

    for (j = 0; j < c.pointCount; j++) {
      ccp = c.points[j];
      dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vt = dvX * tangentX + dvY * tangentY;
      lambda = ccp.tangentMass * -vt;
      maxFriction = friction * ccp.normalImpulse;
      newImpulse = b2Math.Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
      lambda = newImpulse - ccp.tangentImpulse;
      PX = lambda * tangentX;
      PY = lambda * tangentY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.tangentImpulse = newImpulse;
    }

    var tCount = c.pointCount;

    if (c.pointCount == 1) {
      ccp = c.points[0];
      dvX = vB.x + -wB * ccp.rB.y - vA.x - -wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vn = dvX * normalX + dvY * normalY;
      lambda = -ccp.normalMass * (vn - ccp.velocityBias);
      newImpulse = ccp.normalImpulse + lambda;
      newImpulse = newImpulse > 0 ? newImpulse : 0;
      lambda = newImpulse - ccp.normalImpulse;
      PX = lambda * normalX;
      PY = lambda * normalY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.normalImpulse = newImpulse;
    } else {
      var cp1 = c.points[0];
      var cp2 = c.points[1];
      var aX = cp1.normalImpulse;
      var aY = cp2.normalImpulse;
      var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
      var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
      var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
      var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
      var vn1 = dv1X * normalX + dv1Y * normalY;
      var vn2 = dv2X * normalX + dv2Y * normalY;
      var bX = vn1 - cp1.velocityBias;
      var bY = vn2 - cp2.velocityBias;
      tMat = c.K;
      bX -= tMat.col1.x * aX + tMat.col2.x * aY;
      bY -= tMat.col1.y * aX + tMat.col2.y * aY;
      var k_errorTol = 0.0010;

      for (;;) {
        tMat = c.normalMass;
        var xX = -(tMat.col1.x * bX + tMat.col2.x * bY);
        var xY = -(tMat.col1.y * bX + tMat.col2.y * bY);

        if (xX >= 0 && xY >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break;
        }

        xX = -cp1.normalMass * bX;
        xY = 0;
        vn1 = 0;
        vn2 = c.K.col1.y * xX + bY;

        if (xX >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break;
        }

        xX = 0;
        xY = -cp2.normalMass * bY;
        vn1 = c.K.col2.x * xY + bX;
        vn2 = 0;

        if (xY >= 0 && vn1 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break;
        }

        xX = 0;
        xY = 0;
        vn1 = bX;
        vn2 = bY;

        if (vn1 >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break;
        }

        break;
      }
    }

    bodyA.m_angularVelocity = wA;
    bodyB.m_angularVelocity = wB;
  }
};

b2ContactSolver.prototype.FinalizeVelocityConstraints = function () {
  for (var i = 0; i < this.m_constraintCount; ++i) {
    var c = this.m_constraints[i];
    var m = c.manifold;

    for (var j = 0; j < c.pointCount; ++j) {
      var point1 = m.m_points[j];
      var point2 = c.points[j];
      point1.m_normalImpulse = point2.normalImpulse;
      point1.m_tangentImpulse = point2.tangentImpulse;
    }
  }
};

b2ContactSolver.prototype.SolvePositionConstraints = function (baumgarte) {
  var minSeparation = 0;

  for (var i = 0; i < this.m_constraintCount; i++) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_mass * bodyA.m_invMass;
    var invIA = bodyA.m_mass * bodyA.m_invI;
    var invMassB = bodyB.m_mass * bodyB.m_invMass;
    var invIB = bodyB.m_mass * bodyB.m_invI;
    b2ContactSolver.s_psm.Initialize(c);
    var normal = b2ContactSolver.s_psm.m_normal;

    for (var j = 0; j < c.pointCount; j++) {
      var ccp = c.points[j];
      var point = b2ContactSolver.s_psm.m_points[j];
      var separation = b2ContactSolver.s_psm.m_separations[j];
      var rAX = point.x - bodyA.m_sweep.c.x;
      var rAY = point.y - bodyA.m_sweep.c.y;
      var rBX = point.x - bodyB.m_sweep.c.x;
      var rBY = point.y - bodyB.m_sweep.c.y;
      minSeparation = minSeparation < separation ? minSeparation : separation;
      var C = b2Math.Clamp(baumgarte * (separation + b2Settings.b2_linearSlop), -b2Settings.b2_maxLinearCorrection, 0);
      var impulse = -ccp.equalizedMass * C;
      var PX = impulse * normal.x;
      var PY = impulse * normal.y;
      bodyA.m_sweep.c.x -= invMassA * PX;
      bodyA.m_sweep.c.y -= invMassA * PY;
      bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
      bodyA.SynchronizeTransform();
      bodyB.m_sweep.c.x += invMassB * PX;
      bodyB.m_sweep.c.y += invMassB * PY;
      bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
      bodyB.SynchronizeTransform();
    }
  }

  return minSeparation > -1.5 * b2Settings.b2_linearSlop;
};

b2ContactSolver.prototype.m_step = new b2TimeStep();
b2ContactSolver.prototype.m_allocator = null;
b2ContactSolver.prototype.m_constraints = new Array();
b2ContactSolver.prototype.m_constraintCount = 0;

var b2Simplex = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Simplex.prototype.__constructor = function () {
  this.m_vertices[0] = this.m_v1;
  this.m_vertices[1] = this.m_v2;
  this.m_vertices[2] = this.m_v3;
};

b2Simplex.prototype.__varz = function () {
  this.m_v1 = new b2SimplexVertex();
  this.m_v2 = new b2SimplexVertex();
  this.m_v3 = new b2SimplexVertex();
  this.m_vertices = new Array(3);
};

b2Simplex.prototype.ReadCache = function (cache, proxyA, transformA, proxyB, transformB) {
  b2Settings.b2Assert(0 <= cache.count && cache.count <= 3);
  var wALocal;
  var wBLocal;
  this.m_count = cache.count;
  var vertices = this.m_vertices;

  for (var i = 0; i < this.m_count; i++) {
    var v = vertices[i];
    v.indexA = cache.indexA[i];
    v.indexB = cache.indexB[i];
    wALocal = proxyA.GetVertex(v.indexA);
    wBLocal = proxyB.GetVertex(v.indexB);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    v.a = 0;
  }

  if (this.m_count > 1) {
    var metric1 = cache.metric;
    var metric2 = this.GetMetric();

    if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
      this.m_count = 0;
    }
  }

  if (this.m_count == 0) {
    v = vertices[0];
    v.indexA = 0;
    v.indexB = 0;
    wALocal = proxyA.GetVertex(0);
    wBLocal = proxyB.GetVertex(0);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    this.m_count = 1;
  }
};

b2Simplex.prototype.WriteCache = function (cache) {
  cache.metric = this.GetMetric();
  cache.count = parseInt(this.m_count);
  var vertices = this.m_vertices;

  for (var i = 0; i < this.m_count; i++) {
    cache.indexA[i] = parseInt(vertices[i].indexA);
    cache.indexB[i] = parseInt(vertices[i].indexB);
  }
};

b2Simplex.prototype.GetSearchDirection = function () {
  switch (this.m_count) {
    case 1:
      return this.m_v1.w.GetNegative();

    case 2:
      var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
      var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());

      if (sgn > 0) {
        return b2Math.CrossFV(1, e12);
      } else {
        return b2Math.CrossVF(e12, 1);
      }

      ;

    default:
      b2Settings.b2Assert(false);
      return new b2Vec2();
  }
};

b2Simplex.prototype.GetClosestPoint = function () {
  switch (this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return new b2Vec2();

    case 1:
      return this.m_v1.w;

    case 2:
      return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);

    default:
      b2Settings.b2Assert(false);
      return new b2Vec2();
  }
};

b2Simplex.prototype.GetWitnessPoints = function (pA, pB) {
  switch (this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      break;

    case 1:
      pA.SetV(this.m_v1.wA);
      pB.SetV(this.m_v1.wB);
      break;

    case 2:
      pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
      pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
      pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
      pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
      break;

    case 3:
      pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
      pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
      break;

    default:
      b2Settings.b2Assert(false);
      break;
  }
};

b2Simplex.prototype.GetMetric = function () {
  switch (this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return 0;

    case 1:
      return 0;

    case 2:
      return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();

    case 3:
      return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));

    default:
      b2Settings.b2Assert(false);
      return 0;
  }
};

b2Simplex.prototype.Solve2 = function () {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var d12_2 = -(w1.x * e12.x + w1.y * e12.y);

  if (d12_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return;
  }

  var d12_1 = w2.x * e12.x + w2.y * e12.y;

  if (d12_1 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return;
  }

  var inv_d12 = 1 / (d12_1 + d12_2);
  this.m_v1.a = d12_1 * inv_d12;
  this.m_v2.a = d12_2 * inv_d12;
  this.m_count = 2;
};

b2Simplex.prototype.Solve3 = function () {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var w3 = this.m_v3.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var w1e12 = b2Math.Dot(w1, e12);
  var w2e12 = b2Math.Dot(w2, e12);
  var d12_1 = w2e12;
  var d12_2 = -w1e12;
  var e13 = b2Math.SubtractVV(w3, w1);
  var w1e13 = b2Math.Dot(w1, e13);
  var w3e13 = b2Math.Dot(w3, e13);
  var d13_1 = w3e13;
  var d13_2 = -w1e13;
  var e23 = b2Math.SubtractVV(w3, w2);
  var w2e23 = b2Math.Dot(w2, e23);
  var w3e23 = b2Math.Dot(w3, e23);
  var d23_1 = w3e23;
  var d23_2 = -w2e23;
  var n123 = b2Math.CrossVV(e12, e13);
  var d123_1 = n123 * b2Math.CrossVV(w2, w3);
  var d123_2 = n123 * b2Math.CrossVV(w3, w1);
  var d123_3 = n123 * b2Math.CrossVV(w1, w2);

  if (d12_2 <= 0 && d13_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return;
  }

  if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
    return;
  }

  if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
    var inv_d13 = 1 / (d13_1 + d13_2);
    this.m_v1.a = d13_1 * inv_d13;
    this.m_v3.a = d13_2 * inv_d13;
    this.m_count = 2;
    this.m_v2.Set(this.m_v3);
    return;
  }

  if (d12_1 <= 0 && d23_2 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return;
  }

  if (d13_1 <= 0 && d23_1 <= 0) {
    this.m_v3.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v3);
    return;
  }

  if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
    var inv_d23 = 1 / (d23_1 + d23_2);
    this.m_v2.a = d23_1 * inv_d23;
    this.m_v3.a = d23_2 * inv_d23;
    this.m_count = 2;
    this.m_v1.Set(this.m_v3);
    return;
  }

  var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
  this.m_v1.a = d123_1 * inv_d123;
  this.m_v2.a = d123_2 * inv_d123;
  this.m_v3.a = d123_3 * inv_d123;
  this.m_count = 3;
};

b2Simplex.prototype.m_v1 = new b2SimplexVertex();
b2Simplex.prototype.m_v2 = new b2SimplexVertex();
b2Simplex.prototype.m_v3 = new b2SimplexVertex();
b2Simplex.prototype.m_vertices = new Array(3);
b2Simplex.prototype.m_count = 0;

var b2WeldJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2WeldJoint.prototype, b2Joint.prototype);
b2WeldJoint.prototype._super = b2Joint.prototype;

b2WeldJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_mass = new b2Mat33();
};

b2WeldJoint.prototype.__varz = function () {
  this.m_localAnchorA = new b2Vec2();
  this.m_localAnchorB = new b2Vec2();
  this.m_impulse = new b2Vec3();
  this.m_mass = new b2Mat33();
};

b2WeldJoint.prototype.InitVelocityConstraints = function (step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;

  if (step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_impulse.z *= step.dtRatio;
    bA.m_linearVelocity.x -= mA * this.m_impulse.x;
    bA.m_linearVelocity.y -= mA * this.m_impulse.y;
    bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
    bB.m_linearVelocity.x += mB * this.m_impulse.x;
    bB.m_linearVelocity.y += mB * this.m_impulse.y;
    bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z);
  } else {
    this.m_impulse.SetZero();
  }
};

b2WeldJoint.prototype.SolveVelocityConstraints = function (step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
  var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
  var Cdot2 = wB - wA;
  var impulse = new b2Vec3();
  this.m_mass.Solve33(impulse, -Cdot1X, -Cdot1Y, -Cdot2);
  this.m_impulse.Add(impulse);
  vA.x -= mA * impulse.x;
  vA.y -= mA * impulse.y;
  wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  vB.x += mB * impulse.x;
  vB.y += mB * impulse.y;
  wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB;
};

b2WeldJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
  var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
  var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
  var angularError = b2Math.Abs(C2);

  if (positionError > k_allowedStretch) {
    iA *= 1;
    iB *= 1;
  }

  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  var impulse = new b2Vec3();
  this.m_mass.Solve33(impulse, -C1X, -C1Y, -C2);
  bA.m_sweep.c.x -= mA * impulse.x;
  bA.m_sweep.c.y -= mA * impulse.y;
  bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  bB.m_sweep.c.x += mB * impulse.x;
  bB.m_sweep.c.y += mB * impulse.y;
  bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;
};

b2WeldJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};

b2WeldJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};

b2WeldJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};

b2WeldJoint.prototype.GetReactionTorque = function (inv_dt) {
  return inv_dt * this.m_impulse.z;
};

b2WeldJoint.prototype.m_localAnchorA = new b2Vec2();
b2WeldJoint.prototype.m_localAnchorB = new b2Vec2();
b2WeldJoint.prototype.m_referenceAngle = null;
b2WeldJoint.prototype.m_impulse = new b2Vec3();
b2WeldJoint.prototype.m_mass = new b2Mat33();

var b2Math = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Math.prototype.__constructor = function () {};

b2Math.prototype.__varz = function () {};

b2Math.IsValid = function (x) {
  return isFinite(x);
};

b2Math.Dot = function (a, b) {
  return a.x * b.x + a.y * b.y;
};

b2Math.CrossVV = function (a, b) {
  return a.x * b.y - a.y * b.x;
};

b2Math.CrossVF = function (a, s) {
  var v = new b2Vec2(s * a.y, -s * a.x);
  return v;
};

b2Math.CrossFV = function (s, a) {
  var v = new b2Vec2(-s * a.y, s * a.x);
  return v;
};

b2Math.MulMV = function (A, v) {
  var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u;
};

b2Math.MulTMV = function (A, v) {
  var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
  return u;
};

b2Math.MulX = function (T, v) {
  var a = b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a;
};

b2Math.MulXT = function (T, v) {
  var a = b2Math.SubtractVV(v, T.position);
  var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
  a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
  a.x = tX;
  return a;
};

b2Math.AddVV = function (a, b) {
  var v = new b2Vec2(a.x + b.x, a.y + b.y);
  return v;
};

b2Math.SubtractVV = function (a, b) {
  var v = new b2Vec2(a.x - b.x, a.y - b.y);
  return v;
};

b2Math.Distance = function (a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(cX * cX + cY * cY);
};

b2Math.DistanceSquared = function (a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return cX * cX + cY * cY;
};

b2Math.MulFV = function (s, a) {
  var v = new b2Vec2(s * a.x, s * a.y);
  return v;
};

b2Math.AddMM = function (A, B) {
  var C = b2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
  return C;
};

b2Math.MulMM = function (A, B) {
  var C = b2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
  return C;
};

b2Math.MulTMM = function (A, B) {
  var c1 = new b2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
  var c2 = new b2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
  var C = b2Mat22.FromVV(c1, c2);
  return C;
};

b2Math.Abs = function (a) {
  return a > 0 ? a : -a;
};

b2Math.AbsV = function (a) {
  var b = new b2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
  return b;
};

b2Math.AbsM = function (A) {
  var B = b2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
  return B;
};

b2Math.Min = function (a, b) {
  return a < b ? a : b;
};

b2Math.MinV = function (a, b) {
  var c = new b2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
  return c;
};

b2Math.Max = function (a, b) {
  return a > b ? a : b;
};

b2Math.MaxV = function (a, b) {
  var c = new b2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
  return c;
};

b2Math.Clamp = function (a, low, high) {
  return a < low ? low : a > high ? high : a;
};

b2Math.ClampV = function (a, low, high) {
  return b2Math.MaxV(low, b2Math.MinV(a, high));
};

b2Math.Swap = function (a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp;
};

b2Math.Random = function () {
  return Math.random() * 2 - 1;
};

b2Math.RandomRange = function (lo, hi) {
  var r = Math.random();
  r = (hi - lo) * r + lo;
  return r;
};

b2Math.NextPowerOfTwo = function (x) {
  x |= x >> 1 & 2147483647;
  x |= x >> 2 & 1073741823;
  x |= x >> 4 & 268435455;
  x |= x >> 8 & 16777215;
  x |= x >> 16 & 65535;
  return x + 1;
};

b2Math.IsPowerOfTwo = function (x) {
  var result = x > 0 && (x & x - 1) == 0;
  return result;
};

b2Math.b2Vec2_zero = new b2Vec2(0, 0);
b2Math.b2Mat22_identity = b2Mat22.FromVV(new b2Vec2(1, 0), new b2Vec2(0, 1));
b2Math.b2Transform_identity = new b2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);

var b2PulleyJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PulleyJoint.prototype, b2Joint.prototype);
b2PulleyJoint.prototype._super = b2Joint.prototype;

b2PulleyJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  var tMat;
  var tX;
  var tY;
  this.m_ground = this.m_bodyA.m_world.m_groundBody;
  this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
  this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_ratio = def.ratio;
  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
  this.m_maxLength1 = b2Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
  this.m_maxLength2 = b2Math.Min(def.maxLengthB, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
  this.m_impulse = 0;
  this.m_limitImpulse1 = 0;
  this.m_limitImpulse2 = 0;
};

b2PulleyJoint.prototype.__varz = function () {
  this.m_groundAnchor1 = new b2Vec2();
  this.m_groundAnchor2 = new b2Vec2();
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_u1 = new b2Vec2();
  this.m_u2 = new b2Vec2();
};

b2PulleyJoint.b2_minPulleyLength = 2;

b2PulleyJoint.prototype.InitVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  this.m_u1.Set(p1X - s1X, p1Y - s1Y);
  this.m_u2.Set(p2X - s2X, p2Y - s2Y);
  var length1 = this.m_u1.Length();
  var length2 = this.m_u2.Length();

  if (length1 > b2Settings.b2_linearSlop) {
    this.m_u1.Multiply(1 / length1);
  } else {
    this.m_u1.SetZero();
  }

  if (length2 > b2Settings.b2_linearSlop) {
    this.m_u2.Multiply(1 / length2);
  } else {
    this.m_u2.SetZero();
  }

  var C = this.m_constant - length1 - this.m_ratio * length2;

  if (C > 0) {
    this.m_state = b2Joint.e_inactiveLimit;
    this.m_impulse = 0;
  } else {
    this.m_state = b2Joint.e_atUpperLimit;
  }

  if (length1 < this.m_maxLength1) {
    this.m_limitState1 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse1 = 0;
  } else {
    this.m_limitState1 = b2Joint.e_atUpperLimit;
  }

  if (length2 < this.m_maxLength2) {
    this.m_limitState2 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse2 = 0;
  } else {
    this.m_limitState2 = b2Joint.e_atUpperLimit;
  }

  var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
  var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
  this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
  this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
  this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
  this.m_limitMass1 = 1 / this.m_limitMass1;
  this.m_limitMass2 = 1 / this.m_limitMass2;
  this.m_pulleyMass = 1 / this.m_pulleyMass;

  if (step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    this.m_limitImpulse1 *= step.dtRatio;
    this.m_limitImpulse2 *= step.dtRatio;
    var P1X = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
    var P1Y = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
    var P2X = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
    var P2Y = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
  } else {
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0;
  }
};

b2PulleyJoint.prototype.SolveVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X;
  var v1Y;
  var v2X;
  var v2Y;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var Cdot;
  var impulse;
  var oldImpulse;

  if (this.m_state == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = this.m_pulleyMass * -Cdot;
    oldImpulse = this.m_impulse;
    this.m_impulse = b2Math.Max(0, this.m_impulse + impulse);
    impulse = this.m_impulse - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    P2X = -this.m_ratio * impulse * this.m_u2.x;
    P2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
  }

  if (this.m_limitState1 == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
    impulse = -this.m_limitMass1 * Cdot;
    oldImpulse = this.m_limitImpulse1;
    this.m_limitImpulse1 = b2Math.Max(0, this.m_limitImpulse1 + impulse);
    impulse = this.m_limitImpulse1 - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
  }

  if (this.m_limitState2 == b2Joint.e_atUpperLimit) {
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = -this.m_limitMass2 * Cdot;
    oldImpulse = this.m_limitImpulse2;
    this.m_limitImpulse2 = b2Math.Max(0, this.m_limitImpulse2 + impulse);
    impulse = this.m_limitImpulse2 - oldImpulse;
    P2X = -impulse * this.m_u2.x;
    P2Y = -impulse * this.m_u2.y;
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X);
  }
};

b2PulleyJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var p1X;
  var p1Y;
  var p2X;
  var p2Y;
  var length1;
  var length2;
  var C;
  var impulse;
  var oldImpulse;
  var oldLimitPositionImpulse;
  var tX;
  var linearError = 0;

  if (this.m_state == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length1 = this.m_u1.Length();
    length2 = this.m_u2.Length();

    if (length1 > b2Settings.b2_linearSlop) {
      this.m_u1.Multiply(1 / length1);
    } else {
      this.m_u1.SetZero();
    }

    if (length2 > b2Settings.b2_linearSlop) {
      this.m_u2.Multiply(1 / length2);
    } else {
      this.m_u2.SetZero();
    }

    C = this.m_constant - length1 - this.m_ratio * length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_pulleyMass * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    p2X = -this.m_ratio * impulse * this.m_u2.x;
    p2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
  }

  if (this.m_limitState1 == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    length1 = this.m_u1.Length();

    if (length1 > b2Settings.b2_linearSlop) {
      this.m_u1.x *= 1 / length1;
      this.m_u1.y *= 1 / length1;
    } else {
      this.m_u1.SetZero();
    }

    C = this.m_maxLength1 - length1;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass1 * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bA.SynchronizeTransform();
  }

  if (this.m_limitState2 == b2Joint.e_atUpperLimit) {
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length2 = this.m_u2.Length();

    if (length2 > b2Settings.b2_linearSlop) {
      this.m_u2.x *= 1 / length2;
      this.m_u2.y *= 1 / length2;
    } else {
      this.m_u2.SetZero();
    }

    C = this.m_maxLength2 - length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass2 * C;
    p2X = -impulse * this.m_u2.x;
    p2Y = -impulse * this.m_u2.y;
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bB.SynchronizeTransform();
  }

  return linearError < b2Settings.b2_linearSlop;
};

b2PulleyJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2PulleyJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2PulleyJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y);
};

b2PulleyJoint.prototype.GetReactionTorque = function (inv_dt) {
  return 0;
};

b2PulleyJoint.prototype.GetGroundAnchorA = function () {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor1);
  return a;
};

b2PulleyJoint.prototype.GetGroundAnchorB = function () {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor2);
  return a;
};

b2PulleyJoint.prototype.GetLength1 = function () {
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY);
};

b2PulleyJoint.prototype.GetLength2 = function () {
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY);
};

b2PulleyJoint.prototype.GetRatio = function () {
  return this.m_ratio;
};

b2PulleyJoint.prototype.m_ground = null;
b2PulleyJoint.prototype.m_groundAnchor1 = new b2Vec2();
b2PulleyJoint.prototype.m_groundAnchor2 = new b2Vec2();
b2PulleyJoint.prototype.m_localAnchor1 = new b2Vec2();
b2PulleyJoint.prototype.m_localAnchor2 = new b2Vec2();
b2PulleyJoint.prototype.m_u1 = new b2Vec2();
b2PulleyJoint.prototype.m_u2 = new b2Vec2();
b2PulleyJoint.prototype.m_constant = null;
b2PulleyJoint.prototype.m_ratio = null;
b2PulleyJoint.prototype.m_maxLength1 = null;
b2PulleyJoint.prototype.m_maxLength2 = null;
b2PulleyJoint.prototype.m_pulleyMass = null;
b2PulleyJoint.prototype.m_limitMass1 = null;
b2PulleyJoint.prototype.m_limitMass2 = null;
b2PulleyJoint.prototype.m_impulse = null;
b2PulleyJoint.prototype.m_limitImpulse1 = null;
b2PulleyJoint.prototype.m_limitImpulse2 = null;
b2PulleyJoint.prototype.m_state = 0;
b2PulleyJoint.prototype.m_limitState1 = 0;
b2PulleyJoint.prototype.m_limitState2 = 0;

var b2PrismaticJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PrismaticJoint.prototype, b2Joint.prototype);
b2PrismaticJoint.prototype._super = b2Joint.prototype;

b2PrismaticJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_refAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero();
};

b2PrismaticJoint.prototype.__varz = function () {
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_localXAxis1 = new b2Vec2();
  this.m_localYAxis1 = new b2Vec2();
  this.m_axis = new b2Vec2();
  this.m_perp = new b2Vec2();
  this.m_K = new b2Mat33();
  this.m_impulse = new b2Vec3();
};

b2PrismaticJoint.prototype.InitVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;

  if (this.m_motorMass > Number.MIN_VALUE) {
    this.m_motorMass = 1 / this.m_motorMass;
  }

  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
  this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = i1 + i2;
  this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
  this.m_K.col3.x = this.m_K.col1.z;
  this.m_K.col3.y = this.m_K.col2.z;
  this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;

  if (this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;

    if (b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits;
    } else {
      if (jointTransition <= this.m_lowerTranslation) {
        if (this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.z = 0;
        }
      } else {
        if (jointTransition >= this.m_upperTranslation) {
          if (this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.z = 0;
          }
        } else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0;
        }
      }
    }
  } else {
    this.m_limitState = b2Joint.e_inactiveLimit;
  }

  if (this.m_enableMotor == false) {
    this.m_motorImpulse = 0;
  }

  if (step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2;
  } else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
  }
};

b2PrismaticJoint.prototype.SolveVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;

  if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  }

  var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  var Cdot1Y = w2 - w1;

  if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve33(new b2Vec3(), -Cdot1X, -Cdot1Y, -Cdot2);
    this.m_impulse.Add(df);

    if (this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.z = b2Math.Max(this.m_impulse.z, 0);
    } else {
      if (this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.z = b2Math.Min(this.m_impulse.z, 0);
      }
    }

    var bX = -Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
    var bY = -Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
    var f2r = this.m_K.Solve22(new b2Vec2(), bX, bY);
    f2r.x += f1.x;
    f2r.y += f1.y;
    this.m_impulse.x = f2r.x;
    this.m_impulse.y = f2r.y;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;
    PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  } else {
    var df2 = this.m_K.Solve22(new b2Vec2(), -Cdot1X, -Cdot1Y);
    this.m_impulse.x += df2.x;
    this.m_impulse.y += df2.y;
    PX = df2.x * this.m_perp.x;
    PY = df2.x * this.m_perp.y;
    L1 = df2.x * this.m_s1 + df2.y;
    L2 = df2.x * this.m_s2 + df2.y;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2;
  }

  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2;
};

b2PrismaticJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;

  if (this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;

    if (b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true;
    } else {
      if (translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true;
      } else {
        if (translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true;
        }
      }
    }
  }

  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec3();
  var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
  var C1Y = a2 - a1 - this.m_refAngle;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1X));
  angularError = b2Math.Abs(C1Y);

  if (active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve33(impulse, -C1X, -C1Y, -C2);
  } else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var k12 = i1 * this.m_s1 + i2 * this.m_s2;
    var k22 = i1 + i2;
    this.m_K.col1.Set(k11, k12, 0);
    this.m_K.col2.Set(k12, k22, 0);
    var impulse1 = this.m_K.Solve22(new b2Vec2(), -C1X, -C1Y);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0;
  }

  var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;
};

b2PrismaticJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2PrismaticJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2PrismaticJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y));
};

b2PrismaticJoint.prototype.GetReactionTorque = function (inv_dt) {
  return inv_dt * this.m_impulse.y;
};

b2PrismaticJoint.prototype.GetJointTranslation = function () {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation;
};

b2PrismaticJoint.prototype.GetJointSpeed = function () {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed;
};

b2PrismaticJoint.prototype.IsLimitEnabled = function () {
  return this.m_enableLimit;
};

b2PrismaticJoint.prototype.EnableLimit = function (flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag;
};

b2PrismaticJoint.prototype.GetLowerLimit = function () {
  return this.m_lowerTranslation;
};

b2PrismaticJoint.prototype.GetUpperLimit = function () {
  return this.m_upperTranslation;
};

b2PrismaticJoint.prototype.SetLimits = function (lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper;
};

b2PrismaticJoint.prototype.IsMotorEnabled = function () {
  return this.m_enableMotor;
};

b2PrismaticJoint.prototype.EnableMotor = function (flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag;
};

b2PrismaticJoint.prototype.SetMotorSpeed = function (speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed;
};

b2PrismaticJoint.prototype.GetMotorSpeed = function () {
  return this.m_motorSpeed;
};

b2PrismaticJoint.prototype.SetMaxMotorForce = function (force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force;
};

b2PrismaticJoint.prototype.GetMotorForce = function () {
  return this.m_motorImpulse;
};

b2PrismaticJoint.prototype.m_localAnchor1 = new b2Vec2();
b2PrismaticJoint.prototype.m_localAnchor2 = new b2Vec2();
b2PrismaticJoint.prototype.m_localXAxis1 = new b2Vec2();
b2PrismaticJoint.prototype.m_localYAxis1 = new b2Vec2();
b2PrismaticJoint.prototype.m_refAngle = null;
b2PrismaticJoint.prototype.m_axis = new b2Vec2();
b2PrismaticJoint.prototype.m_perp = new b2Vec2();
b2PrismaticJoint.prototype.m_s1 = null;
b2PrismaticJoint.prototype.m_s2 = null;
b2PrismaticJoint.prototype.m_a1 = null;
b2PrismaticJoint.prototype.m_a2 = null;
b2PrismaticJoint.prototype.m_K = new b2Mat33();
b2PrismaticJoint.prototype.m_impulse = new b2Vec3();
b2PrismaticJoint.prototype.m_motorMass = null;
b2PrismaticJoint.prototype.m_motorImpulse = null;
b2PrismaticJoint.prototype.m_lowerTranslation = null;
b2PrismaticJoint.prototype.m_upperTranslation = null;
b2PrismaticJoint.prototype.m_maxMotorForce = null;
b2PrismaticJoint.prototype.m_motorSpeed = null;
b2PrismaticJoint.prototype.m_enableLimit = null;
b2PrismaticJoint.prototype.m_enableMotor = null;
b2PrismaticJoint.prototype.m_limitState = 0;

var b2RevoluteJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2RevoluteJoint.prototype, b2Joint.prototype);
b2RevoluteJoint.prototype._super = b2Joint.prototype;

b2RevoluteJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorImpulse = 0;
  this.m_lowerAngle = def.lowerAngle;
  this.m_upperAngle = def.upperAngle;
  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
};

b2RevoluteJoint.prototype.__varz = function () {
  this.K = new b2Mat22();
  this.K1 = new b2Mat22();
  this.K2 = new b2Mat22();
  this.K3 = new b2Mat22();
  this.impulse3 = new b2Vec3();
  this.impulse2 = new b2Vec2();
  this.reduced = new b2Vec2();
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_impulse = new b2Vec3();
  this.m_mass = new b2Mat33();
};

b2RevoluteJoint.tImpulse = new b2Vec2();

b2RevoluteJoint.prototype.InitVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;

  if (this.m_enableMotor || this.m_enableLimit) {}

  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
  this.m_mass.col2.x = -r1Y * r1X * i1 - r2Y * r2X * i2;
  this.m_mass.col3.x = -r1Y * i1 - r2Y * i2;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
  this.m_mass.col3.y = r1X * i1 + r2X * i2;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = i1 + i2;
  this.m_motorMass = 1 / (i1 + i2);

  if (this.m_enableMotor == false) {
    this.m_motorImpulse = 0;
  }

  if (this.m_enableLimit) {
    var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;

    if (b2Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
      this.m_limitState = b2Joint.e_equalLimits;
    } else {
      if (jointAngle <= this.m_lowerAngle) {
        if (this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_impulse.z = 0;
        }

        this.m_limitState = b2Joint.e_atLowerLimit;
      } else {
        if (jointAngle >= this.m_upperAngle) {
          if (this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_impulse.z = 0;
          }

          this.m_limitState = b2Joint.e_atUpperLimit;
        } else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0;
        }
      }
    }
  } else {
    this.m_limitState = b2Joint.e_inactiveLimit;
  }

  if (step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x;
    var PY = this.m_impulse.y;
    bA.m_linearVelocity.x -= m1 * PX;
    bA.m_linearVelocity.y -= m1 * PY;
    bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
    bB.m_linearVelocity.x += m2 * PX;
    bB.m_linearVelocity.y += m2 * PY;
    bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z);
  } else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
  }
};

b2RevoluteJoint.prototype.SolveVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  var newImpulse;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;

  if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = w2 - w1 - this.m_motorSpeed;
    var impulse = this.m_motorMass * -Cdot;
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    w1 -= i1 * impulse;
    w2 += i2 * impulse;
  }

  if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var Cdot1X = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
    var Cdot2 = w2 - w1;
    this.m_mass.Solve33(this.impulse3, -Cdot1X, -Cdot1Y, -Cdot2);

    if (this.m_limitState == b2Joint.e_equalLimits) {
      this.m_impulse.Add(this.impulse3);
    } else {
      if (this.m_limitState == b2Joint.e_atLowerLimit) {
        newImpulse = this.m_impulse.z + this.impulse3.z;

        if (newImpulse < 0) {
          this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
          this.impulse3.x = this.reduced.x;
          this.impulse3.y = this.reduced.y;
          this.impulse3.z = -this.m_impulse.z;
          this.m_impulse.x += this.reduced.x;
          this.m_impulse.y += this.reduced.y;
          this.m_impulse.z = 0;
        }
      } else {
        if (this.m_limitState == b2Joint.e_atUpperLimit) {
          newImpulse = this.m_impulse.z + this.impulse3.z;

          if (newImpulse > 0) {
            this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
            this.impulse3.x = this.reduced.x;
            this.impulse3.y = this.reduced.y;
            this.impulse3.z = -this.m_impulse.z;
            this.m_impulse.x += this.reduced.x;
            this.m_impulse.y += this.reduced.y;
            this.m_impulse.z = 0;
          }
        }
      }
    }

    v1.x -= m1 * this.impulse3.x;
    v1.y -= m1 * this.impulse3.y;
    w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
    v2.x += m2 * this.impulse3.x;
    v2.y += m2 * this.impulse3.y;
    w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z);
  } else {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CdotX = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
    this.m_mass.Solve22(this.impulse2, -CdotX, -CdotY);
    this.m_impulse.x += this.impulse2.x;
    this.m_impulse.y += this.impulse2.y;
    v1.x -= m1 * this.impulse2.x;
    v1.y -= m1 * this.impulse2.y;
    w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
    v2.x += m2 * this.impulse2.x;
    v2.y += m2 * this.impulse2.y;
    w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x);
  }

  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2;
};

b2RevoluteJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var oldLimitImpulse;
  var C;
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var angularError = 0;
  var positionError = 0;
  var tX;
  var impulseX;
  var impulseY;

  if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var limitImpulse = 0;

    if (this.m_limitState == b2Joint.e_equalLimits) {
      C = b2Math.Clamp(angle - this.m_lowerAngle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
      limitImpulse = -this.m_motorMass * C;
      angularError = b2Math.Abs(C);
    } else {
      if (this.m_limitState == b2Joint.e_atLowerLimit) {
        C = angle - this.m_lowerAngle;
        angularError = -C;
        C = b2Math.Clamp(C + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
        limitImpulse = -this.m_motorMass * C;
      } else {
        if (this.m_limitState == b2Joint.e_atUpperLimit) {
          C = angle - this.m_upperAngle;
          angularError = C;
          C = b2Math.Clamp(C - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
          limitImpulse = -this.m_motorMass * C;
        }
      }
    }

    bA.m_sweep.a -= bA.m_invI * limitImpulse;
    bB.m_sweep.a += bB.m_invI * limitImpulse;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform();
  }

  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var CLengthSquared = CX * CX + CY * CY;
  var CLength = Math.sqrt(CLengthSquared);
  positionError = CLength;
  var invMass1 = bA.m_invMass;
  var invMass2 = bB.m_invMass;
  var invI1 = bA.m_invI;
  var invI2 = bB.m_invI;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;

  if (CLengthSquared > k_allowedStretch * k_allowedStretch) {
    var uX = CX / CLength;
    var uY = CY / CLength;
    var k = invMass1 + invMass2;
    var m = 1 / k;
    impulseX = m * -CX;
    impulseY = m * -CY;
    var k_beta = 0.5;
    bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
    bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
    bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
    bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
    CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  }

  this.K1.col1.x = invMass1 + invMass2;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass1 + invMass2;
  this.K2.col1.x = invI1 * r1Y * r1Y;
  this.K2.col2.x = -invI1 * r1X * r1Y;
  this.K2.col1.y = -invI1 * r1X * r1Y;
  this.K2.col2.y = invI1 * r1X * r1X;
  this.K3.col1.x = invI2 * r2Y * r2Y;
  this.K3.col2.x = -invI2 * r2X * r2Y;
  this.K3.col1.y = -invI2 * r2X * r2Y;
  this.K3.col2.y = invI2 * r2X * r2X;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.AddM(this.K3);
  this.K.Solve(b2RevoluteJoint.tImpulse, -CX, -CY);
  impulseX = b2RevoluteJoint.tImpulse.x;
  impulseY = b2RevoluteJoint.tImpulse.y;
  bA.m_sweep.c.x -= bA.m_invMass * impulseX;
  bA.m_sweep.c.y -= bA.m_invMass * impulseY;
  bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
  bB.m_sweep.c.x += bB.m_invMass * impulseX;
  bB.m_sweep.c.y += bB.m_invMass * impulseY;
  bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop;
};

b2RevoluteJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2RevoluteJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2RevoluteJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};

b2RevoluteJoint.prototype.GetReactionTorque = function (inv_dt) {
  return inv_dt * this.m_impulse.z;
};

b2RevoluteJoint.prototype.GetJointAngle = function () {
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
};

b2RevoluteJoint.prototype.GetJointSpeed = function () {
  return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
};

b2RevoluteJoint.prototype.IsLimitEnabled = function () {
  return this.m_enableLimit;
};

b2RevoluteJoint.prototype.EnableLimit = function (flag) {
  this.m_enableLimit = flag;
};

b2RevoluteJoint.prototype.GetLowerLimit = function () {
  return this.m_lowerAngle;
};

b2RevoluteJoint.prototype.GetUpperLimit = function () {
  return this.m_upperAngle;
};

b2RevoluteJoint.prototype.SetLimits = function (lower, upper) {
  this.m_lowerAngle = lower;
  this.m_upperAngle = upper;
};

b2RevoluteJoint.prototype.IsMotorEnabled = function () {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  return this.m_enableMotor;
};

b2RevoluteJoint.prototype.EnableMotor = function (flag) {
  this.m_enableMotor = flag;
};

b2RevoluteJoint.prototype.SetMotorSpeed = function (speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed;
};

b2RevoluteJoint.prototype.GetMotorSpeed = function () {
  return this.m_motorSpeed;
};

b2RevoluteJoint.prototype.SetMaxMotorTorque = function (torque) {
  this.m_maxMotorTorque = torque;
};

b2RevoluteJoint.prototype.GetMotorTorque = function () {
  return this.m_maxMotorTorque;
};

b2RevoluteJoint.prototype.K = new b2Mat22();
b2RevoluteJoint.prototype.K1 = new b2Mat22();
b2RevoluteJoint.prototype.K2 = new b2Mat22();
b2RevoluteJoint.prototype.K3 = new b2Mat22();
b2RevoluteJoint.prototype.impulse3 = new b2Vec3();
b2RevoluteJoint.prototype.impulse2 = new b2Vec2();
b2RevoluteJoint.prototype.reduced = new b2Vec2();
b2RevoluteJoint.prototype.m_localAnchor1 = new b2Vec2();
b2RevoluteJoint.prototype.m_localAnchor2 = new b2Vec2();
b2RevoluteJoint.prototype.m_impulse = new b2Vec3();
b2RevoluteJoint.prototype.m_motorImpulse = null;
b2RevoluteJoint.prototype.m_mass = new b2Mat33();
b2RevoluteJoint.prototype.m_motorMass = null;
b2RevoluteJoint.prototype.m_enableMotor = null;
b2RevoluteJoint.prototype.m_maxMotorTorque = null;
b2RevoluteJoint.prototype.m_motorSpeed = null;
b2RevoluteJoint.prototype.m_enableLimit = null;
b2RevoluteJoint.prototype.m_referenceAngle = null;
b2RevoluteJoint.prototype.m_lowerAngle = null;
b2RevoluteJoint.prototype.m_upperAngle = null;
b2RevoluteJoint.prototype.m_limitState = 0;

var b2JointDef = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2JointDef.prototype.__constructor = function () {
  this.type = b2Joint.e_unknownJoint;
  this.userData = null;
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
};

b2JointDef.prototype.__varz = function () {};

b2JointDef.prototype.type = 0;
b2JointDef.prototype.userData = null;
b2JointDef.prototype.bodyA = null;
b2JointDef.prototype.bodyB = null;
b2JointDef.prototype.collideConnected = null;

var b2LineJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2LineJointDef.prototype, b2JointDef.prototype);
b2LineJointDef.prototype._super = b2JointDef.prototype;

b2LineJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_lineJoint;
  this.localAxisA.Set(1, 0);
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0;
};

b2LineJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.localAxisA = new b2Vec2();
};

b2LineJointDef.prototype.Initialize = function (bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
};

b2LineJointDef.prototype.localAnchorA = new b2Vec2();
b2LineJointDef.prototype.localAnchorB = new b2Vec2();
b2LineJointDef.prototype.localAxisA = new b2Vec2();
b2LineJointDef.prototype.enableLimit = null;
b2LineJointDef.prototype.lowerTranslation = null;
b2LineJointDef.prototype.upperTranslation = null;
b2LineJointDef.prototype.enableMotor = null;
b2LineJointDef.prototype.maxMotorForce = null;
b2LineJointDef.prototype.motorSpeed = null;

var b2DistanceJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2DistanceJoint.prototype, b2Joint.prototype);
b2DistanceJoint.prototype._super = b2Joint.prototype;

b2DistanceJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_length = def.length;
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_impulse = 0;
  this.m_gamma = 0;
  this.m_bias = 0;
};

b2DistanceJoint.prototype.__varz = function () {
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_u = new b2Vec2();
};

b2DistanceJoint.prototype.InitVelocityConstraints = function (step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);

  if (length > b2Settings.b2_linearSlop) {
    this.m_u.Multiply(1 / length);
  } else {
    this.m_u.SetZero();
  }

  var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
  var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
  var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
  this.m_mass = invMass != 0 ? 1 / invMass : 0;

  if (this.m_frequencyHz > 0) {
    var C = length - this.m_length;
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;
    var k = this.m_mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * step.dt * k * this.m_gamma;
    this.m_mass = invMass + this.m_gamma;
    this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0;
  }

  if (step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    var PX = this.m_impulse * this.m_u.x;
    var PY = this.m_impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX);
  } else {
    this.m_impulse = 0;
  }
};

b2DistanceJoint.prototype.SolveVelocityConstraints = function (step) {
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
  var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
  var v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
  var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
  var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
  var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
  this.m_impulse += impulse;
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_linearVelocity.x -= bA.m_invMass * PX;
  bA.m_linearVelocity.y -= bA.m_invMass * PY;
  bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_linearVelocity.x += bB.m_invMass * PX;
  bB.m_linearVelocity.y += bB.m_invMass * PY;
  bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX);
};

b2DistanceJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var tMat;

  if (this.m_frequencyHz > 0) {
    return true;
  }

  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(dX * dX + dY * dY);
  dX /= length;
  dY /= length;
  var C = length - this.m_length;
  C = b2Math.Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
  var impulse = -this.m_mass * C;
  this.m_u.Set(dX, dY);
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_sweep.c.x -= bA.m_invMass * PX;
  bA.m_sweep.c.y -= bA.m_invMass * PY;
  bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_sweep.c.x += bB.m_invMass * PX;
  bB.m_sweep.c.y += bB.m_invMass * PY;
  bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return b2Math.Abs(C) < b2Settings.b2_linearSlop;
};

b2DistanceJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2DistanceJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2DistanceJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y);
};

b2DistanceJoint.prototype.GetReactionTorque = function (inv_dt) {
  return 0;
};

b2DistanceJoint.prototype.GetLength = function () {
  return this.m_length;
};

b2DistanceJoint.prototype.SetLength = function (length) {
  this.m_length = length;
};

b2DistanceJoint.prototype.GetFrequency = function () {
  return this.m_frequencyHz;
};

b2DistanceJoint.prototype.SetFrequency = function (hz) {
  this.m_frequencyHz = hz;
};

b2DistanceJoint.prototype.GetDampingRatio = function () {
  return this.m_dampingRatio;
};

b2DistanceJoint.prototype.SetDampingRatio = function (ratio) {
  this.m_dampingRatio = ratio;
};

b2DistanceJoint.prototype.m_localAnchor1 = new b2Vec2();
b2DistanceJoint.prototype.m_localAnchor2 = new b2Vec2();
b2DistanceJoint.prototype.m_u = new b2Vec2();
b2DistanceJoint.prototype.m_frequencyHz = null;
b2DistanceJoint.prototype.m_dampingRatio = null;
b2DistanceJoint.prototype.m_gamma = null;
b2DistanceJoint.prototype.m_bias = null;
b2DistanceJoint.prototype.m_impulse = null;
b2DistanceJoint.prototype.m_mass = null;
b2DistanceJoint.prototype.m_length = null;

var b2PulleyJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
b2PulleyJointDef.prototype._super = b2JointDef.prototype;

b2PulleyJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_pulleyJoint;
  this.groundAnchorA.Set(-1, 1);
  this.groundAnchorB.Set(1, 1);
  this.localAnchorA.Set(-1, 0);
  this.localAnchorB.Set(1, 0);
  this.lengthA = 0;
  this.maxLengthA = 0;
  this.lengthB = 0;
  this.maxLengthB = 0;
  this.ratio = 1;
  this.collideConnected = true;
};

b2PulleyJointDef.prototype.__varz = function () {
  this.groundAnchorA = new b2Vec2();
  this.groundAnchorB = new b2Vec2();
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
};

b2PulleyJointDef.prototype.Initialize = function (bA, bB, gaA, gaB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.SetV(gaA);
  this.groundAnchorB.SetV(gaB);
  this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
  var d1X = anchorA.x - gaA.x;
  var d1Y = anchorA.y - gaA.y;
  this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
  var d2X = anchorB.x - gaB.x;
  var d2Y = anchorB.y - gaB.y;
  this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
  this.ratio = r;
  var C = this.lengthA + this.ratio * this.lengthB;
  this.maxLengthA = C - this.ratio * b2PulleyJoint.b2_minPulleyLength;
  this.maxLengthB = (C - b2PulleyJoint.b2_minPulleyLength) / this.ratio;
};

b2PulleyJointDef.prototype.groundAnchorA = new b2Vec2();
b2PulleyJointDef.prototype.groundAnchorB = new b2Vec2();
b2PulleyJointDef.prototype.localAnchorA = new b2Vec2();
b2PulleyJointDef.prototype.localAnchorB = new b2Vec2();
b2PulleyJointDef.prototype.lengthA = null;
b2PulleyJointDef.prototype.maxLengthA = null;
b2PulleyJointDef.prototype.lengthB = null;
b2PulleyJointDef.prototype.maxLengthB = null;
b2PulleyJointDef.prototype.ratio = null;

var b2DistanceJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
b2DistanceJointDef.prototype._super = b2JointDef.prototype;

b2DistanceJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_distanceJoint;
  this.length = 1;
  this.frequencyHz = 0;
  this.dampingRatio = 0;
};

b2DistanceJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
};

b2DistanceJointDef.prototype.Initialize = function (bA, bB, anchorA, anchorB) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
  var dX = anchorB.x - anchorA.x;
  var dY = anchorB.y - anchorA.y;
  this.length = Math.sqrt(dX * dX + dY * dY);
  this.frequencyHz = 0;
  this.dampingRatio = 0;
};

b2DistanceJointDef.prototype.localAnchorA = new b2Vec2();
b2DistanceJointDef.prototype.localAnchorB = new b2Vec2();
b2DistanceJointDef.prototype.length = null;
b2DistanceJointDef.prototype.frequencyHz = null;
b2DistanceJointDef.prototype.dampingRatio = null;

var b2FrictionJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2FrictionJointDef.prototype, b2JointDef.prototype);
b2FrictionJointDef.prototype._super = b2JointDef.prototype;

b2FrictionJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_frictionJoint;
  this.maxForce = 0;
  this.maxTorque = 0;
};

b2FrictionJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
};

b2FrictionJointDef.prototype.Initialize = function (bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
};

b2FrictionJointDef.prototype.localAnchorA = new b2Vec2();
b2FrictionJointDef.prototype.localAnchorB = new b2Vec2();
b2FrictionJointDef.prototype.maxForce = null;
b2FrictionJointDef.prototype.maxTorque = null;

var b2WeldJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2WeldJointDef.prototype, b2JointDef.prototype);
b2WeldJointDef.prototype._super = b2JointDef.prototype;

b2WeldJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_weldJoint;
  this.referenceAngle = 0;
};

b2WeldJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
};

b2WeldJointDef.prototype.Initialize = function (bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};

b2WeldJointDef.prototype.localAnchorA = new b2Vec2();
b2WeldJointDef.prototype.localAnchorB = new b2Vec2();
b2WeldJointDef.prototype.referenceAngle = null;

var b2GearJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2GearJointDef.prototype, b2JointDef.prototype);
b2GearJointDef.prototype._super = b2JointDef.prototype;

b2GearJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_gearJoint;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 1;
};

b2GearJointDef.prototype.__varz = function () {};

b2GearJointDef.prototype.joint1 = null;
b2GearJointDef.prototype.joint2 = null;
b2GearJointDef.prototype.ratio = null;

var b2Color = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Color.prototype.__constructor = function (rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1));
};

b2Color.prototype.__varz = function () {};

b2Color.prototype.Set = function (rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1));
};

b2Color.prototype.__defineGetter__("r", function () {
  return this._r;
});

b2Color.prototype.__defineSetter__("r", function (rr) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
});

b2Color.prototype.__defineGetter__("g", function () {
  return this._g;
});

b2Color.prototype.__defineSetter__("g", function (gg) {
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
});

b2Color.prototype.__defineGetter__("b", function () {
  return this._b;
});

b2Color.prototype.__defineSetter__("b", function (bb) {
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1));
});

b2Color.prototype.__defineGetter__("color", function () {
  return this._r << 16 | this._g << 8 | this._b;
});

b2Color.prototype._r = 0;
b2Color.prototype._g = 0;
b2Color.prototype._b = 0;

var b2FrictionJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2FrictionJoint.prototype, b2Joint.prototype);
b2FrictionJoint.prototype._super = b2Joint.prototype;

b2FrictionJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_linearMass.SetZero();
  this.m_angularMass = 0;
  this.m_linearImpulse.SetZero();
  this.m_angularImpulse = 0;
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque;
};

b2FrictionJoint.prototype.__varz = function () {
  this.m_localAnchorA = new b2Vec2();
  this.m_localAnchorB = new b2Vec2();
  this.m_linearImpulse = new b2Vec2();
  this.m_linearMass = new b2Mat22();
};

b2FrictionJoint.prototype.InitVelocityConstraints = function (step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var K = new b2Mat22();
  K.col1.x = mA + mB;
  K.col2.x = 0;
  K.col1.y = 0;
  K.col2.y = mA + mB;
  K.col1.x += iA * rAY * rAY;
  K.col2.x += -iA * rAX * rAY;
  K.col1.y += -iA * rAX * rAY;
  K.col2.y += iA * rAX * rAX;
  K.col1.x += iB * rBY * rBY;
  K.col2.x += -iB * rBX * rBY;
  K.col1.y += -iB * rBX * rBY;
  K.col2.y += iB * rBX * rBX;
  K.GetInverse(this.m_linearMass);
  this.m_angularMass = iA + iB;

  if (this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass;
  }

  if (step.warmStarting) {
    this.m_linearImpulse.x *= step.dtRatio;
    this.m_linearImpulse.y *= step.dtRatio;
    this.m_angularImpulse *= step.dtRatio;
    var P = this.m_linearImpulse;
    bA.m_linearVelocity.x -= mA * P.x;
    bA.m_linearVelocity.y -= mA * P.y;
    bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
    bB.m_linearVelocity.x += mB * P.x;
    bB.m_linearVelocity.y += mB * P.y;
    bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse);
  } else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0;
  }
};

b2FrictionJoint.prototype.SolveVelocityConstraints = function (step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var maxImpulse;
  var Cdot = wB - wA;
  var impulse = -this.m_angularMass * Cdot;
  var oldImpulse = this.m_angularImpulse;
  maxImpulse = step.dt * this.m_maxTorque;
  this.m_angularImpulse = b2Math.Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
  impulse = this.m_angularImpulse - oldImpulse;
  wA -= iA * impulse;
  wB += iB * impulse;
  var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
  var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
  var impulseV = b2Math.MulMV(this.m_linearMass, new b2Vec2(-CdotX, -CdotY));
  var oldImpulseV = this.m_linearImpulse.Copy();
  this.m_linearImpulse.Add(impulseV);
  maxImpulse = step.dt * this.m_maxForce;

  if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_linearImpulse.Normalize();
    this.m_linearImpulse.Multiply(maxImpulse);
  }

  impulseV = b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
  vA.x -= mA * impulseV.x;
  vA.y -= mA * impulseV.y;
  wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
  vB.x += mB * impulseV.x;
  vB.y += mB * impulseV.y;
  wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB;
};

b2FrictionJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  return true;
};

b2FrictionJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
};

b2FrictionJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
};

b2FrictionJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
};

b2FrictionJoint.prototype.GetReactionTorque = function (inv_dt) {
  return inv_dt * this.m_angularImpulse;
};

b2FrictionJoint.prototype.SetMaxForce = function (force) {
  this.m_maxForce = force;
};

b2FrictionJoint.prototype.GetMaxForce = function () {
  return this.m_maxForce;
};

b2FrictionJoint.prototype.SetMaxTorque = function (torque) {
  this.m_maxTorque = torque;
};

b2FrictionJoint.prototype.GetMaxTorque = function () {
  return this.m_maxTorque;
};

b2FrictionJoint.prototype.m_localAnchorA = new b2Vec2();
b2FrictionJoint.prototype.m_localAnchorB = new b2Vec2();
b2FrictionJoint.prototype.m_linearImpulse = new b2Vec2();
b2FrictionJoint.prototype.m_angularImpulse = null;
b2FrictionJoint.prototype.m_maxForce = null;
b2FrictionJoint.prototype.m_maxTorque = null;
b2FrictionJoint.prototype.m_linearMass = new b2Mat22();
b2FrictionJoint.prototype.m_angularMass = null;

var b2Distance = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Distance.prototype.__constructor = function () {};

b2Distance.prototype.__varz = function () {};

b2Distance.Distance = function (output, cache, input) {
  ++b2Distance.b2_gjkCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var transformA = input.transformA;
  var transformB = input.transformB;
  var simplex = b2Distance.s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
  var vertices = simplex.m_vertices;
  var k_maxIters = 20;
  var saveA = b2Distance.s_saveA;
  var saveB = b2Distance.s_saveB;
  var saveCount = 0;
  var closestPoint = simplex.GetClosestPoint();
  var distanceSqr1 = closestPoint.LengthSquared();
  var distanceSqr2 = distanceSqr1;
  var i = 0;
  var p;
  var iter = 0;

  while (iter < k_maxIters) {
    saveCount = simplex.m_count;

    for (i = 0; i < saveCount; i++) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB;
    }

    switch (simplex.m_count) {
      case 1:
        break;

      case 2:
        simplex.Solve2();
        break;

      case 3:
        simplex.Solve3();
        break;

      default:
        b2Settings.b2Assert(false);
    }

    if (simplex.m_count == 3) {
      break;
    }

    p = simplex.GetClosestPoint();
    distanceSqr2 = p.LengthSquared();

    if (distanceSqr2 > distanceSqr1) {}

    distanceSqr1 = distanceSqr2;
    var d = simplex.GetSearchDirection();

    if (d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) {
      break;
    }

    var vertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Math.MulTMV(transformA.R, d.GetNegative()));
    vertex.wA = b2Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
    vertex.indexB = proxyB.GetSupport(b2Math.MulTMV(transformB.R, d));
    vertex.wB = b2Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
    vertex.w = b2Math.SubtractVV(vertex.wB, vertex.wA);
    ++iter;
    ++b2Distance.b2_gjkIters;
    var duplicate = false;

    for (i = 0; i < saveCount; i++) {
      if (vertex.indexA == saveA[i] && vertex.indexB == saveB[i]) {
        duplicate = true;
        break;
      }
    }

    if (duplicate) {
      break;
    }

    ++simplex.m_count;
  }

  b2Distance.b2_gjkMaxIters = b2Math.Max(b2Distance.b2_gjkMaxIters, iter);
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Math.SubtractVV(output.pointA, output.pointB).Length();
  output.iterations = iter;
  simplex.WriteCache(cache);

  if (input.useRadii) {
    var rA = proxyA.m_radius;
    var rB = proxyB.m_radius;

    if (output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
      output.distance -= rA + rB;
      var normal = b2Math.SubtractVV(output.pointB, output.pointA);
      normal.Normalize();
      output.pointA.x += rA * normal.x;
      output.pointA.y += rA * normal.y;
      output.pointB.x -= rB * normal.x;
      output.pointB.y -= rB * normal.y;
    } else {
      p = new b2Vec2();
      p.x = 0.5 * (output.pointA.x + output.pointB.x);
      p.y = 0.5 * (output.pointA.y + output.pointB.y);
      output.pointA.x = output.pointB.x = p.x;
      output.pointA.y = output.pointB.y = p.y;
      output.distance = 0;
    }
  }
};

b2Distance.b2_gjkCalls = 0;
b2Distance.b2_gjkIters = 0;
b2Distance.b2_gjkMaxIters = 0;
b2Distance.s_simplex = new b2Simplex();
b2Distance.s_saveA = new Array(3);
b2Distance.s_saveB = new Array(3);

var b2MouseJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2MouseJoint.prototype, b2Joint.prototype);
b2MouseJoint.prototype._super = b2Joint.prototype;

b2MouseJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  this.m_target.SetV(def.target);
  var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
  var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
  var tMat = this.m_bodyB.m_xf.R;
  this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
  this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_beta = 0;
  this.m_gamma = 0;
};

b2MouseJoint.prototype.__varz = function () {
  this.K = new b2Mat22();
  this.K1 = new b2Mat22();
  this.K2 = new b2Mat22();
  this.m_localAnchor = new b2Vec2();
  this.m_target = new b2Vec2();
  this.m_impulse = new b2Vec2();
  this.m_mass = new b2Mat22();
  this.m_C = new b2Vec2();
};

b2MouseJoint.prototype.InitVelocityConstraints = function (step) {
  var b = this.m_bodyB;
  var mass = b.GetMass();
  var omega = 2 * Math.PI * this.m_frequencyHz;
  var d = 2 * mass * this.m_dampingRatio * omega;
  var k = mass * omega * omega;
  this.m_gamma = step.dt * (d + step.dt * k);
  this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
  this.m_beta = step.dt * k * this.m_gamma;
  var tMat;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var invMass = b.m_invMass;
  var invI = b.m_invI;
  this.K1.col1.x = invMass;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass;
  this.K2.col1.x = invI * rY * rY;
  this.K2.col2.x = -invI * rX * rY;
  this.K2.col1.y = -invI * rX * rY;
  this.K2.col2.y = invI * rX * rX;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.col1.x += this.m_gamma;
  this.K.col2.y += this.m_gamma;
  this.K.GetInverse(this.m_mass);
  this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
  this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
  b.m_angularVelocity *= 0.98;
  this.m_impulse.x *= step.dtRatio;
  this.m_impulse.y *= step.dtRatio;
  b.m_linearVelocity.x += invMass * this.m_impulse.x;
  b.m_linearVelocity.y += invMass * this.m_impulse.y;
  b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x);
};

b2MouseJoint.prototype.SolveVelocityConstraints = function (step) {
  var b = this.m_bodyB;
  var tMat;
  var tX;
  var tY;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var CdotX = b.m_linearVelocity.x + -b.m_angularVelocity * rY;
  var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
  tMat = this.m_mass;
  tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
  tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
  var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
  var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);
  var oldImpulseX = this.m_impulse.x;
  var oldImpulseY = this.m_impulse.y;
  this.m_impulse.x += impulseX;
  this.m_impulse.y += impulseY;
  var maxImpulse = step.dt * this.m_maxForce;

  if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length());
  }

  impulseX = this.m_impulse.x - oldImpulseX;
  impulseY = this.m_impulse.y - oldImpulseY;
  b.m_linearVelocity.x += b.m_invMass * impulseX;
  b.m_linearVelocity.y += b.m_invMass * impulseY;
  b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX);
};

b2MouseJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  return true;
};

b2MouseJoint.prototype.GetAnchorA = function () {
  return this.m_target;
};

b2MouseJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor);
};

b2MouseJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y);
};

b2MouseJoint.prototype.GetReactionTorque = function (inv_dt) {
  return 0;
};

b2MouseJoint.prototype.GetTarget = function () {
  return this.m_target;
};

b2MouseJoint.prototype.SetTarget = function (target) {
  if (this.m_bodyB.IsAwake() == false) {
    this.m_bodyB.SetAwake(true);
  }

  this.m_target = target;
};

b2MouseJoint.prototype.GetMaxForce = function () {
  return this.m_maxForce;
};

b2MouseJoint.prototype.SetMaxForce = function (maxForce) {
  this.m_maxForce = maxForce;
};

b2MouseJoint.prototype.GetFrequency = function () {
  return this.m_frequencyHz;
};

b2MouseJoint.prototype.SetFrequency = function (hz) {
  this.m_frequencyHz = hz;
};

b2MouseJoint.prototype.GetDampingRatio = function () {
  return this.m_dampingRatio;
};

b2MouseJoint.prototype.SetDampingRatio = function (ratio) {
  this.m_dampingRatio = ratio;
};

b2MouseJoint.prototype.K = new b2Mat22();
b2MouseJoint.prototype.K1 = new b2Mat22();
b2MouseJoint.prototype.K2 = new b2Mat22();
b2MouseJoint.prototype.m_localAnchor = new b2Vec2();
b2MouseJoint.prototype.m_target = new b2Vec2();
b2MouseJoint.prototype.m_impulse = new b2Vec2();
b2MouseJoint.prototype.m_mass = new b2Mat22();
b2MouseJoint.prototype.m_C = new b2Vec2();
b2MouseJoint.prototype.m_maxForce = null;
b2MouseJoint.prototype.m_frequencyHz = null;
b2MouseJoint.prototype.m_dampingRatio = null;
b2MouseJoint.prototype.m_beta = null;
b2MouseJoint.prototype.m_gamma = null;

var b2PrismaticJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
b2PrismaticJointDef.prototype._super = b2JointDef.prototype;

b2PrismaticJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_prismaticJoint;
  this.localAxisA.Set(1, 0);
  this.referenceAngle = 0;
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0;
};

b2PrismaticJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.localAxisA = new b2Vec2();
};

b2PrismaticJointDef.prototype.Initialize = function (bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};

b2PrismaticJointDef.prototype.localAnchorA = new b2Vec2();
b2PrismaticJointDef.prototype.localAnchorB = new b2Vec2();
b2PrismaticJointDef.prototype.localAxisA = new b2Vec2();
b2PrismaticJointDef.prototype.referenceAngle = null;
b2PrismaticJointDef.prototype.enableLimit = null;
b2PrismaticJointDef.prototype.lowerTranslation = null;
b2PrismaticJointDef.prototype.upperTranslation = null;
b2PrismaticJointDef.prototype.enableMotor = null;
b2PrismaticJointDef.prototype.maxMotorForce = null;
b2PrismaticJointDef.prototype.motorSpeed = null;

var b2TimeOfImpact = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2TimeOfImpact.prototype.__constructor = function () {};

b2TimeOfImpact.prototype.__varz = function () {};

b2TimeOfImpact.TimeOfImpact = function (input) {
  ++b2TimeOfImpact.b2_toiCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var sweepA = input.sweepA;
  var sweepB = input.sweepB;
  b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
  b2Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
  var radius = proxyA.m_radius + proxyB.m_radius;
  var tolerance = input.tolerance;
  var alpha = 0;
  var k_maxIterations = 1E3;
  var iter = 0;
  var target = 0;
  b2TimeOfImpact.s_cache.count = 0;
  b2TimeOfImpact.s_distanceInput.useRadii = false;

  for (;;) {
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, alpha);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, alpha);
    b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
    b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
    b2TimeOfImpact.s_distanceInput.transformA = b2TimeOfImpact.s_xfA;
    b2TimeOfImpact.s_distanceInput.transformB = b2TimeOfImpact.s_xfB;
    b2Distance.Distance(b2TimeOfImpact.s_distanceOutput, b2TimeOfImpact.s_cache, b2TimeOfImpact.s_distanceInput);

    if (b2TimeOfImpact.s_distanceOutput.distance <= 0) {
      alpha = 1;
      break;
    }

    b2TimeOfImpact.s_fcn.Initialize(b2TimeOfImpact.s_cache, proxyA, b2TimeOfImpact.s_xfA, proxyB, b2TimeOfImpact.s_xfB);
    var separation = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);

    if (separation <= 0) {
      alpha = 1;
      break;
    }

    if (iter == 0) {
      if (separation > radius) {
        target = b2Math.Max(radius - tolerance, 0.75 * radius);
      } else {
        target = b2Math.Max(separation - tolerance, 0.02 * radius);
      }
    }

    if (separation - target < 0.5 * tolerance) {
      if (iter == 0) {
        alpha = 1;
        break;
      }

      break;
    }

    var newAlpha = alpha;
    var x1 = alpha;
    var x2 = 1;
    var f1 = separation;
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, x2);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, x2);
    var f2 = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);

    if (f2 >= target) {
      alpha = 1;
      break;
    }

    var rootIterCount = 0;

    for (;;) {
      var x;

      if (rootIterCount & 1) {
        x = x1 + (target - f1) * (x2 - x1) / (f2 - f1);
      } else {
        x = 0.5 * (x1 + x2);
      }

      sweepA.GetTransform(b2TimeOfImpact.s_xfA, x);
      sweepB.GetTransform(b2TimeOfImpact.s_xfB, x);
      var f = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);

      if (b2Math.Abs(f - target) < 0.025 * tolerance) {
        newAlpha = x;
        break;
      }

      if (f > target) {
        x1 = x;
        f1 = f;
      } else {
        x2 = x;
        f2 = f;
      }

      ++rootIterCount;
      ++b2TimeOfImpact.b2_toiRootIters;

      if (rootIterCount == 50) {
        break;
      }
    }

    b2TimeOfImpact.b2_toiMaxRootIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);

    if (newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha) {
      break;
    }

    alpha = newAlpha;
    iter++;
    ++b2TimeOfImpact.b2_toiIters;

    if (iter == k_maxIterations) {
      break;
    }
  }

  b2TimeOfImpact.b2_toiMaxIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxIters, iter);
  return alpha;
};

b2TimeOfImpact.b2_toiCalls = 0;
b2TimeOfImpact.b2_toiIters = 0;
b2TimeOfImpact.b2_toiMaxIters = 0;
b2TimeOfImpact.b2_toiRootIters = 0;
b2TimeOfImpact.b2_toiMaxRootIters = 0;
b2TimeOfImpact.s_cache = new b2SimplexCache();
b2TimeOfImpact.s_distanceInput = new b2DistanceInput();
b2TimeOfImpact.s_xfA = new b2Transform();
b2TimeOfImpact.s_xfB = new b2Transform();
b2TimeOfImpact.s_fcn = new b2SeparationFunction();
b2TimeOfImpact.s_distanceOutput = new b2DistanceOutput();

var b2GearJoint = function () {
  b2Joint.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2GearJoint.prototype, b2Joint.prototype);
b2GearJoint.prototype._super = b2Joint.prototype;

b2GearJoint.prototype.__constructor = function (def) {
  this._super.__constructor.apply(this, [def]);

  var type1 = def.joint1.m_type;
  var type2 = def.joint2.m_type;
  this.m_revolute1 = null;
  this.m_prismatic1 = null;
  this.m_revolute2 = null;
  this.m_prismatic2 = null;
  var coordinate1;
  var coordinate2;
  this.m_ground1 = def.joint1.GetBodyA();
  this.m_bodyA = def.joint1.GetBodyB();

  if (type1 == b2Joint.e_revoluteJoint) {
    this.m_revolute1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
    coordinate1 = this.m_revolute1.GetJointAngle();
  } else {
    this.m_prismatic1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
    coordinate1 = this.m_prismatic1.GetJointTranslation();
  }

  this.m_ground2 = def.joint2.GetBodyA();
  this.m_bodyB = def.joint2.GetBodyB();

  if (type2 == b2Joint.e_revoluteJoint) {
    this.m_revolute2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
    coordinate2 = this.m_revolute2.GetJointAngle();
  } else {
    this.m_prismatic2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
    coordinate2 = this.m_prismatic2.GetJointTranslation();
  }

  this.m_ratio = def.ratio;
  this.m_constant = coordinate1 + this.m_ratio * coordinate2;
  this.m_impulse = 0;
};

b2GearJoint.prototype.__varz = function () {
  this.m_groundAnchor1 = new b2Vec2();
  this.m_groundAnchor2 = new b2Vec2();
  this.m_localAnchor1 = new b2Vec2();
  this.m_localAnchor2 = new b2Vec2();
  this.m_J = new b2Jacobian();
};

b2GearJoint.prototype.InitVelocityConstraints = function (step) {
  var g1 = this.m_ground1;
  var g2 = this.m_ground2;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var ugX;
  var ugY;
  var rX;
  var rY;
  var tMat;
  var tVec;
  var crug;
  var tX;
  var K = 0;
  this.m_J.SetZero();

  if (this.m_revolute1) {
    this.m_J.angularA = -1;
    K += bA.m_invI;
  } else {
    tMat = g1.m_xf.R;
    tVec = this.m_prismatic1.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bA.m_xf.R;
    rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearA.Set(-ugX, -ugY);
    this.m_J.angularA = -crug;
    K += bA.m_invMass + bA.m_invI * crug * crug;
  }

  if (this.m_revolute2) {
    this.m_J.angularB = -this.m_ratio;
    K += this.m_ratio * this.m_ratio * bB.m_invI;
  } else {
    tMat = g2.m_xf.R;
    tVec = this.m_prismatic2.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bB.m_xf.R;
    rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearB.Set(-this.m_ratio * ugX, -this.m_ratio * ugY);
    this.m_J.angularB = -this.m_ratio * crug;
    K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug);
  }

  this.m_mass = K > 0 ? 1 / K : 0;

  if (step.warmStarting) {
    bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB;
  } else {
    this.m_impulse = 0;
  }
};

b2GearJoint.prototype.SolveVelocityConstraints = function (step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;
  bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB;
};

b2GearJoint.prototype.SolvePositionConstraints = function (baumgarte) {
  var linearError = 0;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var coordinate1;
  var coordinate2;

  if (this.m_revolute1) {
    coordinate1 = this.m_revolute1.GetJointAngle();
  } else {
    coordinate1 = this.m_prismatic1.GetJointTranslation();
  }

  if (this.m_revolute2) {
    coordinate2 = this.m_revolute2.GetJointAngle();
  } else {
    coordinate2 = this.m_prismatic2.GetJointTranslation();
  }

  var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
  var impulse = -this.m_mass * C;
  bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError < b2Settings.b2_linearSlop;
};

b2GearJoint.prototype.GetAnchorA = function () {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
};

b2GearJoint.prototype.GetAnchorB = function () {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
};

b2GearJoint.prototype.GetReactionForce = function (inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y);
};

b2GearJoint.prototype.GetReactionTorque = function (inv_dt) {
  var tMat = this.m_bodyB.m_xf.R;
  var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
  var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var PX = this.m_impulse * this.m_J.linearB.x;
  var PY = this.m_impulse * this.m_J.linearB.y;
  return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX);
};

b2GearJoint.prototype.GetRatio = function () {
  return this.m_ratio;
};

b2GearJoint.prototype.SetRatio = function (ratio) {
  this.m_ratio = ratio;
};

b2GearJoint.prototype.m_ground1 = null;
b2GearJoint.prototype.m_ground2 = null;
b2GearJoint.prototype.m_revolute1 = null;
b2GearJoint.prototype.m_prismatic1 = null;
b2GearJoint.prototype.m_revolute2 = null;
b2GearJoint.prototype.m_prismatic2 = null;
b2GearJoint.prototype.m_groundAnchor1 = new b2Vec2();
b2GearJoint.prototype.m_groundAnchor2 = new b2Vec2();
b2GearJoint.prototype.m_localAnchor1 = new b2Vec2();
b2GearJoint.prototype.m_localAnchor2 = new b2Vec2();
b2GearJoint.prototype.m_J = new b2Jacobian();
b2GearJoint.prototype.m_constant = null;
b2GearJoint.prototype.m_ratio = null;
b2GearJoint.prototype.m_mass = null;
b2GearJoint.prototype.m_impulse = null;

var b2TOIInput = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2TOIInput.prototype.__constructor = function () {};

b2TOIInput.prototype.__varz = function () {
  this.proxyA = new b2DistanceProxy();
  this.proxyB = new b2DistanceProxy();
  this.sweepA = new b2Sweep();
  this.sweepB = new b2Sweep();
};

b2TOIInput.prototype.proxyA = new b2DistanceProxy();
b2TOIInput.prototype.proxyB = new b2DistanceProxy();
b2TOIInput.prototype.sweepA = new b2Sweep();
b2TOIInput.prototype.sweepB = new b2Sweep();
b2TOIInput.prototype.tolerance = null;

var b2RevoluteJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
b2RevoluteJointDef.prototype._super = b2JointDef.prototype;

b2RevoluteJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_revoluteJoint;
  this.localAnchorA.Set(0, 0);
  this.localAnchorB.Set(0, 0);
  this.referenceAngle = 0;
  this.lowerAngle = 0;
  this.upperAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.enableLimit = false;
  this.enableMotor = false;
};

b2RevoluteJointDef.prototype.__varz = function () {
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
};

b2RevoluteJointDef.prototype.Initialize = function (bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
};

b2RevoluteJointDef.prototype.localAnchorA = new b2Vec2();
b2RevoluteJointDef.prototype.localAnchorB = new b2Vec2();
b2RevoluteJointDef.prototype.referenceAngle = null;
b2RevoluteJointDef.prototype.enableLimit = null;
b2RevoluteJointDef.prototype.lowerAngle = null;
b2RevoluteJointDef.prototype.upperAngle = null;
b2RevoluteJointDef.prototype.enableMotor = null;
b2RevoluteJointDef.prototype.motorSpeed = null;
b2RevoluteJointDef.prototype.maxMotorTorque = null;

var b2MouseJointDef = function () {
  b2JointDef.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2MouseJointDef.prototype, b2JointDef.prototype);
b2MouseJointDef.prototype._super = b2JointDef.prototype;

b2MouseJointDef.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);

  this.type = b2Joint.e_mouseJoint;
  this.maxForce = 0;
  this.frequencyHz = 5;
  this.dampingRatio = 0.7;
};

b2MouseJointDef.prototype.__varz = function () {
  this.target = new b2Vec2();
};

b2MouseJointDef.prototype.target = new b2Vec2();
b2MouseJointDef.prototype.maxForce = null;
b2MouseJointDef.prototype.frequencyHz = null;
b2MouseJointDef.prototype.dampingRatio = null;

var b2Contact = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Contact.prototype.__constructor = function () {};

b2Contact.prototype.__varz = function () {
  this.m_nodeA = new b2ContactEdge();
  this.m_nodeB = new b2ContactEdge();
  this.m_manifold = new b2Manifold();
  this.m_oldManifold = new b2Manifold();
};

b2Contact.s_input = new b2TOIInput();
b2Contact.e_sensorFlag = 1;
b2Contact.e_continuousFlag = 2;
b2Contact.e_islandFlag = 4;
b2Contact.e_toiFlag = 8;
b2Contact.e_touchingFlag = 16;
b2Contact.e_enabledFlag = 32;
b2Contact.e_filterFlag = 64;

b2Contact.prototype.Reset = function (fixtureA, fixtureB) {
  this.m_flags = b2Contact.e_enabledFlag;

  if (!fixtureA || !fixtureB) {
    this.m_fixtureA = null;
    this.m_fixtureB = null;
    return;
  }

  if (fixtureA.IsSensor() || fixtureB.IsSensor()) {
    this.m_flags |= b2Contact.e_sensorFlag;
  }

  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();

  if (bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
    this.m_flags |= b2Contact.e_continuousFlag;
  }

  this.m_fixtureA = fixtureA;
  this.m_fixtureB = fixtureB;
  this.m_manifold.m_pointCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_nodeA.contact = null;
  this.m_nodeA.prev = null;
  this.m_nodeA.next = null;
  this.m_nodeA.other = null;
  this.m_nodeB.contact = null;
  this.m_nodeB.prev = null;
  this.m_nodeB.next = null;
  this.m_nodeB.other = null;
};

b2Contact.prototype.Update = function (listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.m_flags |= b2Contact.e_enabledFlag;
  var touching = false;
  var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
  var bodyA = this.m_fixtureA.m_body;
  var bodyB = this.m_fixtureB.m_body;
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);

  if (this.m_flags & b2Contact.e_sensorFlag) {
    if (aabbOverlap) {
      var shapeA = this.m_fixtureA.GetShape();
      var shapeB = this.m_fixtureB.GetShape();
      var xfA = bodyA.GetTransform();
      var xfB = bodyB.GetTransform();
      touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB);
    }

    this.m_manifold.m_pointCount = 0;
  } else {
    if (bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
      this.m_flags |= b2Contact.e_continuousFlag;
    } else {
      this.m_flags &= ~b2Contact.e_continuousFlag;
    }

    if (aabbOverlap) {
      this.Evaluate();
      touching = this.m_manifold.m_pointCount > 0;

      for (var i = 0; i < this.m_manifold.m_pointCount; ++i) {
        var mp2 = this.m_manifold.m_points[i];
        mp2.m_normalImpulse = 0;
        mp2.m_tangentImpulse = 0;
        var id2 = mp2.m_id;

        for (var j = 0; j < this.m_oldManifold.m_pointCount; ++j) {
          var mp1 = this.m_oldManifold.m_points[j];

          if (mp1.m_id.key == id2.key) {
            mp2.m_normalImpulse = mp1.m_normalImpulse;
            mp2.m_tangentImpulse = mp1.m_tangentImpulse;
            break;
          }
        }
      }
    } else {
      this.m_manifold.m_pointCount = 0;
    }

    if (touching != wasTouching) {
      bodyA.SetAwake(true);
      bodyB.SetAwake(true);
    }
  }

  if (touching) {
    this.m_flags |= b2Contact.e_touchingFlag;
  } else {
    this.m_flags &= ~b2Contact.e_touchingFlag;
  }

  if (wasTouching == false && touching == true) {
    listener.BeginContact(this);
  }

  if (wasTouching == true && touching == false) {
    listener.EndContact(this);
  }

  if ((this.m_flags & b2Contact.e_sensorFlag) == 0) {
    listener.PreSolve(this, this.m_oldManifold);
  }
};

b2Contact.prototype.Evaluate = function () {};

b2Contact.prototype.ComputeTOI = function (sweepA, sweepB) {
  b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  b2Contact.s_input.sweepA = sweepA;
  b2Contact.s_input.sweepB = sweepB;
  b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
  return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input);
};

b2Contact.prototype.GetManifold = function () {
  return this.m_manifold;
};

b2Contact.prototype.GetWorldManifold = function (worldManifold) {
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var shapeA = this.m_fixtureA.GetShape();
  var shapeB = this.m_fixtureB.GetShape();
  worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
};

b2Contact.prototype.IsTouching = function () {
  return (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
};

b2Contact.prototype.IsContinuous = function () {
  return (this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag;
};

b2Contact.prototype.SetSensor = function (sensor) {
  if (sensor) {
    this.m_flags |= b2Contact.e_sensorFlag;
  } else {
    this.m_flags &= ~b2Contact.e_sensorFlag;
  }
};

b2Contact.prototype.IsSensor = function () {
  return (this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag;
};

b2Contact.prototype.SetEnabled = function (flag) {
  if (flag) {
    this.m_flags |= b2Contact.e_enabledFlag;
  } else {
    this.m_flags &= ~b2Contact.e_enabledFlag;
  }
};

b2Contact.prototype.IsEnabled = function () {
  return (this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag;
};

b2Contact.prototype.GetNext = function () {
  return this.m_next;
};

b2Contact.prototype.GetFixtureA = function () {
  return this.m_fixtureA;
};

b2Contact.prototype.GetFixtureB = function () {
  return this.m_fixtureB;
};

b2Contact.prototype.FlagForFiltering = function () {
  this.m_flags |= b2Contact.e_filterFlag;
};

b2Contact.prototype.m_flags = 0;
b2Contact.prototype.m_prev = null;
b2Contact.prototype.m_next = null;
b2Contact.prototype.m_nodeA = new b2ContactEdge();
b2Contact.prototype.m_nodeB = new b2ContactEdge();
b2Contact.prototype.m_fixtureA = null;
b2Contact.prototype.m_fixtureB = null;
b2Contact.prototype.m_manifold = new b2Manifold();
b2Contact.prototype.m_oldManifold = new b2Manifold();
b2Contact.prototype.m_toi = null;

var b2ContactConstraint = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactConstraint.prototype.__constructor = function () {
  this.points = new Array(b2Settings.b2_maxManifoldPoints);

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
    this.points[i] = new b2ContactConstraintPoint();
  }
};

b2ContactConstraint.prototype.__varz = function () {
  this.localPlaneNormal = new b2Vec2();
  this.localPoint = new b2Vec2();
  this.normal = new b2Vec2();
  this.normalMass = new b2Mat22();
  this.K = new b2Mat22();
};

b2ContactConstraint.prototype.points = null;
b2ContactConstraint.prototype.localPlaneNormal = new b2Vec2();
b2ContactConstraint.prototype.localPoint = new b2Vec2();
b2ContactConstraint.prototype.normal = new b2Vec2();
b2ContactConstraint.prototype.normalMass = new b2Mat22();
b2ContactConstraint.prototype.K = new b2Mat22();
b2ContactConstraint.prototype.bodyA = null;
b2ContactConstraint.prototype.bodyB = null;
b2ContactConstraint.prototype.type = 0;
b2ContactConstraint.prototype.radius = null;
b2ContactConstraint.prototype.friction = null;
b2ContactConstraint.prototype.restitution = null;
b2ContactConstraint.prototype.pointCount = 0;
b2ContactConstraint.prototype.manifold = null;

var b2ContactResult = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactResult.prototype.__constructor = function () {};

b2ContactResult.prototype.__varz = function () {
  this.position = new b2Vec2();
  this.normal = new b2Vec2();
  this.id = new b2ContactID();
};

b2ContactResult.prototype.shape1 = null;
b2ContactResult.prototype.shape2 = null;
b2ContactResult.prototype.position = new b2Vec2();
b2ContactResult.prototype.normal = new b2Vec2();
b2ContactResult.prototype.normalImpulse = null;
b2ContactResult.prototype.tangentImpulse = null;
b2ContactResult.prototype.id = new b2ContactID();

var b2PolygonContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PolygonContact.prototype, b2Contact.prototype);
b2PolygonContact.prototype._super = b2Contact.prototype;

b2PolygonContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2PolygonContact.prototype.__varz = function () {};

b2PolygonContact.Create = function (allocator) {
  return new b2PolygonContact();
};

b2PolygonContact.Destroy = function (contact, allocator) {};

b2PolygonContact.prototype.Evaluate = function () {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};

b2PolygonContact.prototype.Reset = function (fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
};

var ClipVertex = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

ClipVertex.prototype.__constructor = function () {};

ClipVertex.prototype.__varz = function () {
  this.v = new b2Vec2();
  this.id = new b2ContactID();
};

ClipVertex.prototype.Set = function (other) {
  this.v.SetV(other.v);
  this.id.Set(other.id);
};

ClipVertex.prototype.v = new b2Vec2();
ClipVertex.prototype.id = new b2ContactID();

var b2ContactFilter = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactFilter.prototype.__constructor = function () {};

b2ContactFilter.prototype.__varz = function () {};

b2ContactFilter.b2_defaultFilter = new b2ContactFilter();

b2ContactFilter.prototype.ShouldCollide = function (fixtureA, fixtureB) {
  var filter1 = fixtureA.GetFilterData();
  var filter2 = fixtureB.GetFilterData();

  if (filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
    return filter1.groupIndex > 0;
  }

  var collide = (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
  return collide;
};

b2ContactFilter.prototype.RayCollide = function (userData, fixture) {
  if (!userData) {
    return true;
  }

  return this.ShouldCollide(userData, fixture);
};

var b2NullContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2NullContact.prototype, b2Contact.prototype);
b2NullContact.prototype._super = b2Contact.prototype;

b2NullContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2NullContact.prototype.__varz = function () {};

b2NullContact.prototype.Evaluate = function () {};

var b2ContactListener = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactListener.prototype.__constructor = function () {};

b2ContactListener.prototype.__varz = function () {};

b2ContactListener.b2_defaultListener = new b2ContactListener();

b2ContactListener.prototype.BeginContact = function (contact) {};

b2ContactListener.prototype.EndContact = function (contact) {};

b2ContactListener.prototype.PreSolve = function (contact, oldManifold) {};

b2ContactListener.prototype.PostSolve = function (contact, impulse) {};

var b2Island = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Island.prototype.__constructor = function () {
  this.m_bodies = new Array();
  this.m_contacts = new Array();
  this.m_joints = new Array();
};

b2Island.prototype.__varz = function () {};

b2Island.s_impulse = new b2ContactImpulse();

b2Island.prototype.Initialize = function (bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
  var i = 0;
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_allocator = allocator;
  this.m_listener = listener;
  this.m_contactSolver = contactSolver;

  for (i = this.m_bodies.length; i < bodyCapacity; i++) {
    this.m_bodies[i] = null;
  }

  for (i = this.m_contacts.length; i < contactCapacity; i++) {
    this.m_contacts[i] = null;
  }

  for (i = this.m_joints.length; i < jointCapacity; i++) {
    this.m_joints[i] = null;
  }
};

b2Island.prototype.Clear = function () {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
};

b2Island.prototype.Solve = function (step, gravity, allowSleep) {
  var i = 0;
  var j = 0;
  var b;
  var joint;

  for (i = 0; i < this.m_bodyCount; ++i) {
    b = this.m_bodies[i];

    if (b.GetType() != b2Body.b2_dynamicBody) {
      continue;
    }

    b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
    b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
    b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
    b.m_linearVelocity.Multiply(b2Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
    b.m_angularVelocity *= b2Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1);
  }

  this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  contactSolver.InitVelocityConstraints(step);

  for (i = 0; i < this.m_jointCount; ++i) {
    joint = this.m_joints[i];
    joint.InitVelocityConstraints(step);
  }

  for (i = 0; i < step.velocityIterations; ++i) {
    for (j = 0; j < this.m_jointCount; ++j) {
      joint = this.m_joints[j];
      joint.SolveVelocityConstraints(step);
    }

    contactSolver.SolveVelocityConstraints();
  }

  for (i = 0; i < this.m_jointCount; ++i) {
    joint = this.m_joints[i];
    joint.FinalizeVelocityConstraints();
  }

  contactSolver.FinalizeVelocityConstraints();

  for (i = 0; i < this.m_bodyCount; ++i) {
    b = this.m_bodies[i];

    if (b.GetType() == b2Body.b2_staticBody) {
      continue;
    }

    var translationX = step.dt * b.m_linearVelocity.x;
    var translationY = step.dt * b.m_linearVelocity.y;

    if (translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt;
    }

    var rotation = step.dt * b.m_angularVelocity;

    if (rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if (b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * step.inv_dt;
      } else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * step.inv_dt;
      }
    }

    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
    b.m_sweep.a += step.dt * b.m_angularVelocity;
    b.SynchronizeTransform();
  }

  for (i = 0; i < step.positionIterations; ++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
    var jointsOkay = true;

    for (j = 0; j < this.m_jointCount; ++j) {
      joint = this.m_joints[j];
      var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay;
    }

    if (contactsOkay && jointsOkay) {
      break;
    }
  }

  this.Report(contactSolver.m_constraints);

  if (allowSleep) {
    var minSleepTime = Number.MAX_VALUE;
    var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
    var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;

    for (i = 0; i < this.m_bodyCount; ++i) {
      b = this.m_bodies[i];

      if (b.GetType() == b2Body.b2_staticBody) {
        continue;
      }

      if ((b.m_flags & b2Body.e_allowSleepFlag) == 0) {
        b.m_sleepTime = 0;
        minSleepTime = 0;
      }

      if ((b.m_flags & b2Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0;
      } else {
        b.m_sleepTime += step.dt;
        minSleepTime = b2Math.Min(minSleepTime, b.m_sleepTime);
      }
    }

    if (minSleepTime >= b2Settings.b2_timeToSleep) {
      for (i = 0; i < this.m_bodyCount; ++i) {
        b = this.m_bodies[i];
        b.SetAwake(false);
      }
    }
  }
};

b2Island.prototype.SolveTOI = function (subStep) {
  var i = 0;
  var j = 0;
  this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;

  for (i = 0; i < this.m_jointCount; ++i) {
    this.m_joints[i].InitVelocityConstraints(subStep);
  }

  for (i = 0; i < subStep.velocityIterations; ++i) {
    contactSolver.SolveVelocityConstraints();

    for (j = 0; j < this.m_jointCount; ++j) {
      this.m_joints[j].SolveVelocityConstraints(subStep);
    }
  }

  for (i = 0; i < this.m_bodyCount; ++i) {
    var b = this.m_bodies[i];

    if (b.GetType() == b2Body.b2_staticBody) {
      continue;
    }

    var translationX = subStep.dt * b.m_linearVelocity.x;
    var translationY = subStep.dt * b.m_linearVelocity.y;

    if (translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt;
    }

    var rotation = subStep.dt * b.m_angularVelocity;

    if (rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if (b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * subStep.inv_dt;
      } else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt;
      }
    }

    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
    b.m_sweep.a += subStep.dt * b.m_angularVelocity;
    b.SynchronizeTransform();
  }

  var k_toiBaumgarte = 0.75;

  for (i = 0; i < subStep.positionIterations; ++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
    var jointsOkay = true;

    for (j = 0; j < this.m_jointCount; ++j) {
      var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay;
    }

    if (contactsOkay && jointsOkay) {
      break;
    }
  }

  this.Report(contactSolver.m_constraints);
};

b2Island.prototype.Report = function (constraints) {
  if (this.m_listener == null) {
    return;
  }

  for (var i = 0; i < this.m_contactCount; ++i) {
    var c = this.m_contacts[i];
    var cc = constraints[i];

    for (var j = 0; j < cc.pointCount; ++j) {
      b2Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
      b2Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
    }

    this.m_listener.PostSolve(c, b2Island.s_impulse);
  }
};

b2Island.prototype.AddBody = function (body) {
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body;
};

b2Island.prototype.AddContact = function (contact) {
  this.m_contacts[this.m_contactCount++] = contact;
};

b2Island.prototype.AddJoint = function (joint) {
  this.m_joints[this.m_jointCount++] = joint;
};

b2Island.prototype.m_allocator = null;
b2Island.prototype.m_listener = null;
b2Island.prototype.m_contactSolver = null;
b2Island.prototype.m_bodies = null;
b2Island.prototype.m_contacts = null;
b2Island.prototype.m_joints = null;
b2Island.prototype.m_bodyCount = 0;
b2Island.prototype.m_jointCount = 0;
b2Island.prototype.m_contactCount = 0;
b2Island.prototype.m_bodyCapacity = 0;
b2Island.prototype.m_contactCapacity = 0;
b2Island.prototype.m_jointCapacity = 0;

var b2PolyAndEdgeContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PolyAndEdgeContact.prototype, b2Contact.prototype);
b2PolyAndEdgeContact.prototype._super = b2Contact.prototype;

b2PolyAndEdgeContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2PolyAndEdgeContact.prototype.__varz = function () {};

b2PolyAndEdgeContact.Create = function (allocator) {
  return new b2PolyAndEdgeContact();
};

b2PolyAndEdgeContact.Destroy = function (contact, allocator) {};

b2PolyAndEdgeContact.prototype.Evaluate = function () {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};

b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function (manifold, polygon, xf1, edge, xf2) {};

b2PolyAndEdgeContact.prototype.Reset = function (fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);

  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape);
};

var b2Collision = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2Collision.prototype.__constructor = function () {};

b2Collision.prototype.__varz = function () {};

b2Collision.MakeClipPointVector = function () {
  var r = new Array(2);
  r[0] = new ClipVertex();
  r[1] = new ClipVertex();
  return r;
};

b2Collision.ClipSegmentToLine = function (vOut, vIn, normal, offset) {
  var cv;
  var numOut = 0;
  cv = vIn[0];
  var vIn0 = cv.v;
  cv = vIn[1];
  var vIn1 = cv.v;
  var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
  var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;

  if (distance0 <= 0) {
    vOut[numOut++].Set(vIn[0]);
  }

  if (distance1 <= 0) {
    vOut[numOut++].Set(vIn[1]);
  }

  if (distance0 * distance1 < 0) {
    var interp = distance0 / (distance0 - distance1);
    cv = vOut[numOut];
    var tVec = cv.v;
    tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
    tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
    cv = vOut[numOut];
    var cv2;

    if (distance0 > 0) {
      cv2 = vIn[0];
      cv.id = cv2.id;
    } else {
      cv2 = vIn[1];
      cv.id = cv2.id;
    }

    ++numOut;
  }

  return numOut;
};

b2Collision.EdgeSeparation = function (poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
  var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
  var index = 0;
  var minDot = Number.MAX_VALUE;

  for (var i = 0; i < count2; ++i) {
    tVec = vertices2[i];
    var dot = tVec.x * normal1X + tVec.y * normal1Y;

    if (dot < minDot) {
      minDot = dot;
      index = i;
    }
  }

  tVec = vertices1[edge1];
  tMat = xf1.R;
  var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tVec = vertices2[index];
  tMat = xf2.R;
  var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  v2X -= v1X;
  v2Y -= v1Y;
  var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
  return separation;
};

b2Collision.FindMaxSeparation = function (edgeIndex, poly1, xf1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = poly2.m_centroid;
  var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf1.R;
  tVec = poly1.m_centroid;
  dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
  var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
  var edge = 0;
  var maxDot = -Number.MAX_VALUE;

  for (var i = 0; i < count1; ++i) {
    tVec = normals1[i];
    var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;

    if (dot > maxDot) {
      maxDot = dot;
      edge = i;
    }
  }

  var s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
  var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
  var sPrev = b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
  var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
  var sNext = b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
  var bestEdge = 0;
  var bestSeparation;
  var increment = 0;

  if (sPrev > s && sPrev > sNext) {
    increment = -1;
    bestEdge = prevEdge;
    bestSeparation = sPrev;
  } else {
    if (sNext > s) {
      increment = 1;
      bestEdge = nextEdge;
      bestSeparation = sNext;
    } else {
      edgeIndex[0] = edge;
      return s;
    }
  }

  while (true) {
    if (increment == -1) {
      edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1;
    } else {
      edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0;
    }

    s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);

    if (s > bestSeparation) {
      bestEdge = edge;
      bestSeparation = s;
    } else {
      break;
    }
  }

  edgeIndex[0] = bestEdge;
  return bestSeparation;
};

b2Collision.FindIncidentEdge = function (c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
  normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
  normal1X = tX;
  var index = 0;
  var minDot = Number.MAX_VALUE;

  for (var i = 0; i < count2; ++i) {
    tVec = normals2[i];
    var dot = normal1X * tVec.x + normal1Y * tVec.y;

    if (dot < minDot) {
      minDot = dot;
      index = i;
    }
  }

  var tClip;
  var i1 = index;
  var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  tClip = c[0];
  tVec = vertices2[i1];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i1;
  tClip.id.features.incidentVertex = 0;
  tClip = c[1];
  tVec = vertices2[i2];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i2;
  tClip.id.features.incidentVertex = 1;
};

b2Collision.CollidePolygons = function (manifold, polyA, xfA, polyB, xfB) {
  var cv;
  manifold.m_pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;
  var edgeA = 0;
  b2Collision.s_edgeAO[0] = edgeA;
  var separationA = b2Collision.FindMaxSeparation(b2Collision.s_edgeAO, polyA, xfA, polyB, xfB);
  edgeA = b2Collision.s_edgeAO[0];

  if (separationA > totalRadius) {
    return;
  }

  var edgeB = 0;
  b2Collision.s_edgeBO[0] = edgeB;
  var separationB = b2Collision.FindMaxSeparation(b2Collision.s_edgeBO, polyB, xfB, polyA, xfA);
  edgeB = b2Collision.s_edgeBO[0];

  if (separationB > totalRadius) {
    return;
  }

  var poly1;
  var poly2;
  var xf1;
  var xf2;
  var edge1 = 0;
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.0010;
  var tMat;

  if (separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB;
    manifold.m_type = b2Manifold.e_faceB;
    flip = 1;
  } else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA;
    manifold.m_type = b2Manifold.e_faceA;
    flip = 0;
  }

  var incidentEdge = b2Collision.s_incidentEdge;
  b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var local_v11 = vertices1[edge1];
  var local_v12;

  if (edge1 + 1 < count1) {
    local_v12 = vertices1[parseInt(edge1 + 1)];
  } else {
    local_v12 = vertices1[0];
  }

  var localTangent = b2Collision.s_localTangent;
  localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
  localTangent.Normalize();
  var localNormal = b2Collision.s_localNormal;
  localNormal.x = localTangent.y;
  localNormal.y = -localTangent.x;
  var planePoint = b2Collision.s_planePoint;
  planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
  var tangent = b2Collision.s_tangent;
  tMat = xf1.R;
  tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
  tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
  var tangent2 = b2Collision.s_tangent2;
  tangent2.x = -tangent.x;
  tangent2.y = -tangent.y;
  var normal = b2Collision.s_normal;
  normal.x = tangent.y;
  normal.y = -tangent.x;
  var v11 = b2Collision.s_v11;
  var v12 = b2Collision.s_v12;
  v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
  v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
  v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
  v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
  var frontOffset = normal.x * v11.x + normal.y * v11.y;
  var sideOffset1 = -tangent.x * v11.x - tangent.y * v11.y + totalRadius;
  var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
  var clipPoints1 = b2Collision.s_clipPoints1;
  var clipPoints2 = b2Collision.s_clipPoints2;
  var np = 0;
  np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);

  if (np < 2) {
    return;
  }

  np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);

  if (np < 2) {
    return;
  }

  manifold.m_localPlaneNormal.SetV(localNormal);
  manifold.m_localPoint.SetV(planePoint);
  var pointCount = 0;

  for (var i = 0; i < b2Settings.b2_maxManifoldPoints; ++i) {
    cv = clipPoints2[i];
    var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;

    if (separation <= totalRadius) {
      var cp = manifold.m_points[pointCount];
      tMat = xf2.R;
      var tX = cv.v.x - xf2.position.x;
      var tY = cv.v.y - xf2.position.y;
      cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
      cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
      cp.m_id.Set(cv.id);
      cp.m_id.features.flip = flip;
      ++pointCount;
    }
  }

  manifold.m_pointCount = pointCount;
};

b2Collision.CollideCircles = function (manifold, circle1, xf1, circle2, xf2) {
  manifold.m_pointCount = 0;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = circle1.m_p;
  var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf2.R;
  tVec = circle2.m_p;
  var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var distSqr = dX * dX + dY * dY;
  var radius = circle1.m_radius + circle2.m_radius;

  if (distSqr > radius * radius) {
    return;
  }

  manifold.m_type = b2Manifold.e_circles;
  manifold.m_localPoint.SetV(circle1.m_p);
  manifold.m_localPlaneNormal.SetZero();
  manifold.m_pointCount = 1;
  manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
  manifold.m_points[0].m_id.key = 0;
};

b2Collision.CollidePolygonAndCircle = function (manifold, polygon, xf1, circle, xf2) {
  manifold.m_pointCount = 0;
  var tPoint;
  var dX;
  var dY;
  var positionX;
  var positionY;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = circle.m_p;
  var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  dX = cX - xf1.position.x;
  dY = cY - xf1.position.y;
  tMat = xf1.R;
  var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
  var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
  var dist;
  var normalIndex = 0;
  var separation = -Number.MAX_VALUE;
  var radius = polygon.m_radius + circle.m_radius;
  var vertexCount = polygon.m_vertexCount;
  var vertices = polygon.m_vertices;
  var normals = polygon.m_normals;

  for (var i = 0; i < vertexCount; ++i) {
    tVec = vertices[i];
    dX = cLocalX - tVec.x;
    dY = cLocalY - tVec.y;
    tVec = normals[i];
    var s = tVec.x * dX + tVec.y * dY;

    if (s > radius) {
      return;
    }

    if (s > separation) {
      separation = s;
      normalIndex = i;
    }
  }

  var vertIndex1 = normalIndex;
  var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
  var v1 = vertices[vertIndex1];
  var v2 = vertices[vertIndex2];

  if (separation < Number.MIN_VALUE) {
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
    manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
    manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
    return;
  }

  var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
  var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);

  if (u1 <= 0) {
    if ((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) {
      return;
    }

    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.x = cLocalX - v1.x;
    manifold.m_localPlaneNormal.y = cLocalY - v1.y;
    manifold.m_localPlaneNormal.Normalize();
    manifold.m_localPoint.SetV(v1);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
  } else {
    if (u2 <= 0) {
      if ((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) {
        return;
      }

      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = cLocalX - v2.x;
      manifold.m_localPlaneNormal.y = cLocalY - v2.y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.SetV(v2);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0;
    } else {
      var faceCenterX = 0.5 * (v1.x + v2.x);
      var faceCenterY = 0.5 * (v1.y + v2.y);
      separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;

      if (separation > radius) {
        return;
      }

      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
      manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.Set(faceCenterX, faceCenterY);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0;
    }
  }
};

b2Collision.TestOverlap = function (a, b) {
  var t1 = b.lowerBound;
  var t2 = a.upperBound;
  var d1X = t1.x - t2.x;
  var d1Y = t1.y - t2.y;
  t1 = a.lowerBound;
  t2 = b.upperBound;
  var d2X = t1.x - t2.x;
  var d2Y = t1.y - t2.y;

  if (d1X > 0 || d1Y > 0) {
    return false;
  }

  if (d2X > 0 || d2Y > 0) {
    return false;
  }

  return true;
};

b2Collision.b2_nullFeature = 255;
b2Collision.s_incidentEdge = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints1 = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints2 = b2Collision.MakeClipPointVector();
b2Collision.s_edgeAO = new Array(1);
b2Collision.s_edgeBO = new Array(1);
b2Collision.s_localTangent = new b2Vec2();
b2Collision.s_localNormal = new b2Vec2();
b2Collision.s_planePoint = new b2Vec2();
b2Collision.s_normal = new b2Vec2();
b2Collision.s_tangent = new b2Vec2();
b2Collision.s_tangent2 = new b2Vec2();
b2Collision.s_v11 = new b2Vec2();
b2Collision.s_v12 = new b2Vec2();
b2Collision.b2CollidePolyTempVec = new b2Vec2();

var b2PolyAndCircleContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
b2PolyAndCircleContact.prototype._super = b2Contact.prototype;

b2PolyAndCircleContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2PolyAndCircleContact.prototype.__varz = function () {};

b2PolyAndCircleContact.Create = function (allocator) {
  return new b2PolyAndCircleContact();
};

b2PolyAndCircleContact.Destroy = function (contact, allocator) {};

b2PolyAndCircleContact.prototype.Evaluate = function () {
  var bA = this.m_fixtureA.m_body;
  var bB = this.m_fixtureB.m_body;
  b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};

b2PolyAndCircleContact.prototype.Reset = function (fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);

  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape);
};

var b2ContactPoint = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactPoint.prototype.__constructor = function () {};

b2ContactPoint.prototype.__varz = function () {
  this.position = new b2Vec2();
  this.velocity = new b2Vec2();
  this.normal = new b2Vec2();
  this.id = new b2ContactID();
};

b2ContactPoint.prototype.shape1 = null;
b2ContactPoint.prototype.shape2 = null;
b2ContactPoint.prototype.position = new b2Vec2();
b2ContactPoint.prototype.velocity = new b2Vec2();
b2ContactPoint.prototype.normal = new b2Vec2();
b2ContactPoint.prototype.separation = null;
b2ContactPoint.prototype.friction = null;
b2ContactPoint.prototype.restitution = null;
b2ContactPoint.prototype.id = new b2ContactID();

var b2CircleContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2CircleContact.prototype, b2Contact.prototype);
b2CircleContact.prototype._super = b2Contact.prototype;

b2CircleContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2CircleContact.prototype.__varz = function () {};

b2CircleContact.Create = function (allocator) {
  return new b2CircleContact();
};

b2CircleContact.Destroy = function (contact, allocator) {};

b2CircleContact.prototype.Evaluate = function () {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};

b2CircleContact.prototype.Reset = function (fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
};

var b2EdgeAndCircleContact = function () {
  b2Contact.prototype.__varz.call(this);

  this.__varz();

  this.__constructor.apply(this, arguments);
};

extend(b2EdgeAndCircleContact.prototype, b2Contact.prototype);
b2EdgeAndCircleContact.prototype._super = b2Contact.prototype;

b2EdgeAndCircleContact.prototype.__constructor = function () {
  this._super.__constructor.apply(this, arguments);
};

b2EdgeAndCircleContact.prototype.__varz = function () {};

b2EdgeAndCircleContact.Create = function (allocator) {
  return new b2EdgeAndCircleContact();
};

b2EdgeAndCircleContact.Destroy = function (contact, allocator) {};

b2EdgeAndCircleContact.prototype.Evaluate = function () {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf);
};

b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function (manifold, edge, xf1, circle, xf2) {};

b2EdgeAndCircleContact.prototype.Reset = function (fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
};

var b2ContactManager = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2ContactManager.prototype.__constructor = function () {
  this.m_world = null;
  this.m_contactCount = 0;
  this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
  this.m_contactListener = b2ContactListener.b2_defaultListener;
  this.m_contactFactory = new b2ContactFactory(this.m_allocator);
  this.m_broadPhase = new b2DynamicTreeBroadPhase();
};

b2ContactManager.prototype.__varz = function () {};

b2ContactManager.s_evalCP = new b2ContactPoint();

b2ContactManager.prototype.AddPair = function (proxyUserDataA, proxyUserDataB) {
  var fixtureA = proxyUserDataA;
  var fixtureB = proxyUserDataB;
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();

  if (bodyA == bodyB) {
    return;
  }

  var edge = bodyB.GetContactList();

  while (edge) {
    if (edge.other == bodyA) {
      var fA = edge.contact.GetFixtureA();
      var fB = edge.contact.GetFixtureB();

      if (fA == fixtureA && fB == fixtureB) {
        return;
      }

      if (fA == fixtureB && fB == fixtureA) {
        return;
      }
    }

    edge = edge.next;
  }

  if (bodyB.ShouldCollide(bodyA) == false) {
    return;
  }

  if (this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
    return;
  }

  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
  fixtureA = c.GetFixtureA();
  fixtureB = c.GetFixtureB();
  bodyA = fixtureA.m_body;
  bodyB = fixtureB.m_body;
  c.m_prev = null;
  c.m_next = this.m_world.m_contactList;

  if (this.m_world.m_contactList != null) {
    this.m_world.m_contactList.m_prev = c;
  }

  this.m_world.m_contactList = c;
  c.m_nodeA.contact = c;
  c.m_nodeA.other = bodyB;
  c.m_nodeA.prev = null;
  c.m_nodeA.next = bodyA.m_contactList;

  if (bodyA.m_contactList != null) {
    bodyA.m_contactList.prev = c.m_nodeA;
  }

  bodyA.m_contactList = c.m_nodeA;
  c.m_nodeB.contact = c;
  c.m_nodeB.other = bodyA;
  c.m_nodeB.prev = null;
  c.m_nodeB.next = bodyB.m_contactList;

  if (bodyB.m_contactList != null) {
    bodyB.m_contactList.prev = c.m_nodeB;
  }

  bodyB.m_contactList = c.m_nodeB;
  ++this.m_world.m_contactCount;
  return;
};

b2ContactManager.prototype.FindNewContacts = function () {
  var that = this;
  this.m_broadPhase.UpdatePairs(function (a, b) {
    return that.AddPair(a, b);
  });
};

b2ContactManager.prototype.Destroy = function (c) {
  var fixtureA = c.GetFixtureA();
  var fixtureB = c.GetFixtureB();
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();

  if (c.IsTouching()) {
    this.m_contactListener.EndContact(c);
  }

  if (c.m_prev) {
    c.m_prev.m_next = c.m_next;
  }

  if (c.m_next) {
    c.m_next.m_prev = c.m_prev;
  }

  if (c == this.m_world.m_contactList) {
    this.m_world.m_contactList = c.m_next;
  }

  if (c.m_nodeA.prev) {
    c.m_nodeA.prev.next = c.m_nodeA.next;
  }

  if (c.m_nodeA.next) {
    c.m_nodeA.next.prev = c.m_nodeA.prev;
  }

  if (c.m_nodeA == bodyA.m_contactList) {
    bodyA.m_contactList = c.m_nodeA.next;
  }

  if (c.m_nodeB.prev) {
    c.m_nodeB.prev.next = c.m_nodeB.next;
  }

  if (c.m_nodeB.next) {
    c.m_nodeB.next.prev = c.m_nodeB.prev;
  }

  if (c.m_nodeB == bodyB.m_contactList) {
    bodyB.m_contactList = c.m_nodeB.next;
  }

  this.m_contactFactory.Destroy(c);
  --this.m_contactCount;
};

b2ContactManager.prototype.Collide = function () {
  var c = this.m_world.m_contactList;

  while (c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();

    if (bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
      c = c.GetNext();
      continue;
    }

    if (c.m_flags & b2Contact.e_filterFlag) {
      if (bodyB.ShouldCollide(bodyA) == false) {
        var cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue;
      }

      if (this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
        cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue;
      }

      c.m_flags &= ~b2Contact.e_filterFlag;
    }

    var proxyA = fixtureA.m_proxy;
    var proxyB = fixtureB.m_proxy;
    var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);

    if (overlap == false) {
      cNuke = c;
      c = cNuke.GetNext();
      this.Destroy(cNuke);
      continue;
    }

    c.Update(this.m_contactListener);
    c = c.GetNext();
  }
};

b2ContactManager.prototype.m_world = null;
b2ContactManager.prototype.m_broadPhase = null;
b2ContactManager.prototype.m_contactList = null;
b2ContactManager.prototype.m_contactCount = 0;
b2ContactManager.prototype.m_contactFilter = null;
b2ContactManager.prototype.m_contactListener = null;
b2ContactManager.prototype.m_contactFactory = null;
b2ContactManager.prototype.m_allocator = null;

var b2World = function () {
  this.__varz();

  this.__constructor.apply(this, arguments);
};

b2World.prototype.__constructor = function (gravity, doSleep) {
  this.m_destructionListener = null;
  this.m_debugDraw = null;
  this.m_bodyList = null;
  this.m_contactList = null;
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_controllerCount = 0;
  b2World.m_warmStarting = true;
  b2World.m_continuousPhysics = true;
  this.m_allowSleep = doSleep;
  this.m_gravity = gravity;
  this.m_inv_dt0 = 0;
  this.m_contactManager.m_world = this;
  var bd = new b2BodyDef();
  this.m_groundBody = this.CreateBody(bd);
};

b2World.prototype.__varz = function () {
  this.s_stack = new Array();
  this.m_contactManager = new b2ContactManager();
  this.m_contactSolver = new b2ContactSolver();
  this.m_island = new b2Island();
};

b2World.s_timestep2 = new b2TimeStep();
b2World.s_backupA = new b2Sweep();
b2World.s_backupB = new b2Sweep();
b2World.s_timestep = new b2TimeStep();
b2World.s_queue = new Array();
b2World.e_newFixture = 1;
b2World.e_locked = 2;
b2World.s_xf = new b2Transform();
b2World.s_jointColor = new b2Color(0.5, 0.8, 0.8);
b2World.m_warmStarting = null;
b2World.m_continuousPhysics = null;

b2World.prototype.Solve = function (step) {
  var b;

  for (var controller = this.m_controllerList; controller; controller = controller.m_next) {
    controller.Step(step);
  }

  var island = this.m_island;
  island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);

  for (b = this.m_bodyList; b; b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
  }

  for (var c = this.m_contactList; c; c = c.m_next) {
    c.m_flags &= ~b2Contact.e_islandFlag;
  }

  for (var j = this.m_jointList; j; j = j.m_next) {
    j.m_islandFlag = false;
  }

  var stackSize = this.m_bodyCount;
  var stack = this.s_stack;

  for (var seed = this.m_bodyList; seed; seed = seed.m_next) {
    if (seed.m_flags & b2Body.e_islandFlag) {
      continue;
    }

    if (seed.IsAwake() == false || seed.IsActive() == false) {
      continue;
    }

    if (seed.GetType() == b2Body.b2_staticBody) {
      continue;
    }

    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;

    while (stackCount > 0) {
      b = stack[--stackCount];
      island.AddBody(b);

      if (b.IsAwake() == false) {
        b.SetAwake(true);
      }

      if (b.GetType() == b2Body.b2_staticBody) {
        continue;
      }

      var other;

      for (var ce = b.m_contactList; ce; ce = ce.next) {
        if (ce.contact.m_flags & b2Contact.e_islandFlag) {
          continue;
        }

        if (ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
          continue;
        }

        island.AddContact(ce.contact);
        ce.contact.m_flags |= b2Contact.e_islandFlag;
        other = ce.other;

        if (other.m_flags & b2Body.e_islandFlag) {
          continue;
        }

        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag;
      }

      for (var jn = b.m_jointList; jn; jn = jn.next) {
        if (jn.joint.m_islandFlag == true) {
          continue;
        }

        other = jn.other;

        if (other.IsActive() == false) {
          continue;
        }

        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;

        if (other.m_flags & b2Body.e_islandFlag) {
          continue;
        }

        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag;
      }
    }

    island.Solve(step, this.m_gravity, this.m_allowSleep);

    for (var i = 0; i < island.m_bodyCount; ++i) {
      b = island.m_bodies[i];

      if (b.GetType() == b2Body.b2_staticBody) {
        b.m_flags &= ~b2Body.e_islandFlag;
      }
    }
  }

  for (i = 0; i < stack.length; ++i) {
    if (!stack[i]) {
      break;
    }

    stack[i] = null;
  }

  for (b = this.m_bodyList; b; b = b.m_next) {
    if (b.IsAwake() == false || b.IsActive() == false) {
      continue;
    }

    if (b.GetType() == b2Body.b2_staticBody) {
      continue;
    }

    b.SynchronizeFixtures();
  }

  this.m_contactManager.FindNewContacts();
};

b2World.prototype.SolveTOI = function (step) {
  var b;
  var fA;
  var fB;
  var bA;
  var bB;
  var cEdge;
  var j;
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  var queue = b2World.s_queue;

  for (b = this.m_bodyList; b; b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
    b.m_sweep.t0 = 0;
  }

  var c;

  for (c = this.m_contactList; c; c = c.m_next) {
    c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag);
  }

  for (j = this.m_jointList; j; j = j.m_next) {
    j.m_islandFlag = false;
  }

  for (;;) {
    var minContact = null;
    var minTOI = 1;

    for (c = this.m_contactList; c; c = c.m_next) {
      if (c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
        continue;
      }

      var toi = 1;

      if (c.m_flags & b2Contact.e_toiFlag) {
        toi = c.m_toi;
      } else {
        fA = c.m_fixtureA;
        fB = c.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;

        if ((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
          continue;
        }

        var t0 = bA.m_sweep.t0;

        if (bA.m_sweep.t0 < bB.m_sweep.t0) {
          t0 = bB.m_sweep.t0;
          bA.m_sweep.Advance(t0);
        } else {
          if (bB.m_sweep.t0 < bA.m_sweep.t0) {
            t0 = bA.m_sweep.t0;
            bB.m_sweep.Advance(t0);
          }
        }

        toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
        b2Settings.b2Assert(0 <= toi && toi <= 1);

        if (toi > 0 && toi < 1) {
          toi = (1 - toi) * t0 + toi;

          if (toi > 1) {
            toi = 1;
          }
        }

        c.m_toi = toi;
        c.m_flags |= b2Contact.e_toiFlag;
      }

      if (Number.MIN_VALUE < toi && toi < minTOI) {
        minContact = c;
        minTOI = toi;
      }
    }

    if (minContact == null || 1 - 100 * Number.MIN_VALUE < minTOI) {
      break;
    }

    fA = minContact.m_fixtureA;
    fB = minContact.m_fixtureB;
    bA = fA.m_body;
    bB = fB.m_body;
    b2World.s_backupA.Set(bA.m_sweep);
    b2World.s_backupB.Set(bB.m_sweep);
    bA.Advance(minTOI);
    bB.Advance(minTOI);
    minContact.Update(this.m_contactManager.m_contactListener);
    minContact.m_flags &= ~b2Contact.e_toiFlag;

    if (minContact.IsSensor() == true || minContact.IsEnabled() == false) {
      bA.m_sweep.Set(b2World.s_backupA);
      bB.m_sweep.Set(b2World.s_backupB);
      bA.SynchronizeTransform();
      bB.SynchronizeTransform();
      continue;
    }

    if (minContact.IsTouching() == false) {
      continue;
    }

    var seed = bA;

    if (seed.GetType() != b2Body.b2_dynamicBody) {
      seed = bB;
    }

    island.Clear();
    var queueStart = 0;
    var queueSize = 0;
    queue[queueStart + queueSize++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;

    while (queueSize > 0) {
      b = queue[queueStart++];
      --queueSize;
      island.AddBody(b);

      if (b.IsAwake() == false) {
        b.SetAwake(true);
      }

      if (b.GetType() != b2Body.b2_dynamicBody) {
        continue;
      }

      for (cEdge = b.m_contactList; cEdge; cEdge = cEdge.next) {
        if (island.m_contactCount == island.m_contactCapacity) {
          break;
        }

        if (cEdge.contact.m_flags & b2Contact.e_islandFlag) {
          continue;
        }

        if (cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
          continue;
        }

        island.AddContact(cEdge.contact);
        cEdge.contact.m_flags |= b2Contact.e_islandFlag;
        var other = cEdge.other;

        if (other.m_flags & b2Body.e_islandFlag) {
          continue;
        }

        if (other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true);
        }

        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag;
      }

      for (var jEdge = b.m_jointList; jEdge; jEdge = jEdge.next) {
        if (island.m_jointCount == island.m_jointCapacity) {
          continue;
        }

        if (jEdge.joint.m_islandFlag == true) {
          continue;
        }

        other = jEdge.other;

        if (other.IsActive() == false) {
          continue;
        }

        island.AddJoint(jEdge.joint);
        jEdge.joint.m_islandFlag = true;

        if (other.m_flags & b2Body.e_islandFlag) {
          continue;
        }

        if (other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true);
        }

        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag;
      }
    }

    var subStep = b2World.s_timestep;
    subStep.warmStarting = false;
    subStep.dt = (1 - minTOI) * step.dt;
    subStep.inv_dt = 1 / subStep.dt;
    subStep.dtRatio = 0;
    subStep.velocityIterations = step.velocityIterations;
    subStep.positionIterations = step.positionIterations;
    island.SolveTOI(subStep);
    var i = 0;

    for (i = 0; i < island.m_bodyCount; ++i) {
      b = island.m_bodies[i];
      b.m_flags &= ~b2Body.e_islandFlag;

      if (b.IsAwake() == false) {
        continue;
      }

      if (b.GetType() != b2Body.b2_dynamicBody) {
        continue;
      }

      b.SynchronizeFixtures();

      for (cEdge = b.m_contactList; cEdge; cEdge = cEdge.next) {
        cEdge.contact.m_flags &= ~b2Contact.e_toiFlag;
      }
    }

    for (i = 0; i < island.m_contactCount; ++i) {
      c = island.m_contacts[i];
      c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag);
    }

    for (i = 0; i < island.m_jointCount; ++i) {
      j = island.m_joints[i];
      j.m_islandFlag = false;
    }

    this.m_contactManager.FindNewContacts();
  }
};

b2World.prototype.DrawJoint = function (joint) {
  var b1 = joint.GetBodyA();
  var b2 = joint.GetBodyB();
  var xf1 = b1.m_xf;
  var xf2 = b2.m_xf;
  var x1 = xf1.position;
  var x2 = xf2.position;
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();
  var color = b2World.s_jointColor;

  switch (joint.m_type) {
    case b2Joint.e_distanceJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;

    case b2Joint.e_pulleyJoint:
      var pulley = joint;
      var s1 = pulley.GetGroundAnchorA();
      var s2 = pulley.GetGroundAnchorB();
      this.m_debugDraw.DrawSegment(s1, p1, color);
      this.m_debugDraw.DrawSegment(s2, p2, color);
      this.m_debugDraw.DrawSegment(s1, s2, color);
      break;

    case b2Joint.e_mouseJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;

    default:
      if (b1 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x1, p1, color);
      }

      this.m_debugDraw.DrawSegment(p1, p2, color);

      if (b2 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x2, p2, color);
      }

  }
};

b2World.prototype.DrawShape = function (shape, xf, color) {
  switch (shape.m_type) {
    case b2Shape.e_circleShape:
      var circle = shape;
      var center = b2Math.MulX(xf, circle.m_p);
      var radius = circle.m_radius;
      var axis = xf.R.col1;
      this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
      break;

    case b2Shape.e_polygonShape:
      var i = 0;
      var poly = shape;
      var vertexCount = poly.GetVertexCount();
      var localVertices = poly.GetVertices();
      var vertices = new Array(vertexCount);

      for (i = 0; i < vertexCount; ++i) {
        vertices[i] = b2Math.MulX(xf, localVertices[i]);
      }

      this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
      break;

    case b2Shape.e_edgeShape:
      var edge = shape;
      this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
      break;
  }
};

b2World.prototype.SetDestructionListener = function (listener) {
  this.m_destructionListener = listener;
};

b2World.prototype.SetContactFilter = function (filter) {
  this.m_contactManager.m_contactFilter = filter;
};

b2World.prototype.SetContactListener = function (listener) {
  this.m_contactManager.m_contactListener = listener;
};

b2World.prototype.SetDebugDraw = function (debugDraw) {
  this.m_debugDraw = debugDraw;
};

b2World.prototype.SetBroadPhase = function (broadPhase) {
  var oldBroadPhase = this.m_contactManager.m_broadPhase;
  this.m_contactManager.m_broadPhase = broadPhase;

  for (var b = this.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f);
    }
  }
};

b2World.prototype.Validate = function () {
  this.m_contactManager.m_broadPhase.Validate();
};

b2World.prototype.GetProxyCount = function () {
  return this.m_contactManager.m_broadPhase.GetProxyCount();
};

b2World.prototype.CreateBody = function (def) {
  if (this.IsLocked() == true) {
    return null;
  }

  var b = new b2Body(def, this);
  b.m_prev = null;
  b.m_next = this.m_bodyList;

  if (this.m_bodyList) {
    this.m_bodyList.m_prev = b;
  }

  this.m_bodyList = b;
  ++this.m_bodyCount;
  return b;
};

b2World.prototype.DestroyBody = function (b) {
  if (this.IsLocked() == true) {
    return;
  }

  var jn = b.m_jointList;

  while (jn) {
    var jn0 = jn;
    jn = jn.next;

    if (this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeJoint(jn0.joint);
    }

    this.DestroyJoint(jn0.joint);
  }

  var coe = b.m_controllerList;

  while (coe) {
    var coe0 = coe;
    coe = coe.nextController;
    coe0.controller.RemoveBody(b);
  }

  var ce = b.m_contactList;

  while (ce) {
    var ce0 = ce;
    ce = ce.next;
    this.m_contactManager.Destroy(ce0.contact);
  }

  b.m_contactList = null;
  var f = b.m_fixtureList;

  while (f) {
    var f0 = f;
    f = f.m_next;

    if (this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeFixture(f0);
    }

    f0.DestroyProxy(this.m_contactManager.m_broadPhase);
    f0.Destroy();
  }

  b.m_fixtureList = null;
  b.m_fixtureCount = 0;

  if (b.m_prev) {
    b.m_prev.m_next = b.m_next;
  }

  if (b.m_next) {
    b.m_next.m_prev = b.m_prev;
  }

  if (b == this.m_bodyList) {
    this.m_bodyList = b.m_next;
  }

  --this.m_bodyCount;
};

b2World.prototype.CreateJoint = function (def) {
  var j = b2Joint.Create(def, null);
  j.m_prev = null;
  j.m_next = this.m_jointList;

  if (this.m_jointList) {
    this.m_jointList.m_prev = j;
  }

  this.m_jointList = j;
  ++this.m_jointCount;
  j.m_edgeA.joint = j;
  j.m_edgeA.other = j.m_bodyB;
  j.m_edgeA.prev = null;
  j.m_edgeA.next = j.m_bodyA.m_jointList;

  if (j.m_bodyA.m_jointList) {
    j.m_bodyA.m_jointList.prev = j.m_edgeA;
  }

  j.m_bodyA.m_jointList = j.m_edgeA;
  j.m_edgeB.joint = j;
  j.m_edgeB.other = j.m_bodyA;
  j.m_edgeB.prev = null;
  j.m_edgeB.next = j.m_bodyB.m_jointList;

  if (j.m_bodyB.m_jointList) {
    j.m_bodyB.m_jointList.prev = j.m_edgeB;
  }

  j.m_bodyB.m_jointList = j.m_edgeB;
  var bodyA = def.bodyA;
  var bodyB = def.bodyB;

  if (def.collideConnected == false) {
    var edge = bodyB.GetContactList();

    while (edge) {
      if (edge.other == bodyA) {
        edge.contact.FlagForFiltering();
      }

      edge = edge.next;
    }
  }

  return j;
};

b2World.prototype.DestroyJoint = function (j) {
  var collideConnected = j.m_collideConnected;

  if (j.m_prev) {
    j.m_prev.m_next = j.m_next;
  }

  if (j.m_next) {
    j.m_next.m_prev = j.m_prev;
  }

  if (j == this.m_jointList) {
    this.m_jointList = j.m_next;
  }

  var bodyA = j.m_bodyA;
  var bodyB = j.m_bodyB;
  bodyA.SetAwake(true);
  bodyB.SetAwake(true);

  if (j.m_edgeA.prev) {
    j.m_edgeA.prev.next = j.m_edgeA.next;
  }

  if (j.m_edgeA.next) {
    j.m_edgeA.next.prev = j.m_edgeA.prev;
  }

  if (j.m_edgeA == bodyA.m_jointList) {
    bodyA.m_jointList = j.m_edgeA.next;
  }

  j.m_edgeA.prev = null;
  j.m_edgeA.next = null;

  if (j.m_edgeB.prev) {
    j.m_edgeB.prev.next = j.m_edgeB.next;
  }

  if (j.m_edgeB.next) {
    j.m_edgeB.next.prev = j.m_edgeB.prev;
  }

  if (j.m_edgeB == bodyB.m_jointList) {
    bodyB.m_jointList = j.m_edgeB.next;
  }

  j.m_edgeB.prev = null;
  j.m_edgeB.next = null;
  b2Joint.Destroy(j, null);
  --this.m_jointCount;

  if (collideConnected == false) {
    var edge = bodyB.GetContactList();

    while (edge) {
      if (edge.other == bodyA) {
        edge.contact.FlagForFiltering();
      }

      edge = edge.next;
    }
  }
};

b2World.prototype.AddController = function (c) {
  c.m_next = this.m_controllerList;
  c.m_prev = null;
  this.m_controllerList = c;
  c.m_world = this;
  this.m_controllerCount++;
  return c;
};

b2World.prototype.RemoveController = function (c) {
  if (c.m_prev) {
    c.m_prev.m_next = c.m_next;
  }

  if (c.m_next) {
    c.m_next.m_prev = c.m_prev;
  }

  if (this.m_controllerList == c) {
    this.m_controllerList = c.m_next;
  }

  this.m_controllerCount--;
};

b2World.prototype.CreateController = function (controller) {
  if (controller.m_world != this) {
    throw new Error("Controller can only be a member of one world");
  }

  controller.m_next = this.m_controllerList;
  controller.m_prev = null;

  if (this.m_controllerList) {
    this.m_controllerList.m_prev = controller;
  }

  this.m_controllerList = controller;
  ++this.m_controllerCount;
  controller.m_world = this;
  return controller;
};

b2World.prototype.DestroyController = function (controller) {
  controller.Clear();

  if (controller.m_next) {
    controller.m_next.m_prev = controller.m_prev;
  }

  if (controller.m_prev) {
    controller.m_prev.m_next = controller.m_next;
  }

  if (controller == this.m_controllerList) {
    this.m_controllerList = controller.m_next;
  }

  --this.m_controllerCount;
};

b2World.prototype.SetWarmStarting = function (flag) {
  b2World.m_warmStarting = flag;
};

b2World.prototype.SetContinuousPhysics = function (flag) {
  b2World.m_continuousPhysics = flag;
};

b2World.prototype.GetBodyCount = function () {
  return this.m_bodyCount;
};

b2World.prototype.GetJointCount = function () {
  return this.m_jointCount;
};

b2World.prototype.GetContactCount = function () {
  return this.m_contactCount;
};

b2World.prototype.SetGravity = function (gravity) {
  this.m_gravity = gravity;
};

b2World.prototype.GetGravity = function () {
  return this.m_gravity;
};

b2World.prototype.GetGroundBody = function () {
  return this.m_groundBody;
};

b2World.prototype.Step = function (dt, velocityIterations, positionIterations) {
  if (this.m_flags & b2World.e_newFixture) {
    this.m_contactManager.FindNewContacts();
    this.m_flags &= ~b2World.e_newFixture;
  }

  this.m_flags |= b2World.e_locked;
  var step = b2World.s_timestep2;
  step.dt = dt;
  step.velocityIterations = velocityIterations;
  step.positionIterations = positionIterations;

  if (dt > 0) {
    step.inv_dt = 1 / dt;
  } else {
    step.inv_dt = 0;
  }

  step.dtRatio = this.m_inv_dt0 * dt;
  step.warmStarting = b2World.m_warmStarting;
  this.m_contactManager.Collide();

  if (step.dt > 0) {
    this.Solve(step);
  }

  if (b2World.m_continuousPhysics && step.dt > 0) {
    this.SolveTOI(step);
  }

  if (step.dt > 0) {
    this.m_inv_dt0 = step.inv_dt;
  }

  this.m_flags &= ~b2World.e_locked;
};

b2World.prototype.ClearForces = function () {
  for (var body = this.m_bodyList; body; body = body.m_next) {
    body.m_force.SetZero();
    body.m_torque = 0;
  }
};

b2World.prototype.DrawDebugData = function () {
  if (this.m_debugDraw == null) {
    return;
  }

  this.m_debugDraw.Clear();
  var flags = this.m_debugDraw.GetFlags();
  var i = 0;
  var b;
  var f;
  var s;
  var j;
  var bp;
  var invQ = new b2Vec2();
  var x1 = new b2Vec2();
  var x2 = new b2Vec2();
  var xf;
  var b1 = new b2AABB();
  var b2 = new b2AABB();
  var vs = [new b2Vec2(), new b2Vec2(), new b2Vec2(), new b2Vec2()];
  var color = new b2Color(0, 0, 0);

  if (flags & b2DebugDraw.e_shapeBit) {
    for (b = this.m_bodyList; b; b = b.m_next) {
      xf = b.m_xf;

      for (f = b.GetFixtureList(); f; f = f.m_next) {
        s = f.GetShape();

        if (b.IsActive() == false) {
          color.Set(0.5, 0.5, 0.3);
          this.DrawShape(s, xf, color);
        } else {
          if (b.GetType() == b2Body.b2_staticBody) {
            color.Set(0.5, 0.9, 0.5);
            this.DrawShape(s, xf, color);
          } else {
            if (b.GetType() == b2Body.b2_kinematicBody) {
              color.Set(0.5, 0.5, 0.9);
              this.DrawShape(s, xf, color);
            } else {
              if (b.IsAwake() == false) {
                color.Set(0.6, 0.6, 0.6);
                this.DrawShape(s, xf, color);
              } else {
                color.Set(0.9, 0.7, 0.7);
                this.DrawShape(s, xf, color);
              }
            }
          }
        }
      }
    }
  }

  if (flags & b2DebugDraw.e_jointBit) {
    for (j = this.m_jointList; j; j = j.m_next) {
      this.DrawJoint(j);
    }
  }

  if (flags & b2DebugDraw.e_controllerBit) {
    for (var c = this.m_controllerList; c; c = c.m_next) {
      c.Draw(this.m_debugDraw);
    }
  }

  if (flags & b2DebugDraw.e_pairBit) {
    color.Set(0.3, 0.9, 0.9);

    for (var contact = this.m_contactManager.m_contactList; contact; contact = contact.GetNext()) {
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();
      var cA = fixtureA.GetAABB().GetCenter();
      var cB = fixtureB.GetAABB().GetCenter();
      this.m_debugDraw.DrawSegment(cA, cB, color);
    }
  }

  if (flags & b2DebugDraw.e_aabbBit) {
    bp = this.m_contactManager.m_broadPhase;
    vs = [new b2Vec2(), new b2Vec2(), new b2Vec2(), new b2Vec2()];

    for (b = this.m_bodyList; b; b = b.GetNext()) {
      if (b.IsActive() == false) {
        continue;
      }

      for (f = b.GetFixtureList(); f; f = f.GetNext()) {
        var aabb = bp.GetFatAABB(f.m_proxy);
        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
        this.m_debugDraw.DrawPolygon(vs, 4, color);
      }
    }
  }

  if (flags & b2DebugDraw.e_centerOfMassBit) {
    for (b = this.m_bodyList; b; b = b.m_next) {
      xf = b2World.s_xf;
      xf.R = b.m_xf.R;
      xf.position = b.GetWorldCenter();
      this.m_debugDraw.DrawTransform(xf);
    }
  }
};

b2World.prototype.QueryAABB = function (callback, aabb) {
  var broadPhase = this.m_contactManager.m_broadPhase;

  function WorldQueryWrapper(proxy) {
    return callback(broadPhase.GetUserData(proxy));
  }

  broadPhase.Query(WorldQueryWrapper, aabb);
};

b2World.prototype.QueryShape = function (callback, shape, transform) {
  if (transform == null) {
    transform = new b2Transform();
    transform.SetIdentity();
  }

  var broadPhase = this.m_contactManager.m_broadPhase;

  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);

    if (b2Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())) {
      return callback(fixture);
    }

    return true;
  }

  var aabb = new b2AABB();
  shape.ComputeAABB(aabb, transform);
  broadPhase.Query(WorldQueryWrapper, aabb);
};

b2World.prototype.QueryPoint = function (callback, p) {
  var broadPhase = this.m_contactManager.m_broadPhase;

  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);

    if (fixture.TestPoint(p)) {
      return callback(fixture);
    }

    return true;
  }

  var aabb = new b2AABB();
  aabb.lowerBound.Set(p.x - b2Settings.b2_linearSlop, p.y - b2Settings.b2_linearSlop);
  aabb.upperBound.Set(p.x + b2Settings.b2_linearSlop, p.y + b2Settings.b2_linearSlop);
  broadPhase.Query(WorldQueryWrapper, aabb);
};

b2World.prototype.RayCast = function (callback, point1, point2) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  var output = new b2RayCastOutput();

  function RayCastWrapper(input, proxy) {
    var userData = broadPhase.GetUserData(proxy);
    var fixture = userData;
    var hit = fixture.RayCast(output, input);

    if (hit) {
      var fraction = output.fraction;
      var point = new b2Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
      return callback(fixture, point, output.normal, fraction);
    }

    return input.maxFraction;
  }

  var input = new b2RayCastInput(point1, point2);
  broadPhase.RayCast(RayCastWrapper, input);
};

b2World.prototype.RayCastOne = function (point1, point2) {
  var result;

  function RayCastOneWrapper(fixture, point, normal, fraction) {
    result = fixture;
    return fraction;
  }

  this.RayCast(RayCastOneWrapper, point1, point2);
  return result;
};

b2World.prototype.RayCastAll = function (point1, point2) {
  var result = new Array();

  function RayCastAllWrapper(fixture, point, normal, fraction) {
    result[result.length] = fixture;
    return 1;
  }

  this.RayCast(RayCastAllWrapper, point1, point2);
  return result;
};

b2World.prototype.GetBodyList = function () {
  return this.m_bodyList;
};

b2World.prototype.GetJointList = function () {
  return this.m_jointList;
};

b2World.prototype.GetContactList = function () {
  return this.m_contactList;
};

b2World.prototype.IsLocked = function () {
  return (this.m_flags & b2World.e_locked) > 0;
};

b2World.prototype.s_stack = new Array();
b2World.prototype.m_flags = 0;
b2World.prototype.m_contactManager = new b2ContactManager();
b2World.prototype.m_contactSolver = new b2ContactSolver();
b2World.prototype.m_island = new b2Island();
b2World.prototype.m_bodyList = null;
b2World.prototype.m_jointList = null;
b2World.prototype.m_contactList = null;
b2World.prototype.m_bodyCount = 0;
b2World.prototype.m_contactCount = 0;
b2World.prototype.m_jointCount = 0;
b2World.prototype.m_controllerList = null;
b2World.prototype.m_controllerCount = 0;
b2World.prototype.m_gravity = null;
b2World.prototype.m_allowSleep = null;
b2World.prototype.m_groundBody = null;
b2World.prototype.m_destructionListener = null;
b2World.prototype.m_debugDraw = null;
b2World.prototype.m_inv_dt0 = null;

if (typeof exports !== "undefined") {
  exports.b2BoundValues = b2BoundValues;
  exports.b2Math = b2Math;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2Mat33 = b2Mat33;
  exports.b2ContactPoint = b2ContactPoint;
  exports.b2PairManager = b2PairManager;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2OBB = b2OBB;
  exports.b2CircleContact = b2CircleContact;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2Pair = b2Pair;
  exports.b2TimeStep = b2TimeStep;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2World = b2World;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2Controller = b2Controller;
  exports.b2ContactID = b2ContactID;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2JointDef = b2JointDef;
  exports.b2Transform = b2Transform;
  exports.b2GravityController = b2GravityController;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2BuoyancyController = b2BuoyancyController;
  exports.b2LineJointDef = b2LineJointDef;
  exports.b2Contact = b2Contact;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2Body = b2Body;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactConstraint = b2ContactConstraint;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2ContactResult = b2ContactResult;
  exports.b2EdgeChainDef = b2EdgeChainDef;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec3 = b2Vec3;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2TensorDampingController = b2TensorDampingController;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2ConstantAccelController = b2ConstantAccelController;
  exports.b2GearJointDef = b2GearJointDef;
  exports.ClipVertex = ClipVertex;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2Color = b2Color;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2DynamicTreePair = b2DynamicTreePair;
  exports.b2ContactConstraintPoint = b2ContactConstraintPoint;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ControllerEdge = b2ControllerEdge;
  exports.b2Distance = b2Distance;
  exports.b2Fixture = b2Fixture;
  exports.b2DynamicTreeNode = b2DynamicTreeNode;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2BodyDef = b2BodyDef;
  exports.b2DynamicTreeBroadPhase = b2DynamicTreeBroadPhase;
  exports.b2Settings = b2Settings;
  exports.b2Proxy = b2Proxy;
  exports.b2Point = b2Point;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2Manifold = b2Manifold;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2ConstantForceController = b2ConstantForceController;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2MassData = b2MassData;
  exports.b2Joint = b2Joint;
  exports.b2GearJoint = b2GearJoint;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LineJoint = b2LineJoint;
  exports.b2NullContact = b2NullContact;
  exports.b2ContactListener = b2ContactListener;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2TOIInput = b2TOIInput;
  exports.Features = Features;
  exports.b2FilterData = b2FilterData;
  exports.b2Island = b2Island;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2Simplex = b2Simplex;
  exports.b2AABB = b2AABB;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Bound = b2Bound;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2PolyAndEdgeContact = b2PolyAndEdgeContact;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2Collision = b2Collision;
  exports.b2Mat22 = b2Mat22;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2PolyAndCircleContact = b2PolyAndCircleContact;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2Shape = b2Shape;
  exports.b2Segment = b2Segment;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2DebugDraw = b2DebugDraw;
  exports.b2Sweep = b2Sweep;
}

;
},{}],100:[function(require,module,exports){
const BinarySerializable = require(124);

const BinaryEncoder = require(121);

const BinaryDecoder = require(120);
/**
 * @abstract
 * This class is a binary data packet that can be transmitted over a
 * network with low redundancy. There is two packet types: standalone
 * and contextual. Standalone packets do not require any other data in
 * order to record and read information. Contextual packets only read
 * information when used by handlers.
 *
 * To create a standalone packet, inherit this class in the same way
 * as {@link BinarySerializable}. Then, in the
 * {@link BinaryPacket#fromBinary fromBinary} static function, you can
 * read data from the decoder and return an instance of your package.
 *
 * To create a context packet, you only need to overwrite the
 * {@link BinaryPacket#typeName typeName} static function.
 * {@link BinaryPacket} itself will take care of instantiating your package
 * and writing the decoder to the {@link BinaryPacket.decoder decoder}
 * field. Then you will be able to use the obtained data in any method
 * you create. In this way, you will only be able to read the data
 * when the handler accesses the package, with the possible
 * transmission of any contextual information. Please note that your
 * data will not be available after the packet is processed as the
 * decoder buffer is released for reuse.
 */


class BinaryPacket extends BinarySerializable {
  constructor() {
    super();
    /**
     * @type {ArrayBuffer} Compiled binary data of the packet.
     */

    this.data = null;
    /**
     * @type {BinaryDecoder} A decoder saved for the handlers.
     * Valid until it is reused.
     */

    this.decoder = null;
    /*
     Considering that the buffer will only be reused after the
     data packet is processed, we can store it for handlers to
     use. (Although it's always going to be
     BinaryDecoder.shared... Uhh... Nevermind...)
     */
  }

  encode() {
    let encoder = BinaryPacket.binaryEncoder;
    encoder.largeIndices = this.constructor.requireLargeIndices;
    encoder.reset();
    BinaryPacket.serialize(this, encoder);
    return encoder.compile();
  }
  /**
   * When called once, packet get compiled and can no longer change
   * its data
   * @returns {ArrayBuffer} Packet data
   */


  getData() {
    if (this.data == null) {
      this.data = this.encode();
    }

    return this.data;
  }
  /**
   * Sends the packet to WebSocket client. When called once, packet
   * get compiled and can no longer change its data
   * @param client The packet receiver.
   */


  sendTo(client) {
    if (!this.shouldSend()) {
      return;
    }

    if (client.connection.readyState !== 1) {
      return;
    }

    client.connection.send(this.getData());
  }

  shouldSend() {
    return true;
  }

  static fromBinary(decoder) {
    let packet = new this();
    packet.decoder = decoder;
    return packet;
  }

}

BinaryPacket.SERIALIZATION_GROUP_NAME = 3;
BinaryPacket.requireLargeIndices = false;
BinaryPacket.binaryEncoder = new BinaryEncoder({
  writeIndexMode: true
});
BinaryPacket.binaryDecoder = new BinaryDecoder({
  readIndexMode: true
});

BinaryPacket.groupName = () => BinaryPacket.SERIALIZATION_GROUP_NAME;

module.exports = BinaryPacket;
},{}],101:[function(require,module,exports){
const BinaryPacket = require(100);

const BlockState = require(150);

class BlockUpdatePacket extends BinaryPacket {
  static typeName() {
    return 13;
  }

  constructor(x, y, block) {
    super();
    this.x = x;
    this.y = y;
    this.block = block;
  }

  toBinary(encoder) {
    encoder.writeUint16(this.x);
    encoder.writeUint16(this.y);
    encoder.writeUint8(this.block.constructor.typeId);
    this.block.constructor.BinaryOptions.convertOptions(encoder, this.block);
  }

  static fromBinary(decoder) {
    let x = decoder.readUint16();
    let y = decoder.readUint16();
    let id = decoder.readUint8();
    let Block = BlockState.getBlockStateClass(id);
    let block = new Block(Block.BinaryOptions.convertBinary(decoder));
    return new BlockUpdatePacket(x, y, block);
  }

}

BinaryPacket.register(BlockUpdatePacket);
module.exports = BlockUpdatePacket;
},{}],102:[function(require,module,exports){
const BinaryPacket = require(100);

const EffectModel = require(85);

class EffectCreatePacket extends BinaryPacket {
  static typeName() {
    return 14;
  }
  /**
   * @param {EffectModel} effect
   */


  constructor(effect) {
    super();
    this.effect = effect;
  }

  toBinary(encoder) {
    EffectModel.serialize(this.effect, encoder);
  }

  static fromBinary(decoder) {
    const effect = EffectModel.deserialize(decoder, EffectModel);
    return new this(effect);
  }

}

BinaryPacket.register(EffectCreatePacket);
module.exports = EffectCreatePacket;
},{}],103:[function(require,module,exports){
const BinaryPacket = require(100);

class EffectRemovePacket extends BinaryPacket {
  static typeName() {
    return 19;
  }

  constructor(id) {
    super();
    this.id = id;
  }

  toBinary(encoder) {
    encoder.writeFloat64(this.id);
  }

  static fromBinary(decoder) {
    return new this(decoder.readFloat64());
  }

}

BinaryPacket.register(EffectRemovePacket);
module.exports = EffectRemovePacket;
},{}],104:[function(require,module,exports){
const BinaryPacket = require(100);

const EntityModel = require(97);

const BinarySerializable = require(124);

class EntityCreatePacket extends BinaryPacket {
  static typeName() {
    return 11;
  }

  constructor(entities) {
    super();

    if (entities === undefined) {
      this.entities = [];
    } else if (!Array.isArray(entities)) {
      this.entities = [entities];
    } else this.entities = entities;
  }

  toBinary(encoder) {
    encoder.writeUint16(this.entities.length);

    for (let entity of this.entities) {
      BinarySerializable.serialize(entity.model, encoder);
    }
  }

  createEntities(callback) {
    let decoder = this.decoder;
    let count = decoder.readUint16();

    for (let i = 0; i < count; i++) {
      let model = BinarySerializable.deserialize(decoder, EntityModel);
      if (model) callback(model);
    }
  }

}

BinaryPacket.register(EntityCreatePacket);
module.exports = EntityCreatePacket;
},{}],105:[function(require,module,exports){
const BinaryPacket = require(100);

class EntityListPacket extends BinaryPacket {
  static typeName() {
    return 10;
  }
  /**
   * @param entities {Map<Number, AbstractEntity>}
   */


  constructor(entities) {
    super();
    this.entities = entities;
    this.entitySize = 0;
    if (this.entities) for (let entity of this.entities) {
      this.entitySize++;
    }
  }

  shouldSend() {
    return this.entitySize > 0;
  }

  toBinary(encoder) {
    encoder.writeUint16(this.entitySize);

    for (let entity of this.entities.values()) {
      encoder.writeUint32(entity.model.id);
      entity.model.encodeDynamicData(encoder);
    }
  }
  /**
   * @param map {Map<Number, AbstractEntity>}
   */


  updateEntities(map) {
    let i = this.decoder.readUint16();

    while (i--) {
      let key = this.decoder.readUint32();

      if (map.has(key)) {
        map.get(key).model.decodeDynamicData(this.decoder);
      }
    }
  }

}

BinaryPacket.register(EntityListPacket);
module.exports = EntityListPacket;
},{}],106:[function(require,module,exports){
const BinaryPacket = require(100);

class EntityRemovePacket extends BinaryPacket {
  static typeName() {
    return 12;
  }

  constructor(entity) {
    super();
    this.entityId = entity ? entity.model.id : 0;
  }

  toBinary(encoder) {
    encoder.writeUint32(this.entityId);
  }

  updateEntities(map) {
    this.entityId = this.decoder.readUint32();
    map.delete(this.entityId);
  }

}

BinaryPacket.register(EntityRemovePacket);
module.exports = EntityRemovePacket;
},{}],107:[function(require,module,exports){
const BinaryPacket = require(100);

class TankLocationsPacket extends BinaryPacket {
  static typeName() {
    return 4;
  }
  /**
   * Creates a packet that contains information about
   * location and speed of each player in your map.
   * @param players {Map<Number, Player>} Tank map to be encoded
   */


  constructor(players) {
    super();
    this.players = players;
  }

  toBinary(encoder) {
    encoder.writeUint16(this.players.size);

    for (let [key, player] of this.players) {
      encoder.writeUint32(key);
      player.tank.encodeDynamicData(encoder);
    }
  }
  /**
   * Updates tank positions based on packet data.
   * @param players {Map<Number, Player>} Map containing each player
   */


  updateTankLocations(players) {
    if (!this.decoder) {
      throw new Error("This packet is not valid anymore: The decoder buffer has been reused.");
    }

    this.decoder.save();
    let count = this.decoder.readUint16();

    while (count--) {
      let key = this.decoder.readUint32();
      let player = players.get(key);
      player.tank.decodeDynamicData(this.decoder, true);
    }

    this.decoder.restore();
  }

}

BinaryPacket.register(TankLocationsPacket);
module.exports = TankLocationsPacket;
},{}],108:[function(require,module,exports){
const BinaryPacket = require(100);

const GameMap = require(159);

class MapPacket extends BinaryPacket {
  static typeName() {
    return 1;
  }

  constructor(map) {
    super();
    this.map = map;
  }

  static fromBinary(decoder) {
    let map = GameMap.fromBinary(decoder);
    map.update();
    return new MapPacket(map);
  }

  toBinary(encoder) {
    this.map.toBinary(encoder, [GameMap.BinaryOptions.SIZE_FLAG, GameMap.BinaryOptions.DATA_FLAG]);
  }

}

MapPacket.requireLargeIndices = true;
BinaryPacket.register(MapPacket);
module.exports = MapPacket;
},{}],109:[function(require,module,exports){
const BinaryPacket = require(100);

class PlayerChatPacket extends BinaryPacket {
  static typeName() {
    return 8;
  }

  constructor(text) {
    super();
    this.text = text;
  }

  toBinary(encoder) {
    encoder.writeString(this.text);
  }

  static fromBinary(decoder) {
    return new PlayerChatPacket(decoder.readString());
  }

}

BinaryPacket.register(PlayerChatPacket);
module.exports = PlayerChatPacket;
},{}],110:[function(require,module,exports){
const BinaryPacket = require(100);

const TankModel = require(142);

class PlayerConfigPacket extends BinaryPacket {
  static typeName() {
    return 7;
  }

  constructor(nick, tank) {
    super();
    this.nick = nick;
    this.tank = tank;
  }

  toBinary(encoder) {
    encoder.writeUint8(this.tank.getId());
    encoder.writeString(this.nick);
  }

  static fromBinary(decoder) {
    let tank = TankModel.Types.get(decoder.readUint8());
    return new PlayerConfigPacket(decoder.readString(), tank);
  }

}

BinaryPacket.register(PlayerConfigPacket);
module.exports = PlayerConfigPacket;
},{}],111:[function(require,module,exports){
const TankControls = require(133);

const BinaryPacket = require(100);

class PlayerControlsPacket extends BinaryPacket {
  static typeName() {
    return 6;
  }
  /**
   * @param { TankControls } controls
   */


  constructor(controls) {
    super();
    this.controls = controls;
  }

  toBinary(encoder) {
    this.controls.toBinary(encoder);
  }
  /**
   * Update specified tank controls
   * @param { TankControls } controls
   */


  updateControls(controls) {
    controls.updateState(this.decoder);
  }

}

BinaryPacket.register(PlayerControlsPacket);
module.exports = PlayerControlsPacket;
},{}],112:[function(require,module,exports){
const TankModel = require(142);

const BinaryPacket = require(100);

const Player = require(163);
/**
 * This packet is representing a player join interact.
 */


class PlayerJoinPacket extends BinaryPacket {
  static typeName() {
    return 2;
  }

  constructor(player, tank) {
    super();
    this.player = player;
    this.tank = tank;
    this.decoder = null;
  }

  toBinary(encoder) {
    encoder.writeUint16(this.player.id);
    encoder.writeString(this.player.nick);
    TankModel.serialize(this.tank, encoder);
  }

  static fromBinary(decoder) {
    let player = new Player();
    player.id = decoder.readUint16();
    player.nick = decoder.readString();
    let tank = TankModel.deserialize(decoder, TankModel);
    return new this(player, tank);
  }

}

BinaryPacket.register(PlayerJoinPacket);
module.exports = PlayerJoinPacket;
},{}],113:[function(require,module,exports){
const BinaryPacket = require(100);

class PlayerLeavePacket extends BinaryPacket {
  static typeName() {
    return 15;
  }

  constructor(player) {
    super();
    this.playerId = player ? player.id : 0;
  }

  toBinary(encoder) {
    encoder.writeUint32(this.playerId);
  }

  static fromBinary(decoder) {
    let packet = new PlayerLeavePacket();
    packet.playerId = decoder.readUint32();
    return packet;
  }

}

BinaryPacket.register(PlayerLeavePacket);
module.exports = PlayerLeavePacket;
},{}],114:[function(require,module,exports){
const BinaryPacket = require(100);

class PlayerRespawnPacket extends BinaryPacket {
  static typeName() {
    return 9;
  }

  toBinary(encoder) {}

}

BinaryPacket.register(PlayerRespawnPacket);
module.exports = PlayerRespawnPacket;
},{}],115:[function(require,module,exports){
const BinaryPacket = require(100);

class PlayerRoomChangePacket extends BinaryPacket {
  static typeName() {
    return 18;
  }

  constructor(room, error) {
    super();
    this.room = room;
    this.error = error;
  }

  toBinary(encoder) {
    encoder.writeUint8(this.error ? 0 : 1);
    encoder.writeString(this.room);

    if (this.error) {
      encoder.writeString(this.error);
    }
  }

  static fromBinary(decoder) {
    let isSuccess = decoder.readUint8();
    let room = decoder.readString();
    let error = isSuccess ? null : decoder.readString();
    return new this(room, error);
  }

  static allow(room) {
    return new this(room);
  }

  static deny(room, error) {
    return new this(room, error);
  }

}

BinaryPacket.register(PlayerRoomChangePacket);
module.exports = PlayerRoomChangePacket;
},{}],116:[function(require,module,exports){
const BinaryPacket = require(100);
/**
 * This packet is sent when player wants to join the room
 */


class PlayerRoomRequestPacket extends BinaryPacket {
  static typeName() {
    return 17;
  }

  constructor(room) {
    super();
    this.room = room;
  }

  toBinary(encoder) {
    encoder.writeString(this.room);
  }

  static fromBinary(decoder) {
    return new PlayerRoomRequestPacket(decoder.readString());
  }

}

BinaryPacket.register(PlayerRoomRequestPacket);
module.exports = PlayerRoomRequestPacket;
},{}],117:[function(require,module,exports){
const PlayerJoinPacket = require(112);

const BinaryPacket = require(100);
/**
 * This packet represents player spawn interact.
 * The difference to the `PlayerSpawnPacket`
 * package is that this package is only sent
 * to the player who entered the screen.
 */


class PlayerSpawnPacket extends PlayerJoinPacket {
  static typeName() {
    return 3;
  }

}

BinaryPacket.register(PlayerSpawnPacket);
module.exports = PlayerSpawnPacket;
},{}],118:[function(require,module,exports){
const BinaryPacket = require(100);

class RoomListPacket extends BinaryPacket {
  static typeName() {
    return 16;
  }

  constructor(rooms) {
    super();
    this.rooms = rooms;
  }

  toBinary(encoder) {
    encoder.writeUint8(this.rooms.length);

    for (let room of this.rooms) {
      encoder.writeString(room.name);
      encoder.writeUint16(room.online);
      encoder.writeUint16(room.maxOnline);
    }
  }

  static fromBinary(decoder) {
    let rooms = [];
    let count = decoder.readUint8();

    for (let i = 0; i < count; i++) {
      let name = decoder.readString();
      let online = decoder.readUint16();
      let maxOnline = decoder.readUint16();
      rooms.push({
        name: name,
        online: online,
        maxOnline: maxOnline
      });
    }

    return new RoomListPacket(rooms);
  }

}

BinaryPacket.register(RoomListPacket);
module.exports = RoomListPacket;
},{}],119:[function(require,module,exports){
const BinaryPacket = require(100);

class RoomListRequestPacket extends BinaryPacket {
  static typeName() {
    return 5;
  }
  /**
   * @param {boolean} request Indicates if room list update should be enabled.
   */


  constructor(request) {
    super();
    this.request = request;
  }

  toBinary(encoder) {
    /** @type {number} */
    const byte = this.request ? 1 : 0;
    encoder.writeUint8(byte);
  }

  static fromBinary(decoder) {
    return new RoomListRequestPacket(decoder.readUint8());
  }

}

BinaryPacket.register(RoomListRequestPacket);
module.exports = RoomListRequestPacket;
},{}],120:[function(require,module,exports){
const BinaryPool = require(122);

const BinaryBuffer = require(123);

class BinaryDecoder extends BinaryPool {
  /**
   * Shared instance of `BinaryDecoder`
   * @type {BinaryDecoder}
   */
  constructor(options) {
    options = options || {};
    super();

    this.readInt8 = n => this.buffers.get(BinaryPool.INT8).next(n);

    this.readUint8 = n => this.buffers.get(BinaryPool.UINT8).next(n);

    this.readInt16 = n => this.buffers.get(BinaryPool.INT16).next(n);

    this.readUint16 = n => this.buffers.get(BinaryPool.UINT16).next(n);

    this.readInt32 = n => this.buffers.get(BinaryPool.INT32).next(n);

    this.readUint32 = n => this.buffers.get(BinaryPool.UINT32).next(n);

    this.readFloat32 = n => this.buffers.get(BinaryPool.FLOAT32).next(n);

    this.readFloat64 = n => this.buffers.get(BinaryPool.FLOAT64).next(n);

    this.readString = () => {
      let buffer = this.buffers.get(BinaryPool.UINT16);
      let codes = [];
      let code;

      while ((code = buffer.next()) !== 0) {
        codes.push(code);
      }

      return String.fromCharCode.apply(null, codes);
    };

    this.largeIndices = options.largeIndices;
    this.readIndexMode = options.readIndexMode;
    /** @type {Map<Number, BinaryBuffer>} */

    this.buffers = new Map();
    this.setupBuffers();
  }
  /**
   * Reads binary data to buffers. Then
   * it's possible to use read functions
   * as `readString` or `readUint32`
   * @param array {ArrayBuffer} Data buffer to read.
   */


  readData(array) {
    let compilerBytes = Uint16Array.BYTES_PER_ELEMENT;
    let bufferIndex = 0;
    let arrayPointer = 0;
    let offset = compilerBytes * BinaryPool.bufferTypes.size;

    if (this.readIndexMode) {
      this.largeIndices = !!new Uint8Array(array, 0, 1)[0];
      array = array.slice(1);
    }

    if (this.largeIndices) {
      offset *= 2;
    }

    for (let buffer of this.buffers.values()) {
      let size;

      if (this.largeIndices) {
        let words = new Uint16Array(array, compilerBytes * bufferIndex * 2, 2);
        size = words[0] + (words[1] << 16);
      } else {
        size = new Uint16Array(array, compilerBytes * bufferIndex, 1)[0];
      }

      if (size === 0) {
        bufferIndex++;
        continue;
      }

      let bytes = buffer.clazz.BYTES_PER_ELEMENT;
      let alignment = Math.max(bytes, compilerBytes);
      arrayPointer = Math.ceil(arrayPointer / alignment) * alignment;
      buffer.read(array, offset + arrayPointer, size);
      arrayPointer += size * bytes;
      bufferIndex++;
    }
  }
  /**
   * Private function. Should never be used outside.
   */


  setupBuffers() {
    for (let [type, buffer] of BinaryPool.bufferTypes.entries()) {
      let newBuffer = buffer.clone();
      newBuffer.createBuffer();
      this.buffers.set(type, newBuffer);
    }
  } // Reading functions

  /**
   * Reads and returns an signed 8-bit integer or `Int8Array` when `n > 1`.
   * @param n{Number?} Number of entries to read.
   */


  // Operating buffer pointers

  /**
   * Resets pointer of each buffer
   */
  reset() {
    for (let buffer of this.buffers.values()) {
      buffer.reset();
    }
  }
  /**
   * Saves pointer state of each buffer.
   * Return to the last saved state
   * by calling `restore` method
   */


  save() {
    for (let buffer of this.buffers.values()) {
      buffer.save();
    }
  }
  /**
   * Restores last saved pointer state
   * of each buffer. See also `save`
   */


  restore() {
    for (let buffer of this.buffers.values()) {
      buffer.save();
    }
  }

}

BinaryDecoder.shared = new BinaryDecoder();
module.exports = BinaryDecoder;
},{}],121:[function(require,module,exports){
const Buffer = require(123);

const BinaryPool = require(122);

class BinaryEncoder extends BinaryPool {
  constructor(options) {
    options = options || {};
    super();
    this.compileBuffer = new Buffer({
      clazz: Uint16Array,
      capacity: 512
    });

    this.writeInt8 = int8 => {
      this.buffers.get(BinaryEncoder.INT8).push(int8);
    };

    this.writeUint8 = uint8 => {
      this.buffers.get(BinaryEncoder.UINT8).push(uint8);
    };

    this.writeInt16 = int16 => {
      this.buffers.get(BinaryEncoder.INT16).push(int16);
    };

    this.writeUint16 = uint16 => {
      this.buffers.get(BinaryEncoder.UINT16).push(uint16);
    };

    this.writeInt32 = int32 => {
      this.buffers.get(BinaryEncoder.INT32).push(int32);
    };

    this.writeUint32 = uint32 => {
      this.buffers.get(BinaryEncoder.UINT32).push(uint32);
    };

    this.writeFloat32 = float32 => {
      this.buffers.get(BinaryEncoder.FLOAT32).push(float32);
    };

    this.writeFloat64 = float64 => {
      this.buffers.get(BinaryEncoder.FLOAT64).push(float64);
    };

    this.writeString = string => {
      let buffer = this.buffers.get(BinaryEncoder.UINT16);

      for (let i = 0, l = string.length; i < l; i++) {
        let code = string.charCodeAt(i);
        buffer.push(code);
      }

      buffer.push(0); // Adding string end character '\0'
    };

    this.writeInt8Array = int8Array => this.buffers.get(BinaryEncoder.INT8).appendArray(int8Array);

    this.writeUint8Array = uint8Array => this.buffers.get(BinaryEncoder.UINT8).appendArray(uint8Array);

    this.writeInt16Array = int16Array => this.buffers.get(BinaryEncoder.INT16).appendArray(int16Array);

    this.writeUint16Array = uint16Array => this.buffers.get(BinaryEncoder.UINT16).appendArray(uint16Array);

    this.writeInt32Array = int32Array => this.buffers.get(BinaryEncoder.INT32).appendArray(int32Array);

    this.writeUint32Array = uint32Array => this.buffers.get(BinaryEncoder.UINT32).appendArray(uint32Array);

    this.writeFloat32Array = float32Array => this.buffers.get(BinaryEncoder.FLOAT32).appendArray(float32Array);

    this.writeFloat64Array = float64Array => this.buffers.get(BinaryEncoder.FLOAT64).appendArray(float64Array);

    this.buffers = new Map();
    this.largeIndices = !!options.largeIndices;
    this.writeIndexMode = !!options.writeIndexMode;
    this.setupBuffers();
  }

  setupBuffers() {
    for (let [type, buffer] of BinaryEncoder.bufferTypes.entries()) {
      let newBuffer = buffer.clone();
      newBuffer.createBuffer();
      this.buffers.set(type, newBuffer);
    }

    this.compileBuffer.createBuffer();
  }

  reset() {
    for (let buffer of this.buffers.values()) {
      buffer.reset();
    }
  }
  /**
   * Writes signed byte to buffer
   * @param int8 {number} value to write
   */


  compile() {
    this.compileBuffer.reset();

    if (this.largeIndices) {
      for (let buffer of this.buffers.values()) {
        this.compileBuffer.push(buffer.pointer & 0xFFFF);
        this.compileBuffer.push(buffer.pointer >> 16 & 0xFFFF);
      }
    } else {
      for (let buffer of this.buffers.values()) {
        this.compileBuffer.push(buffer.pointer);
      }
    }

    for (let buffer of this.buffers.values()) {
      this.compileBuffer.appendBuffer(buffer);
    }

    if (this.writeIndexMode) {
      let result = new Uint8Array(this.compileBuffer.pointer * 2 + 1);
      result[0] = Number(this.largeIndices);
      result.set(new Uint8Array(this.compileBuffer.toArrayBuffer()), 1);
      return result.buffer;
    } else {
      return this.compileBuffer.toArrayBuffer();
    }
  }

}

BinaryEncoder.shared = new BinaryEncoder();
module.exports = BinaryEncoder;
},{}],122:[function(require,module,exports){
const Buffer = require(123);

class BinaryPool {}

BinaryPool.INT8 = 0;
BinaryPool.UINT8 = 1;
BinaryPool.INT16 = 2;
BinaryPool.UINT16 = 3;
BinaryPool.INT32 = 4;
BinaryPool.UINT32 = 5;
BinaryPool.FLOAT32 = 6;
BinaryPool.FLOAT64 = 7;
BinaryPool.bufferTypes = new Map([[BinaryPool.INT8, new Buffer({
  clazz: Int8Array,
  capacity: 128
})], [BinaryPool.UINT8, new Buffer({
  clazz: Uint8Array,
  capacity: 128
})], [BinaryPool.INT16, new Buffer({
  clazz: Int16Array,
  capacity: 128
})], [BinaryPool.UINT16, new Buffer({
  clazz: Uint16Array,
  capacity: 128
})], [BinaryPool.INT32, new Buffer({
  clazz: Int32Array,
  capacity: 128
})], [BinaryPool.UINT32, new Buffer({
  clazz: Uint32Array,
  capacity: 128
})], [BinaryPool.FLOAT32, new Buffer({
  clazz: Float32Array,
  capacity: 128
})], [BinaryPool.FLOAT64, new Buffer({
  clazz: Float64Array,
  capacity: 128
})]]);
module.exports = BinaryPool;
},{}],123:[function(require,module,exports){
class Buffer {
  /**
   * Buffer base capacity.
   * If the `initialCapacity` equals to
   * 128, then buffer actual capacity
   * is multiply of 128.
   * @type {Number|Null}
   */

  /**
   * Buffer internal class type.
   * @type {Class<TypedArray>}
   */

  /**
   * Current entry pointer. Increased
   * when reading or writing data.
   * @type {number}
   */
  constructor(options) {
    this.capacity = null;
    this.clazz = null;
    this.pointer = 0;
    this.initialCapacity = options.capacity || 128;
    this.capacity = 0;
    this.clazz = options.clazz;
    this.pointer = 0;
    this.array = null;
    this.stack = [];
  }
  /**
   * Initializes the buffer. It's required to
   * call this method if you want to
   * use the dynamic buffer.
   */


  createBuffer() {
    this.capacity = this.initialCapacity;
    this.array = new this.clazz(this.capacity);
    return this;
  }
  /**
   * if `minimumCapacity` parameter is provided, extends the
   * buffer to nearest greater multiple of `capacity`
   * bytes. if not, extends the buffer by `capacity` bytes.
   * If the required number of bytes if less then actual
   * capacity, this method does nothing
   * @param minimumCapacity {Number?} Minimum buffer capacity.
   * @returns {boolean} `true`, if buffer has been reallocated, `false` otherwise
   */


  extend(minimumCapacity) {
    if (minimumCapacity === undefined) {
      this.capacity += this.initialCapacity;
    } else {
      if (minimumCapacity <= this.capacity) return false;
      this.capacity = Math.ceil(minimumCapacity / this.initialCapacity) * this.initialCapacity;
    }

    let oldBuffer = this.array;
    this.array = new this.clazz(this.capacity);
    this.array.set(oldBuffer);
    return true;
  }
  /**
   * Resets the pointer to zero, allowing
   * to read buffer from start or reuse
   * it by overwriting old content.
   */


  reset() {
    this.pointer = 0;
  }
  /**
   * Converts this dynamic buffer into static `ArrayBuffer`
   * @returns {ArrayBuffer}
   */


  toArrayBuffer() {
    return this.array.buffer.slice(0, this.pointer * this.clazz.BYTES_PER_ELEMENT);
  }
  /**
   * Appends single value to the end of this buffer.
   * The value should bound to the buffer type,
   * otherwise it will be clamped.
   * @param value {Number}
   */


  push(value) {
    if (this.pointer >= this.capacity) {
      this.extend();
    }

    this.array[this.pointer++] = value;
  }
  /**
   * Appends `Array` to the end of this buffer.
   * @param array {Array|TypedArray} Array to append.
   */


  appendArray(array) {
    let newSize = this.pointer + array.length;

    if (newSize >= this.capacity) {
      this.extend(newSize);
    }

    this.array.set(array, this.pointer);
    this.pointer += array.length;
  }
  /**
   * Appends another buffer to the end of this buffer.
   * Usable when compiling multiple buffers into one.
   * @param buffer {Buffer} Buffer to append.
   */


  appendBuffer(buffer) {
    if (buffer.pointer === 0) {
      return;
    }

    let bytes = buffer.array.BYTES_PER_ELEMENT;
    let selfBytes = this.array.BYTES_PER_ELEMENT;
    let size = Math.ceil(bytes / selfBytes * buffer.pointer);
    let alignment = Math.max(bytes, selfBytes); // Align pointer

    this.pointer = Math.ceil(this.pointer * selfBytes / alignment) * alignment / selfBytes;
    let temp = new this.clazz(buffer.array.buffer, 0, size);
    this.appendArray(temp);
  }
  /**
   * Reads `TypedArray` to internal buffer. Then it's
   * possible to use `next(n)` method.
   * @param array {TypedArray} An array to read data. Should be the same type as the buffer.
   * @param pointer {Number} How many bytes to skip before start reading.
   * @param size {Number} Number of overlay to read
   */


  read(array, pointer, size) {
    this.extend(size);
    let buffer = new this.clazz(array, pointer, size);
    this.array.set(buffer); // Allow to read buffer from begin with `next` method

    this.pointer = 0;
  }

  next(n) {
    if (n === undefined || n <= 1) {
      return this.array[this.pointer++];
    } else if (typeof n == "number") {
      let temp = this.array.slice(this.pointer, this.pointer + n);
      this.pointer += n;
      return temp;
    }
  }
  /**
   * Makes a new buffer with the same options.
   * Does not copy buffer content.
   * @returns {Buffer}
   */


  clone() {
    return new Buffer({
      capacity: this.initialCapacity,
      clazz: this.clazz
    });
  }
  /**
   * Saves current buffer pointer to stack.
   * Return to last saved pointer
   * by calling `restore` method.
   */


  save() {
    this.stack.push(this.pointer);
  }
  /**
   * Returns to last saved buffer pointer.
   * See also `save` method.
   */


  restore() {
    this.pointer = this.stack.pop();
  }

}

module.exports = Buffer;
},{}],124:[function(require,module,exports){
const Group = require(125);
/**
 * @abstract
 * This abstract class allows to serialize and deserialize any object
 * into binary data. Subclasses should implement {@link toBinary},
 * {@link fromBinary} methods and static {@link typeName} function.
 * Separation between serialization groups is done by overriding
 * static {@link groupName} method. This class should never
 * be constructed directly.
 * Refer to the documentation of the appropriate methods.
 */


class BinarySerializable {
  /**
   * Returns newly created or cached group object for the provided key.
   * @param key The key for group to be returned.
   * @returns {Group} Returns group for this key.
   */
  static getGroup(key) {
    let registry = BinarySerializable.groups[key];

    if (!registry) {
      registry = BinarySerializable.groups[key] = new Group();
    }

    return registry;
  }
  /**
   * @abstract
   * To serialize and deserialize subclass instances, use
   * {@link serialize} and {@link deserialize} static
   * functions. This function should never be called on {@link BinarySerializable} class.
   * * @param {BinaryEncoder} encoder The encoder which will store object data
   */


  toBinary(encoder) {
    throw new Error("Abstract class instancing is illegal");
  }
  /**
   * @abstract
   * To serialize and deserialize the base class instances, use
   * {@link serialize} and {@link deserialize} static functions.
   * @param {BinaryDecoder} decoder The {@link BinaryDecoder} which contains source object data.
   * @returns {BinarySerializable} The deserialized object
   */


  static fromBinary(decoder) {
    throw new Error("Abstract class instancing is illegal");
  }
  /**
   * Uses {@link toBinary} method to serialize subclass instances to
   * object. Suitable for network transporting. Call {@link deserialize} to get exact
   * same object copy.
   * @param {BinaryEncoder} encoder where object serialization will be stored.
   * @param {BinarySerializable} object to be serialized
   */


  static serialize(object, encoder) {
    if (object.constructor["name"] === BinarySerializable.constructor["name"]) {
      throw new Error(`Cannot serialize abstract class.`);
    }

    encoder.writeInt16(object.constructor.typeName());
    object.toBinary(encoder);
  }
  /**
   * Uses {@link fromBinary} method to deserialize instance from
   * binary data, returned by {@link serialize} function.
   * @param {BinaryDecoder} decoder The object to be deserialized
   * @param group {Number|Class} The serialization group name. Can be either undefined, number or {@link BinarySerializable} subclass.
   * @returns {BinarySerializable} The deserialized object or `null` if base class was not found.
   */


  static deserialize(decoder, group) {
    if (typeof group == "function") {
      if (group.prototype instanceof BinarySerializable) {
        group = group.groupName();
      } else {
        throw new Error("Illegal argument: second argument must be either undefined, number or 'BinarySerializable' subclass.");
      }
    } else if (group === undefined) {
      group = BinarySerializable.BASE_GROUP_NAME;
    } else if (typeof group != "number") {
      throw new Error("Illegal argument: second argument must be either undefined, number or 'BinarySerializable' subclass.");
    }

    const type = decoder.readInt16();
    const clazz = this.getGroup(group).get(type);

    if (!clazz) {
      return null;
    }

    return clazz.fromBinary(decoder);
  }
  /**
   * @abstract
   * Each registered subclass should have a type identifier to be
   * deserialized. Return value should fit Int16 (-32,768 to +32,767)
   * This function should never be called on {@link BinarySerializable} class instance
   * @returns {number} Type identifier for specific {@link BinarySerializable}
   * subclass.
   */


  static typeName() {
    throw new Error(`Abstract class does not have type name.`);
  }
  /**
   * Used to separate different serialization groups.
   * @example
   * // If you are about to serialize both `Entity`
   * // and `Particle` classes, you would separate them
   * // in different groups. With that being done, you will be
   * // able to use same hardcoded type names for your entities
   * // and particles.
   *
   * class Entity extends BinarySerializable {
   *     static groupName() { return 1 } // Using group named "1" for entities
   * }
   *
   * class Projectile extends Entity {
   *     static typeName() { return 1 }
   * }
   * BinarySerializable.register(Projectile) // Don't forget to register class
   *
   * class Animal extends Entity {
   *     static typeName() { return 2 }
   * }
   * BinarySerializable.register(Animal)
   *
   *
   * // Using separate group to serialize particles
   *
   * class Particle extends BinarySerializable {
   *     static groupName() { return 2 } // Using group named "2" for particles
   * }
   *
   * class FireParticle extends Particle {
   *     static typeName() { return 1 }
   * }
   * BinarySerializable.register(FireParticle)
   *
   * class ExplodeParticle extends Particle {
   *     static typeName() { return 2 }
   * }
   * BinarySerializable.register(ExplodeParticle)
   *
   * @returns {number} Group name as unique number.
   */


  static groupName() {
    return BinarySerializable.BASE_GROUP_NAME;
  }
  /**
   * Writes {@link BinarySerializable} subclass to internal registry. This
   * function should be used to deserialize your custom class with
   * {@link deserialize} static function.
   * @param {Class<BinarySerializable>} clazz The class to register.
   */


  static register(clazz) {
    let group = clazz.groupName();
    let registry = this.getGroup(group);
    return registry.register(clazz);
  }

}

BinarySerializable.BASE_GROUP_NAME = -1;
BinarySerializable.groups = [];
module.exports = BinarySerializable;
},{}],125:[function(require,module,exports){
class Group {
  constructor() {
    this.array = [];
  }

  register(clazz) {
    const clazzType = clazz.typeName();

    for (let eachClazz of this.array) {
      if (eachClazz.typeName() === clazzType) {
        throw new Error(`Type name '${clazzType}' is already registered in this group.`);
      }
    }

    this.array.push(clazz);
  }

  get(type) {
    for (let eachClazz of this.array) {
      if (eachClazz.typeName() === type) {
        return eachClazz;
      }
    }

    return null;
  }

}

module.exports = Group;
},{}],126:[function(require,module,exports){
const AbstractEffect = require(84);

class ServerEffect extends AbstractEffect {
  /**
   * Finds server-side implementation of the effect model
   * @param model {EffectModel}
   * @returns {ServerEffect}
   */
  static fromModel(model) {
    let clazz =
    /** @type Class<ServerEffect> */
    this.Types.get(model.constructor);
    if (clazz) return new clazz(model);
    return null;
  }

}

ServerEffect.shouldSynchroniseRemoval = true;
module.exports = ServerEffect;
},{}],127:[function(require,module,exports){
const ServerEffect = require(126);

const TankEffectModel = require(86);
/**
 * This class unites all the tank effect implementations on the server
 * side. If the effect is visual and should not have a separate logic
 * on the server side (does not scatter players, does not break
 * blocks, etc.), it is enough to set only its {@link EffectModel} and
 * not to use this class. You also should not initialize this class
 * directly, use {@link ServerTankEffect#fromModel fromModel} static method
 * instead
 */


class ServerTankEffect extends ServerEffect {
  /**
   * @type TankEffectModel
   */

  /**
   * @type ServerTank
   */

  /**
   * @private
   * Creates server-side tank effect class, linked to specific
   * {@link TankEffectModel} and {@link ServerTank}. This
   * constructor should not be called directly, use
   * {@link ServerTankEffect#fromModel fromModel} static method
   * instead
   * @param {TankEffectModel} model
   * @param {ServerTank} tank
   */
  constructor(model, tank) {
    super(model);
    this.model = void 0;
    this.tank = void 0;
    this.model = model;
    this.tank = tank;
  } // noinspection JSCheckFunctionSignatures

  /**
   * Wraps the {@link TankEffectModel} in corresponding
   * {@link ServerTankEffect} class. If this effect has any additional
   * server-side logic, the instance of appropriate subclass will be
   * returned. Otherwise, this method returns {@link ServerTankEffect}
   * instance
   * @param model {TankEffectModel} Effect model to wrap
   * @param tank {ServerTank} A tank this effect will appear on
   * @returns {ServerTankEffect}
   */


  static fromModel(model, tank) {
    let clazz =
    /** @type Class<ServerTankEffect> */
    super.fromModel(model);
    if (clazz) return new clazz(model, tank); // If this model has no server-side implementation, return
    // default class

    if (model instanceof TankEffectModel) {
      return new ServerTankEffect(model, tank);
    }

    throw new TypeError("The 'model' argument should inherit TankEffectModel");
  }

}

module.exports = ServerTankEffect;
},{}],128:[function(require,module,exports){
const ServerEffect = require(126);

const WorldEffectModel = require(90);
/**
 * This class unites all the world effect implementations on the server
 * side. If the effect is visual and should not have a separate logic
 * on the server side (does not scatter players, does not break
 * blocks, etc.), it is enough to set only its {@link WorldEffectModel} and
 * not to use this class. You also should not initialize this class
 * directly, use {@link ServerWorldEffect#fromModel fromModel} static method
 * instead
 */


class ServerWorldEffect extends ServerEffect {
  /**
   * @type WorldEffectModel
   */

  /**
   * @type ServerGameWorld
   */

  /**
   * @private
   * Creates server-side world effect class, linked to specific
   * {@link WorldEffectModel} and {@link ServerGameWorld}. This
   * constructor should not be called directly, use
   * {@link ServerWorldEffect#fromModel fromModel} static method
   * instead
   * @param {WorldEffectModel} model
   * @param {ServerGameWorld} world
   */
  constructor(model, world) {
    super(model);
    this.model = void 0;
    this.world = void 0;
    this.model = model;
    this.world = world;
  } // noinspection JSCheckFunctionSignatures

  /**
   * Wraps the {@link WorldEffectModel} in corresponding
   * {@link ServerWorldEffect} class. If this effect has any additional
   * server-side logic, the instance of appropriate subclass will be
   * returned. Otherwise, this method returns {@link ServerWorldEffect}
   * instance
   * @param model {WorldEffectModel} Effect model to wrap
   * @param world {ServerWorldEffect} A world which this effect will be created in
   * @returns {ServerWorldEffect}
   */


  static fromModel(model, world) {
    let clazz =
    /** @type Class<ServerWorldEffect> */
    this.Types.get(model.constructor);
    if (clazz) return new clazz(model, world); // If this model has no server-side implementation, return
    // default class

    if (model instanceof WorldEffectModel) {
      return new ServerWorldEffect(model, world);
    }

    throw new TypeError("The 'model' argument should inherit WorldEffectModel");
  }

}

module.exports = ServerWorldEffect;
},{}],129:[function(require,module,exports){
const WorldExplodeEffectModel = require(88);

const ServerWorldEffect = require(128);

const ServerEntity = require(130);

const GameMap = require(159);

class ServerBullet extends ServerEntity {
  /** @type Player */
  constructor(model) {
    super(model);
    this.shooter = null;
    this.wallDamage = 0;
    this.playerDamage = 0;
    this.explodePower = 0;
    this.mass = 3;
    this.startVelocity = 20;
  }

  tick(dt) {
    let dx = this.model.dx * dt;
    let dy = this.model.dy * dt;

    if (dx !== 0 || dy !== 0) {
      let collision = this.checkWallHit(this.model.x, this.model.y, dx, dy);
      let world = this.shooter.world;

      if (collision) {
        this.model.x = collision.point.x;
        this.model.y = collision.point.y;

        if (this.wallDamage) {
          if (world.map.getBlock(collision.block.x, collision.block.y)) {
            world.map.damageBlock(collision.block.x, collision.block.y, this.wallDamage);
          }
        }

        this.die();
        return;
      }

      let playerCollision = this.checkPlayerHit(this.model.x, this.model.y, dx, dy);

      if (playerCollision) {
        this.model.x += dx * playerCollision.distance;
        this.model.y += dy * playerCollision.distance;
        this.die();
        return;
      }
    }

    super.tick(dt);
  }

  die() {
    if (this.model.dead) return;
    this.model.dead = true;

    if (this.explodePower) {
      let effect = new WorldExplodeEffectModel({
        x: this.model.x,
        y: this.model.y,
        power: this.explodePower
      });
      this.shooter.world.addEffect(ServerWorldEffect.fromModel(effect, this.shooter.world));
    }
  }

}

module.exports = ServerBullet;
},{}],130:[function(require,module,exports){
const AbstractEntity = require(91);

const Utils = require(166);

const GameMap = require(159);

const Box2D = require(99);

class ServerEntity extends AbstractEntity {
  /**
   * @type {Game}
   */
  constructor(model) {
    super(model);
    this.game = null;
    this.explodeResistance = 0.2;
    model.id = ServerEntity.globalId++;
  }

  die() {
    this.model.dead = true;
  }

  tick(dt) {
    this.model.tick(dt);
  }

  checkPlayerHit(x, y, dx, dy) {
    if (!this.shooter.tank) return null;
    const a = x,
          b = y;
    const c = x + dx,
          d = y + dy;
    let distance = null;
    let victim = null;

    for (let player of this.shooter.tank.world.players.values()) {
      if (this.shooter === player) continue;
      const tank = player.tank;
      const body = tank.model.body;
      const position = body.GetPosition();
      const playerX = position.x;
      const playerY = position.y;
      const sin = tank.model.matrix.sin;
      const cos = tank.model.matrix.cos;

      for (let v = body.GetFixtureList(); v; v = v.GetNext()) {
        const shape = v.GetShape().GetVertices();

        for (let i = shape.length - 1; i >= 0; i--) {
          const vertex = shape[i];
          let previousVertex;
          if (i > 0) previousVertex = shape[i - 1];else previousVertex = shape[shape.length - 1];
          const x1 = vertex.x * cos - vertex.y * sin + playerX;
          const y1 = vertex.x * sin + vertex.y * cos + playerY;
          const x2 = previousVertex.x * cos - previousVertex.y * sin + playerX;
          const y2 = previousVertex.x * sin + previousVertex.y * cos + playerY;
          const intersection = Utils.checkLineIntersection(a, b, c, d, x1, y1, x2, y2);

          if (intersection.onLine1 && intersection.onLine2) {
            if (!distance || distance > intersection.k) {
              distance = intersection.k;
              victim = player;
            }
          }
        }
      }
    }

    if (victim) {
      return {
        distance: distance,
        victim: victim
      };
    }

    return null;
  } // TODO: переписать на distToSegment


  checkWallHit(x, y, dx, dy) {
    const steps = 10;
    dx /= steps;
    dy /= steps;

    for (let i = 0; i < steps; i++) {
      x += dx;
      y += dy;
      const bx = Math.floor(x / GameMap.BLOCK_SIZE);
      const by = Math.floor(y / GameMap.BLOCK_SIZE);
      let block = this.game.map.getBlock(bx, by);

      if (block !== null) {
        if (!block.constructor.isSolid) {
          continue;
        }
      }

      return {
        point: new Box2D.b2Vec2(x - dx, y - dy),
        block: new Box2D.b2Vec2(bx, by)
      };
    }

    return null;
  }

  static fromModel(model) {
    let type = this.types.get(model.constructor);

    if (type) {
      return new type(model);
    }

    return null;
  }

  static associate(serverClass, modelClass) {
    this.types.set(modelClass, serverClass);
  }

}

ServerEntity.types = new Map();
ServerEntity.globalId = 0;
module.exports = ServerEntity;
},{}],131:[function(require,module,exports){
const TankModel = require(142);
/**
 * Tank class, abstracted from code
 * execution side. Used both on server
 * and client side. Contains tank model
 * and side-specific data. (damage reason
 * array on server side, drawer on
 * client side)
 */


class AbstractTank {
  /**
   * Player that owns this tank
   * @type Player
   */

  /**
   * Generic model of this tank
   * @type {TankModel}
   */

  /**
   * @type {GameWorld}
   */

  /**
   * @type {Map<number, AbstractEffect>}
   */

  /**
   * @param {Object | null} options
   * @param {GameWorld | null} options.world
   */
  constructor(options) {
    this.player = null;
    this.model = null;
    this.world = null;
    this.effects = new Map();

    if (options) {
      if (options.world) {
        this.world = options.world;
      }
    }
  }
  /**
   * @returns {Class<TankModel>}
   */


  static getModel() {}

  destroy() {
    this.model.destroy();
  }

  encodeDynamicData() {}

  decodeDynamicData() {}

  create() {}

  tick(dt) {}

}

AbstractTank.Types = new Map();
module.exports = AbstractTank;
},{}],132:[function(require,module,exports){
class Axle {
  constructor() {
    this.sources = new Set();
    this.ownValue = 0;
    this.value = 0;
    this.destinations = new Set();
    this.update = false;
  }

  addSource(source) {
    this.sources.add(source);
    source.destinations.add(this);
    this.setNeedsUpdate();
    return this;
  }

  removeSource(source) {
    this.sources.delete(source);
    source.destinations.delete(this);
    this.setNeedsUpdate();
    return this;
  }

  disconnectAll() {
    for (let destination of this.destinations.values()) {
      destination.removeSource(this);
    }
  }

  connect(destination) {
    destination.addSource(this);
  }

  getValue() {
    if (this.update) {
      this.update = false;
      let result = this.ownValue;

      for (let source of this.sources.values()) result += source.getValue();

      this.value = result;
      return result;
    } else {
      return this.value;
    }
  }

  setValue(value) {
    this.ownValue = value;
    this.setNeedsUpdate();
  }

  setNeedsUpdate() {
    this.update = true;

    for (let destination of this.destinations.values()) destination.setNeedsUpdate();
  }

  needsUpdate() {
    return this.update;
  }

}

module.exports = Axle;
},{}],133:[function(require,module,exports){
const BinarySerializable = require(124);

const Axle = require(132);

class TankControls extends BinarySerializable {
  static groupName() {
    return TankControls.SERIALIZATION_GROUP_NAME;
  }

  static typeName() {
    return 0;
  }

  constructor(tank) {
    super();
    this.tank = tank;
    this.throttle = 0;
    this.steer = 0;
    this.axles = new Map();
    this.axles.set("x", new Axle());
    this.axles.set("y", new Axle());
    this.axles.set("primary-weapon", new Axle());
    this.axles.set("miner", new Axle());
    this.primaryWeaponActive = false;
    this.minerActive = false;
    this.updated = false;
    this.directional = false;
    this.matrix = null;
  }

  shouldUpdate() {
    if (this.updated) {
      this.updated = false;
      return true;
    }

    if (this.axles.get("primary-weapon").needsUpdate()) return true;
    return !!this.axles.get("miner").needsUpdate();
  }

  static fromJson(json) {
    let controls = new TankControls();
    controls.updateState(json);
    return controls;
  }

  getThrottle() {
    if (this.tank.health <= 0) {
      return 0;
    }

    if (this.axles.get("y").needsUpdate()) {
      this.updateAxises();
    }

    return this.throttle;
  }

  getSteer() {
    if (this.tank.health <= 0) {
      return 0;
    }

    if (this.axles.get("x").needsUpdate()) {
      this.updateAxises();
    }

    return this.steer;
  }

  getPrimaryWeaponAxle() {
    return this.axles.get("primary-weapon");
  }

  getMinerWeaponAxle() {
    return this.axles.get("miner");
  }

  isPrimaryWeaponActive() {
    if (this.tank.health <= 0) {
      return false;
    }

    let axle = this.getPrimaryWeaponAxle();

    if (axle.needsUpdate()) {
      this.primaryWeaponActive = axle.getValue() > 0.5;
    }

    return this.primaryWeaponActive;
  }

  isMinerActive() {
    if (this.tank.health <= 0) {
      return false;
    }

    let axle = this.getMinerWeaponAxle();

    if (axle.needsUpdate()) {
      this.minerActive = axle.getValue() > 0.5;
    }

    return this.minerActive;
  }

  updateAxises() {
    let x = this.axles.get("x").getValue();
    let y = this.axles.get("y").getValue();
    this.updated = true;

    if (this.matrix && this.directional) {
      this.steer = this.matrix.turnHorizontalAxis(x, y);
      this.throttle = this.matrix.turnVerticalAxis(x, y);
    } else {
      this.throttle = y;
      this.steer = x;
    }
  }

  updateState(decoder) {
    this.axles.get("x").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1));
    this.axles.get("y").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1));
    let weapons = decoder.readUint8();
    this.axles.get("primary-weapon").setValue(weapons & 0b00000001);
    this.axles.get("miner").setValue(weapons & 0b00000010);
    this.updateAxises();
  }

  toBinary(encoder) {
    encoder.writeFloat32(this.axles.get("x").getValue());
    encoder.writeFloat32(this.axles.get("y").getValue());
    let weapons = (this.isPrimaryWeaponActive() & 1) << 0 | (this.isMinerActive() & 1) << 1;
    encoder.writeUint8(weapons);
  }

}

module.exports = TankControls;
},{}],134:[function(require,module,exports){
const TankModel = require(142);

const PhysicsUtils = require(162);

const BasicTankBehaviour = require(140);

const Box2D = require(99);

const Cannon = require(168);

class BigBoiTank extends TankModel {
  constructor(options) {
    super(options);
    this.behaviour = new BasicTankBehaviour(this, {
      lateralFriction: 150,
      power: 40000,
      angulardamping: 2,
      angularFriction: 0.1,
      truckSlipperness: 0
    });
  }

  static getWeapon() {
    return Cannon;
  }

  static getMaximumHealth() {
    return 20;
  }

  static getId() {
    return 5;
  }

  initPhysics(world) {
    this.world = world;
    let size = 9;
    const segment = size / 2;
    let bodyFixture = PhysicsUtils.squareFixture(size, size * 0.87, null, {
      density: 3.5
    });
    let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.b2Vec2(size, 0), {
      density: 2
    });
    this.body = PhysicsUtils.dynamicBody(world, {
      linearDamping: 0.5
    });
    this.body.CreateFixture(bodyFixture);

    for (let fixture of trackFixtures) this.body.CreateFixture(fixture);
  }

}

TankModel.register(BigBoiTank);
module.exports = BigBoiTank;
},{}],135:[function(require,module,exports){
const TankModel = require(142);

const PhysicsUtils = require(162);

const WheeledTankBehaviour = require(141);

const Box2D = require(99);

const WeaponMachineGun = require(170);

class MonsterTank extends TankModel {
  constructor(options) {
    super(options);
    this.behaviour = new WheeledTankBehaviour(this, {
      power: 30000
    });
  }

  static getWeapon() {
    return WeaponMachineGun;
  }

  static getMaximumHealth() {
    return 10;
  }

  static getId() {
    return 3;
  }

  initPhysics(world) {
    this.world = world;
    let size = 9;
    let bodyFixture = PhysicsUtils.squareFixture(size * 0.6, size, new Box2D.b2Vec2(0, -size * 0.25));
    let trackFixtures = PhysicsUtils.horizontalSquareFixtures(size * 0.18, size * 0.9, new Box2D.b2Vec2(-size * 0.78, 0));
    this.body = PhysicsUtils.dynamicBody(world, {
      linearDamping: 0.3
    });
    this.body.CreateFixture(bodyFixture);

    for (let fixture of trackFixtures) this.body.CreateFixture(fixture);
  }

}

TankModel.register(MonsterTank);
module.exports = MonsterTank;
},{}],136:[function(require,module,exports){
const TankModel = require(142);

const PhysicsUtils = require(162);

const Box2D = require(99);

const AirbagTankBehaviour = require(138);

const WeaponFlamethrower = require(169);

class NastyTank extends TankModel {
  constructor(options) {
    super(options);
    this.behaviour = new AirbagTankBehaviour(this, {});
  }

  static getWeapon() {
    return WeaponFlamethrower;
  }

  static getMaximumHealth() {
    return 15;
  }

  static getId() {
    return 7;
  }

  initPhysics(world) {
    this.world = world;
    let size = 9;
    const vertexArray = [new Box2D.b2Vec2(-1.00, -1.10), new Box2D.b2Vec2(-0.80, -1.30), new Box2D.b2Vec2(0.80, -1.30), new Box2D.b2Vec2(1.00, -1.10), new Box2D.b2Vec2(1.00, -0.25), new Box2D.b2Vec2(0.55, 0.90), new Box2D.b2Vec2(-0.55, 0.90), new Box2D.b2Vec2(-1.00, -0.25)];
    vertexArray.forEach(v => v.Multiply(size));
    let bodyFixture = PhysicsUtils.vertexFixture(vertexArray);
    this.body = PhysicsUtils.dynamicBody(world, {
      linearDamping: 0.8,
      angularDamping: 0.7
    });
    this.body.CreateFixture(bodyFixture);
    this.world = world;
  }

}

TankModel.register(NastyTank);
module.exports = NastyTank;
},{}],137:[function(require,module,exports){
const TankModel = require(142);

const PhysicsUtils = require(162);

const BasicTankBehaviour = require(140);

const Box2D = require(99);

const Weapon42mm = require(167);

class SniperTank extends TankModel {
  constructor(options) {
    super(options);
    this.behaviour = new BasicTankBehaviour(this, {
      power: 20000
    });
  }

  static getWeapon() {
    return Weapon42mm;
  }

  initPhysics(world) {
    this.world = world;
    let size = 9;
    const segment = size / 4;
    let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.b2Vec2(0, 0));
    let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.b2Vec2(-size / 2 - segment, size * 0.2));
    this.body = PhysicsUtils.dynamicBody(world);
    this.body.CreateFixture(bodyFixture);

    for (let fixture of trackFixtures) this.body.CreateFixture(fixture);

    this.world = world;
  }

  static getMaximumHealth() {
    return 10;
  }

  static getId() {
    return 1;
  }

}

TankModel.register(SniperTank);
module.exports = SniperTank;
},{}],138:[function(require,module,exports){
const Box2D = require(99);

const TankBehaviour = require(139);

class AirbagTankModel extends TankBehaviour {
  constructor(tank, config) {
    super(tank, config);
    this.power = config.power || 50000;
    this.torque = config.torque || 120000;
    this.friction = config.friction || 0.1;
    this.propellerSpeed = config.propellerSpeed || 40;
    this.details = {
      transmissionSpeed: 0,
      propellerDist: 0,
      clutch: 0
    };
  }

  tick(dt) {
    const body = this.tank.body;
    const velocity = body.GetLinearVelocity();
    const x = velocity.x;
    const y = velocity.y;
    const initialSpeed = Math.sqrt(x ** 2 + y ** 2);
    let newSpeed = initialSpeed;
    newSpeed -= this.friction * dt;
    if (newSpeed < 0) newSpeed = 0;
    let coefficient;
    if (initialSpeed > 0) coefficient = newSpeed / initialSpeed;else coefficient = 1;
    velocity.x = x * coefficient;
    velocity.y = y * coefficient;
    const throttle = this.power * this.tank.controls.getThrottle();
    const rotation = this.torque * this.tank.controls.getSteer() * this.tank.controls.getThrottle();
    body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, throttle)), body.GetWorldPoint(new Box2D.b2Vec2(0, 0)));
    body.ApplyTorque(rotation);
  }

  countDetails(dt) {
    const tank = this.tank;
    const speed = (Math.abs(tank.controls.getThrottle()) + 0.5) * this.propellerSpeed;

    if (tank.health > 0) {
      this.details.propellerDist += speed * dt;
      this.details.transmissionSpeed = speed * dt / 2 + 0.3;
    } else {
      this.details.transmissionSpeed = 0;
    }

    this.details.clutch = Math.abs(tank.controls.getThrottle());
  }

}

module.exports = AirbagTankModel;
},{}],139:[function(require,module,exports){
const TankModel = require(142);
/**
 * Class which defines the physical behaviour of each specific type of tank (tracked, wheeled, etc.)
 */


class TankBehaviour {
  /**
   * Physical model details. Used mostly for
   * rendering on client side.
   * @type Object
   */
  constructor(tank, config) {
    this.details = {};
    this.power = config.power || 10000;
    this.lateralFriction = config.lateralFriction || 150;
    this.frontalfriction = config.frontalfriction || 20;
    this.angularFriction = config.angularFriction || 0.8;
    /** @type TankModel */

    this.tank = tank;
  }

  tick(dt) {
    const tank = this.tank;
    const body = tank.body;
    const velocity = body.GetLinearVelocity();
    const vx = velocity.x;
    const vy = velocity.y;
    let x2 = tank.matrix.cos * vx + tank.matrix.sin * vy;
    let y2 = -tank.matrix.sin * vx + tank.matrix.cos * vy;

    if (x2 > 0) {
      x2 -= this.lateralFriction * dt;
      if (x2 < 0) x2 = 0;
    } else if (x2 < 0) {
      x2 += this.lateralFriction * dt;
      if (x2 > 0) x2 = 0;
    }

    if (y2 > 0) {
      y2 -= this.frontalfriction * dt;
      if (y2 < 0) y2 = 0;
    } else if (y2 < 0) {
      y2 += this.frontalfriction * dt;
      if (y2 > 0) y2 = 0;
    }

    let angularVelocity = body.GetAngularVelocity();

    if (angularVelocity > 0) {
      angularVelocity -= this.angularFriction * dt;
      if (angularVelocity < 0) angularVelocity = 0;
    } else if (angularVelocity < 0) {
      angularVelocity += this.angularFriction * dt;
      if (angularVelocity > 0) angularVelocity = 0;
    }

    body.SetAngularVelocity(angularVelocity);
    velocity.x = tank.matrix.cos * x2 - tank.matrix.sin * y2;
    velocity.y = tank.matrix.sin * x2 + tank.matrix.cos * y2;
    body.SetLinearVelocity(velocity);
  }

  countDetails(dt) {}

}

module.exports = TankBehaviour;
},{}],140:[function(require,module,exports){
const Box2D = require(99);

const TankBehaviour = require(139);

class TruckTankBehaviour extends TankBehaviour {
  constructor(tank, config) {
    super(tank, config);
    this.truckbase = config.truckbase || 30;
    this.truckSlipperness = config.truckSlipperness || 15;
    this.truckSlipperySpeed = config.truckSlipperySpeed || 30;
    this.details = {
      leftTrackSpeed: 0,
      rightTrackSpeed: 0,
      leftTrackDist: 0,
      rightTrackDist: 0,
      clutch: 0,
      transmissionSpeed: 0
    };
  }

  clone() {
    return new TruckTankBehaviour(this);
  }
  /**
   * @param dt {number}
   */


  tick(dt) {
    super.tick(dt);
    const tank = this.tank;
    const body = this.tank.body;
    let x = tank.controls.getSteer();
    let y = tank.controls.getThrottle();
    let leftTrackSpeed = Math.max(Math.min(y - x, 1), -1);
    let rightTrackSpeed = Math.max(Math.min(y + x, 1), -1);
    const ls = leftTrackSpeed * this.power;
    const rs = rightTrackSpeed * this.power;
    body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, ls)), body.GetWorldPoint(new Box2D.b2Vec2(-this.truckbase, 0)));
    body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, rs)), body.GetWorldPoint(new Box2D.b2Vec2(this.truckbase, 0)));
  }

  countDetails(dt) {
    const tank = this.tank;
    const body = tank.body;
    const steerX = tank.controls.getSteer();
    const steerY = tank.controls.getThrottle();
    const velocity = body.GetLinearVelocity();
    const sx = velocity.x;
    const sy = velocity.y;
    const y2 = -tank.matrix.sin * sx + tank.matrix.cos * sy;
    const angularVelocity = body.GetAngularVelocity();
    let left = -y2 - angularVelocity * this.truckbase;
    let right = -y2 + angularVelocity * this.truckbase;
    const ls = Math.max(Math.min(steerY + steerX, 1), -1) * this.truckSlipperySpeed;
    const rs = Math.max(Math.min(steerY - steerX, 1), -1) * this.truckSlipperySpeed;

    if (this.truckSlipperness > Math.abs(left) && ls !== 0) {
      if (ls < 0) {
        left = Math.min(this.truckSlipperness, -ls);
      } else {
        left = -Math.min(this.truckSlipperness, ls);
      }
    }

    if (this.truckSlipperness > Math.abs(right) && rs !== 0) {
      if (rs < 0) {
        right = Math.min(this.truckSlipperness, -rs);
      } else {
        right = -Math.min(this.truckSlipperness, rs);
      }
    }

    this.details.leftTrackSpeed = left;
    this.details.rightTrackSpeed = right;
    this.details.leftTrackDist += left * dt;
    this.details.rightTrackDist += right * dt;
    this.details.clutch = Math.min(1, Math.abs(steerX) + Math.abs(steerY));
    this.details.transmissionSpeed = Math.max(Math.abs(this.details.leftTrackSpeed), Math.abs(this.details.rightTrackSpeed));
  }

}

module.exports = TruckTankBehaviour;
},{}],141:[function(require,module,exports){
const Box2D = require(99);

const TankBehaviour = require(139);

class WheeledTankModel extends TankBehaviour {
  constructor(tank, config) {
    super(tank, config);
    this.turnRate = 2;
    this.axleDistance = 0.6;
    this.axleWidth = 0.8;
    this.wheelSpeed = 9.8;
    this.details = {
      leftWheelsAngle: 0,
      rightWheelsAngle: 0,
      leftWheelsSpeed: 0,
      rightWheelsSpeed: 0,
      leftWheelsDist: 0,
      rightWheelsDist: 0
    };
  }

  clone() {
    return new WheeledTankModel(this);
  }

  tick(dt) {
    super.tick(dt);
    const tank = this.tank;
    const body = tank.body;
    let steerX, steerY;
    steerX = tank.controls.getSteer();
    steerY = tank.controls.getThrottle();
    const throttle = this.power * steerY;
    const k = 20000;
    const velocity = body.GetLinearVelocity();
    const angular = body.GetAngularVelocity();
    const vx = velocity.x;
    const vy = velocity.y;
    const y2 = -tank.matrix.sin * vx + tank.matrix.cos * vy;
    const turnRate = (y2 * steerX * this.turnRate - angular) * k / (Math.abs(y2) / 15 + 1);
    body.ApplyForce(body.GetWorldVector(new Box2D.b2Vec2(0, throttle)), body.GetWorldPoint(new Box2D.b2Vec2(0, 0)));
    body.ApplyTorque(turnRate);
  }

  countDetails(dt) {
    let tank = this.tank;
    let body = tank.body;
    let steer = tank.controls.getSteer();

    if (steer === 0) {
      this.details.leftWheelsAngle = 0;
      this.details.rightWheelsAngle = 0;
    } else {
      let radius = 1 / steer * 2;
      this.details.leftWheelsAngle = Math.atan2(this.axleDistance, radius + this.axleWidth / 2);
      this.details.rightWheelsAngle = Math.atan2(this.axleDistance, radius - this.axleWidth / 2);

      if (steer < 0) {
        this.details.rightWheelsAngle += Math.PI;
        this.details.leftWheelsAngle += Math.PI;
      }
    }

    let speed = tank.body.GetLinearVelocity();
    let y2 = -tank.matrix.sin * speed.x + tank.matrix.cos * speed.y;
    let angularVelocity = body.GetAngularVelocity();
    let left = (y2 + angularVelocity * this.axleWidth / 2) * this.wheelSpeed;
    let right = (y2 - angularVelocity * this.axleWidth / 2) * this.wheelSpeed;
    this.details.leftWheelsSpeed = left * dt;
    this.details.rightWheelsSpeed = right * dt;
    this.details.leftWheelsDist -= left * dt;
    this.details.rightWheelsDist -= right * dt;
  }

}

module.exports = WheeledTankModel;
},{}],142:[function(require,module,exports){
const TankBehaviour = require(139);

const TankControls = require(133);

const RotationalMatrix = require(165);

const BinarySerializable = require(124);

const Box2D = require(99);
/**
 * Tank model. Сombines the physical model
 * of the tank, its behavior and controls.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */


class TankModel extends BinarySerializable {
  /**
   * Physical behaviour of this tank
   * @type TankBehaviour
   */

  /**
   * Box2D World, containing this tank.
   * @type b2World
   */

  /**
   * Box2D body of this tank.
   * @type b2Body
   */

  /**
   * @type TankControls
   */

  /**
   * @type number
   */

  /**
   * @type RotationalMatrix
   */

  /**
   * @type b2Vec2
   */
  constructor() {
    super();
    this.behaviour = null;
    this.world = null;
    this.body = null;
    this.controls = null;
    this.health = 0;
    this.matrix = null;
    this.targetPosition = void 0;
    this.behaviour = null;
    this.world = null;
    this.body = null;
    this.controls = new TankControls(this);
    this.health = this.constructor.getMaximumHealth();
    this.matrix = new RotationalMatrix();
    this.targetPosition = null;
  }

  initPhysics(world) {
    throw new Error("Abstract class instancing is invalid.");
  }

  destroy() {
    this.world.DestroyBody(this.body);
  }

  get x() {
    return this.body.m_xf.position.x;
  }

  get y() {
    return this.body.m_xf.position.y;
  }

  set x(x) {
    this.body.m_xf.position.x = x;
  }

  set y(y) {
    this.body.m_xf.position.y = y;
  }

  get rotation() {
    return this.body.m_sweep.a;
  }

  set rotation(rotation) {
    this.body.m_sweep.a = rotation;
    this.matrix.angle(rotation);
  }

  static getWeapon() {
    throw new Error("Abstract class instancing is illegal");
  }

  static canPlaceMines() {
    return true;
  }

  static getMaximumHealth() {
    return 10;
  }

  static getId() {
    return 0;
  } // Serialization stuff


  toBinary(encoder) {}

  static fromBinary(decoder) {
    return new this();
  }

  static typeName() {
    return this.getId();
  }

  static groupName() {
    return this.SERIALIZATION_GROUP_NAME;
  }

}

TankModel.SERIALIZATION_GROUP_NAME = 4;
TankModel.Types = new Map();
module.exports = TankModel;
},{}],143:[function(require,module,exports){
class BinaryOptions {
  constructor() {
    /**
     * Flag handler map
     * @type Map<number, BinaryOptions.FlagHandler>
     */
    this.flags = new Map();
    this.trimFlagIdentifier = false;
  }

  addFlagHandler(handler) {
    this.flags.set(handler.id, handler);
  }

  convertBinary(decoder, options) {
    let flags;
    if (this.trimFlagIdentifier) flags = decoder.readUint8();else flags = decoder.readUint16();
    options = options || {};

    while (flags--) {
      let flag;
      if (this.trimFlagIdentifier) flag = decoder.readUint8();else flag = decoder.readUint16();

      if (this.flags.has(flag)) {
        let handler = this.flags.get(flag);
        handler.unpacker(decoder, options);
      }
    }

    return options;
  }

  convertOptions(encoder, options, flags) {
    if (!options) options = {};
    let count = 0;

    for (let [flag, handler] of this.flags.entries()) {
      if (flags && flags.indexOf(flag) === -1) continue;
      if (handler.decision && !handler.decision(options)) continue;
      count++;
    }

    if (this.trimFlagIdentifier) encoder.writeUint8(count);else encoder.writeUint16(count);

    for (let [flag, handler] of this.flags.entries()) {
      if (flags && flags.indexOf(flag) === -1) continue;
      if (handler.decision && !handler.decision(options)) continue;
      if (this.trimFlagIdentifier) encoder.writeUint8(flag);else encoder.writeUint16(flag);
      handler.packer(encoder, options);
    }

    return options;
  }

}

BinaryOptions.FlagHandler = class {
  constructor(id) {
    this.id = id;
    this.unpacker = null;
    this.packer = null;
    this.decision = null;
  }

  setUnpacker(handler) {
    this.unpacker = handler;
    return this;
  }

  setPacker(packer) {
    this.packer = packer;
    return this;
  }

  packDecision(decision) {
    this.decision = decision;
    return this;
  }

};
module.exports = BinaryOptions;
},{}],144:[function(require,module,exports){
class Color {
  constructor(red, green, blue, alpha) {
    this.r = red;
    this.g = green;
    this.b = blue;
    this.alpha = alpha || 1.0;
  }

  setRed(r) {
    this.r = r;
    this.string = 0;
  }

  setGreen(g) {
    this.g = g;
    this.string = 0;
  }

  setBlue(b) {
    this.b = b;
    this.string = 0;
  }

  setAlpha(a) {
    this.alpha = a;
    this.string = 0;
  }
  /**
   * Returns chat color code with specified RGB values
   * @param r {number}
   * @param g {number}
   * @param b {number}
   * @param bold {boolean}
   */


  static chatColor(r, g, b, bold = false) {
    let color = "";

    if ((r & 0xF) === (r >> 4 & 0xF) && (g & 0xF) === (g >> 4 & 0xF) && (b & 0xF) === (b >> 4 & 0xF)) {
      color = r.toString(16) + g.toString(16) + b.toString(16);
    } else {
      color = r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
    }

    if (bold) {
      return "§!" + color + ";";
    } else {
      return "§" + color + ";";
    }
  }

  static replace(text, replace) {
    return text.replace(/(§!?[0-9A-F]{0,6};)?[^§\n]*/gi, function (a) {
      // if(!/^\\*(§!?[0-9A-F]{0,6};/.test(a)) {
      //     return replace("", false, a)
      // }
      //
      // // Checking if color sequence is screened
      //
      // let start = a.indexOf("§")
      let prefix = ""; // if(start % 2 === 1) {
      //     return a.substr(1)
      // } else if(start) {
      //     prefix = a.substr(0, start)
      //     a = a.substr(start)
      // }

      let index = a.indexOf(";");
      let color = a.substr(1, index - 1);
      let text = a.substr(index + 1);
      let bold = color.startsWith("!");
      if (bold) color = color.substr(1);
      return prefix + replace(color, bold, text);
    });
  }

  toChatColor(bold) {
    return Color.chatColor(this.r, this.g, this.b, bold);
  }

  code() {
    if (this.string) return this.string;

    if (this.alpha === 1) {
      let r, g, b;
      r = Math.round(this.r).toString(16);
      g = Math.round(this.g).toString(16);
      b = Math.round(this.b).toString(16);
      r.length === 1 && (r = "0" + r);
      g.length === 1 && (g = "0" + g);
      b.length === 1 && (b = "0" + b);
      this.string = "#" + r + g + b;
    } else {
      this.string = "rgba(" + Math.round(this.r) + "," + Math.round(this.g) + "," + Math.round(this.b) + "," + Math.round(this.alpha * 100) / 100 + ")";
    }

    return this.string;
  }

  static saturateChannel(c, saturation) {
    return Math.round((c - 127) * saturation + 127);
  }

  applyingSaturation(saturation) {
    return new Color(Color.saturateChannel(this.r, saturation), Color.saturateChannel(this.g, saturation), Color.saturateChannel(this.b, saturation), this.alpha);
  }

  withAlpha(alpha) {
    return new Color(this.r, this.g, this.b, alpha);
  }

  static red() {
    return new Color(255, 0, 0);
  }

  static green() {
    return new Color(0, 255, 0);
  }

  static blue() {
    return new Color(0, 0, 255);
  }

  static gray() {
    return new Color(127, 127, 127);
  }

}

module.exports = Color;
},{}],145:[function(require,module,exports){
if (typeof window == "undefined") {
  const Events = require("eve" + "nts"); // noinspection JSDuplicatedDeclaration


  class EventEmitter extends Events {
    constructor() {
      super();
    }

    on(event, handler) {
      this.addListener(event, handler);
    }

  }

  module.exports = EventEmitter;
} else {
  // noinspection JSDuplicatedDeclaration
  class EventEmitter {
    constructor() {
      this.events = new Map();
    }

    emit(event) {
      if (this.events.has(event)) {
        let args = Array.prototype.slice.call(arguments, 1);

        for (let listener of this.events.get(event)) {
          listener.apply(null, args);
        }
      }
    }

    on(event, handler) {
      if (this.events.has(event)) {
        this.events.get(event).push(handler);
      } else {
        this.events.set(event, [handler]);
      }
    }

  }

  module.exports = EventEmitter;
}
},{}],146:[function(require,module,exports){
module.exports = function (text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
},{}],147:[function(require,module,exports){
const ScheduledTask = require(149);

class Loop {
  constructor(game) {
    this.game = game;
    /** @type Map<number,ScheduledTask>*/

    this.schedule = new Map();
    this.schedules = 0;
    this.ticks = 0;
    this.loopTimestamp = 0;
    this.maximumTimestep = 0.1;
    this.timeMultiplier = 1;
    this.run = null;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  cycle(dt) {}

  runScheduledTasks(dt) {
    ScheduledTask.lockInitialTimers = true;

    for (let [key, task] of this.schedule.entries()) {
      if (task.tick(dt)) {
        this.schedule.delete(key);
      }
    }

    ScheduledTask.lockInitialTimers = false;
  }

  perform(timestamp) {
    if (timestamp === undefined) {
      timestamp = Date.now();
    }

    this.ticks++;

    if (this.running) {
      let dt;

      if (this.loopTimestamp) {
        dt = (timestamp - this.loopTimestamp) * this.timeMultiplier;
        if (dt > this.maximumTimestep) dt = this.maximumTimestep;
      } else {
        dt = 0;
      }

      this.loopTimestamp = timestamp;
      this.runScheduledTasks(dt);

      if (this.run) {
        this.run(dt);
      }

      this.cycle(dt);
    } else {
      this.loopTimestamp = undefined;
    }
  }

  scheduleTask(func, time) {
    time = time || 0;
    let index = this.schedules++;
    this.schedule.set(index, new ScheduledTask(func, time));
    return index;
  }

}

module.exports = Loop;
},{}],148:[function(require,module,exports){
const Loop = require(147);

class RenderLoop extends Loop {
  constructor(game) {
    super(game);
    this.timeMultiplier = 0.001;
  }

  start() {
    super.start();
    this.perform(0);
  }

  cycle(dt) {
    requestAnimationFrame(time => {
      this.perform(time);
    });
  }

}

module.exports = RenderLoop;
},{}],149:[function(require,module,exports){
class ScheduledTask {
  constructor(func, time) {
    this.func = func;
    this.time = time;
    this.lock = ScheduledTask.lockInitialTimers;
  }

  tick(dt) {
    if (this.lock) {
      this.lock = false;
      return;
    }

    if ((this.time -= dt) <= 0) {
      this.func.apply(null);
      return true;
    }

    return false;
  }

}

ScheduledTask.lockInitialTimers = false;
module.exports = ScheduledTask;
},{}],150:[function(require,module,exports){
const BlockStateBinaryOptions = require(151);

class BlockState {
  /**
   * @type {Map<number, Class<BlockState>>}
   */
  constructor(options) {
    options = options || {};
    this.damage = options.damage || 0;
    this.solid = options.solid || this.constructor.isSolid;
    this.facing = 0;
  }

  clone() {
    return new this.constructor(this);
  }

  update(map, x, y) {
    if (this.facing !== -1) {
      this.updateNeighbourFacing(map, x, y);
    }
  }

  getNeighbourId(map, x, y) {
    let block = map.getBlock(x, y);
    if (block) return block.constructor.typeId;
    return 0;
  }

  updateNeighbourFacing(map, x, y) {
    const id = this.constructor.typeId;
    this.facing = 0;
    let sides = 0;
    sides |= (this.getNeighbourId(map, x - 1, y - 1) === id) << 7;
    sides |= (this.getNeighbourId(map, x, y - 1) === id) << 6;
    sides |= (this.getNeighbourId(map, x + 1, y - 1) === id) << 5;
    sides |= (this.getNeighbourId(map, x + 1, y) === id) << 4;
    sides |= (this.getNeighbourId(map, x + 1, y + 1) === id) << 3;
    sides |= (this.getNeighbourId(map, x, y + 1) === id) << 2;
    sides |= (this.getNeighbourId(map, x - 1, y + 1) === id) << 1;
    sides |= (this.getNeighbourId(map, x - 1, y) === id) << 0;
    sides |= sides << 8;

    for (let i = 0; i < 4; i++) {
      let t = sides;
      let corner = 4;

      if (i === 0) {
        t &= 0b00000111;
      } else if (i === 1) {
        t &= 0b00011100;
        t >>= 2;
      } else if (i === 2) {
        t &= 0b01110000;
        t >>= 4;
      } else {
        t &= 0b11000001;
        t = t >> 6 | (t & 1) << 2;
      }

      if (t === 0b001) corner = 1;
      if (t === 0b101) corner = 3;
      if (t === 0b111) corner = 4;
      if (t === 0b011) corner = 1;
      if (t === 0b000) corner = 0;
      if (t === 0b100) corner = 2;
      if (t === 0b110) corner = 2;
      if (t === 0b010) corner = 0;

      if (i % 2 === 1) {
        if (corner === 1) corner = 2;else if (corner === 2) corner = 1;
      }

      this.facing <<= 3;
      this.facing |= corner;
    }
  }

  getHealth() {
    return this.constructor.health * (1 - this.damage);
  }

  setHealth(health) {
    this.damage = 1 - health / this.constructor.health;
  }

  static registerBlockStateClass(clazz) {
    this.Types.set(clazz.typeId, clazz);
  }
  /**
   * @param id {Number}
   * @returns {Class<BlockState>}
   */


  static getBlockStateClass(id) {
    return this.Types.get(id) || BlockState;
  }

}

BlockState.BinaryOptions = BlockStateBinaryOptions.shared;
BlockState.Types = new Map();
BlockState.health = 16000;
BlockState.isSolid = true;
BlockState.typeName = "unspecified";
BlockState.typeId = 0;
module.exports = BlockState;
},{}],151:[function(require,module,exports){
const BinaryOptions = require(143);

class BlockStateBinaryOptions extends BinaryOptions {
  constructor() {
    super();
    this.trimFlagIdentifier = true;
    this.addFlagHandler(new BinaryOptions.FlagHandler(BlockStateBinaryOptions.DAMAGE_FLAG).setUnpacker((decoder, object) => {
      object.damage = decoder.readUint16() / 0xFFFF;
    }).setPacker((encoder, object) => {
      encoder.writeUint16(object.damage * 0xFFFF);
    }).packDecision(object => {
      return Number.isFinite(object.damage) && object.damage > 0;
    }));
  }

}

BlockStateBinaryOptions.DAMAGE_FLAG = 0x0001;
BlockStateBinaryOptions.shared = new BlockStateBinaryOptions();
module.exports = BlockStateBinaryOptions;
},{}],152:[function(require,module,exports){
let files = [];
files.push(require(153));
files.push(require(154));
files.push(require(155));
files.push(require(156));
files.push(require(157));
files.push(require(158));
module.exports = files;
},{}],153:[function(require,module,exports){
const BlockState = require(150);

const BinaryOptions = require(143);

class AirBinaryOptions extends BinaryOptions {
  convertOptions(encoder, options, flags) {}

  convertBinary(decoder, options) {}

}

class AirBlockState extends BlockState {
  // Empty options
  update(map, x, y) {}

}

AirBlockState.BinaryOptions = new AirBinaryOptions();
AirBlockState.isSolid = false;
AirBlockState.typeName = "air";
AirBlockState.typeId = 0;
BlockState.registerBlockStateClass(AirBlockState);
module.exports = AirBlockState;
},{}],154:[function(require,module,exports){
const BlockState = require(150);

class BrickBlockState extends BlockState {}

BrickBlockState.health = 3000;
BrickBlockState.typeName = "brick";
BrickBlockState.typeId = 1;
BlockState.registerBlockStateClass(BrickBlockState);
module.exports = BrickBlockState;
},{}],155:[function(require,module,exports){
const BlockState = require(150);

class ConcreteBlockState extends BlockState {}

ConcreteBlockState.health = 6000;
ConcreteBlockState.typeName = "concrete";
ConcreteBlockState.typeId = 2;
BlockState.registerBlockStateClass(ConcreteBlockState);
module.exports = ConcreteBlockState;
},{}],156:[function(require,module,exports){
const BlockState = require(150);

class StoneBlockState extends BlockState {}

StoneBlockState.health = 7500;
StoneBlockState.typeName = "stone";
StoneBlockState.typeId = 5;
BlockState.registerBlockStateClass(StoneBlockState);
module.exports = StoneBlockState;
},{}],157:[function(require,module,exports){
const BlockState = require(150);

class TrophephngoldBlockState extends BlockState {}

TrophephngoldBlockState.health = Infinity;
TrophephngoldBlockState.typeName = "trophephngold";
TrophephngoldBlockState.typeId = 4;
BlockState.registerBlockStateClass(TrophephngoldBlockState);
module.exports = TrophephngoldBlockState;
},{}],158:[function(require,module,exports){
const BlockState = require(150);

class WoodBlockState extends BlockState {
  constructor() {
    super();
    this.variant = Math.floor(Math.random() * 18);
  }

}

WoodBlockState.health = 1500;
WoodBlockState.typeName = "wood";
WoodBlockState.typeId = 3;
BlockState.registerBlockStateClass(WoodBlockState);
module.exports = WoodBlockState;
},{}],159:[function(require,module,exports){
const EventEmitter = require(145);

const MapBinaryOptions = require(160);

const BlockState = require(150);

const AirBlockState = require(153);

require(152);

class GameMap extends EventEmitter {
  /**
   *
   * @type {BlockState[]}
   */

  /**
   *
   * @type {number}
   */

  /**
   *
   * @type {number}
   */

  /**
   * @type {SpawnZone[]}
   */
  constructor(config) {
    super();
    this.data = [];
    this.width = 0;
    this.height = 0;
    this.spawnZones = [];
    config = config || {};
    this.spawnZones = config.spawnZones || [];
    this.width = config.width || GameMap.DEFAULT_WIDTH;
    this.height = config.height || GameMap.DEFAULT_HEIGHT;
    this.data = config.data;
    this.needsUpdate = true;
  }

  getBlock(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.data[x + this.width * y];
  }

  setBlock(x, y, block) {
    let index = x + y * this.width;
    this.data[index] = block;
    const lowX = Math.max(0, x - 1);
    const lowY = Math.max(0, y - 1);
    const highX = Math.min(this.width - 1, x + 1);
    const highY = Math.min(this.height - 1, y + 1);
    let base = lowX + lowY * this.width;
    index = base;

    for (let by = lowY; by <= highY; by++) {
      for (let bx = lowX; bx <= highX; bx++) {
        this.data[index++].update(this, bx, by);
      }

      index = base += this.width;
    }

    this.emit("block-update", x, y);
  }

  spawnPointForTeam(id) {
    const zone = this.spawnZones[id];

    if (!zone) {
      return {
        x: Math.random() * this.map.width * GameMap.BLOCK_SIZE,
        y: Math.random() * this.map.height * GameMap.BLOCK_SIZE
      };
    }

    const x = (Math.random() * (zone.x2 - zone.x1) + zone.x1) * GameMap.BLOCK_SIZE;
    const y = (Math.random() * (zone.y2 - zone.y1) + zone.y1) * GameMap.BLOCK_SIZE;
    return {
      x: x,
      y: y
    };
  }

  damageBlock(x, y, d) {
    x = Math.floor(x);
    y = Math.floor(y);
    let b = this.getBlock(x, y);
    if (!b || b instanceof AirBlockState) return;
    let health = b.getHealth();

    if (health - d < 0) {
      this.setBlock(x, y, new AirBlockState());
    } else {
      b.setHealth(health - d);
      b.update(this, x, y);
    }

    this.emit("block-update", x, y);
  }

  update() {
    this.needsUpdate = false;
    let x = 0,
        y = 0;

    for (let block of this.data) {
      block.update(this, x, y);
      x++;

      if (x >= this.width) {
        x -= this.width;
        y++;
      }
    }
  }

  static fromBinary(decoder) {
    let options = this.BinaryOptions.convertBinary(decoder);
    return new this(options);
  }

  toBinary(encoder, flags) {
    this.constructor.BinaryOptions.convertOptions(encoder, this, flags);
  }

}

GameMap.BinaryOptions = MapBinaryOptions.shared;
GameMap.BLOCK_SIZE = 20;
module.exports = GameMap;
},{}],160:[function(require,module,exports){
const BinaryOptions = require(143);

const BlockState = require(150);

const SpawnZone = require(161);

class MapBinaryOptions extends BinaryOptions {
  constructor() {
    super();
    this.DATA_FLAG = 0x0000;
    this.SIZE_FLAG = 0x0001;
    this.SPAWN_ZONES_FLAG = 0x0002;
    this.DEFAULT_WIDTH = 50;
    this.DEFAULT_HEIGHT = 50;
    this.addFlagHandler(new MapBinaryOptions.FlagHandler(this.SIZE_FLAG).setPacker((encoder, options) => {
      encoder.writeUint32(options.width === undefined ? this.DEFAULT_WIDTH : options.width);
      encoder.writeUint32(options.height === undefined ? this.DEFAULT_WIDTH : options.height);
    }).setUnpacker((decoder, options) => {
      options.width = decoder.readUint32();
      options.height = decoder.readUint32();
    }));
    this.addFlagHandler(new MapBinaryOptions.FlagHandler(this.DATA_FLAG).setPacker((encoder, options) => {
      for (let block of options.data) {
        const Block = block.constructor;
        encoder.writeUint8(Block.typeId);
        const BinaryOptions = Block.BinaryOptions;
        BinaryOptions.convertOptions(encoder, block);
      }
    }).setUnpacker((decoder, options) => {
      if (options.width === undefined) options.width = this.DEFAULT_WIDTH;
      if (options.height === undefined) options.height = this.DEFAULT_HEIGHT;
      const size = options.width * options.height;
      let blockOptions;
      options.data = new Array(size);

      for (let i = 0; i < size; i++) {
        blockOptions = {};
        const id = decoder.readUint8();
        const Block = BlockState.getBlockStateClass(id);
        const BinaryOptions = Block.BinaryOptions;
        BinaryOptions.convertBinary(decoder, blockOptions);
        options.data[i] = new Block({});
      }
    }));
    this.addFlagHandler(new MapBinaryOptions.FlagHandler(this.SPAWN_ZONES_FLAG).setPacker((encoder, options) => {
      encoder.writeUint16(options.spawnZones.length);

      for (let zone of options.spawnZones) {
        zone.toBinary(encoder);
      }
    }).setUnpacker((decoder, options) => {
      let count = decoder.readUint16();
      options.spawnZones = [];

      while (count--) {
        options.spawnZones.push(SpawnZone.fromBinary(decoder));
      }
    }));
  }

}

MapBinaryOptions.shared = new MapBinaryOptions();
module.exports = MapBinaryOptions;
},{}],161:[function(require,module,exports){
const Rectangle = require(164);

class SpawnZone extends Rectangle {
  constructor(id) {
    super();
    this.id = id;
  }

  static fromBinary(decoder) {
    let zone = new this(decoder.readUint8());
    zone.setFrom(decoder.readUint32(), decoder.readUint32());
    zone.setTo(decoder.readUint32(), decoder.readUint32());
    return zone;
  }

  toBinary(encoder) {
    encoder.writeUint8(this.id);
    encoder.writeUint32(this.x1);
    encoder.writeUint32(this.y1);
    encoder.writeUint32(this.x2);
    encoder.writeUint32(this.y2);
  }

}

module.exports = SpawnZone;
},{}],162:[function(require,module,exports){
const Box2D = require(99);

class PhysicsUtils {
  static createFixture(options) {
    if (!options) options = {};
    const fixture = new Box2D.b2FixtureDef();
    fixture.friction = options.friction || 0.3;
    fixture.density = options.density || 1;
    fixture.restitution = options.restitution || 0;
    return fixture;
  }

  static squareFixture(width, height, offset, options) {
    if (!offset) {
      offset = new Box2D.b2Vec2(0, 0);
    }

    const shape = new Box2D.b2PolygonShape();
    shape.SetAsOrientedBox(width, height, offset, 0);
    const fixture = this.createFixture(options);
    fixture.shape = shape;
    return fixture;
  }

  static horizontalSquareFixtures(width, height, offset, options) {
    return [this.squareFixture(width, height, new Box2D.b2Vec2(-offset.x, offset.y), options), this.squareFixture(width, height, new Box2D.b2Vec2(offset.x, offset.y), options)];
  }

  static dynamicBody(world, options) {
    options = options || {};
    const bodyDef = new Box2D.b2BodyDef();
    bodyDef.type = Box2D.b2Body.b2_dynamicBody;
    let body = world.CreateBody(bodyDef);
    body.SetLinearDamping(options.linearDamping || 1.0);
    body.SetAngularDamping(options.angularDamping || 8.0);
    return body;
  }

  static vertexFixture(vertexArray, options) {
    const shape = new Box2D.b2PolygonShape();
    shape.SetAsArray(vertexArray);
    const fixture = this.createFixture(options);
    fixture.shape = shape;
    return fixture;
  }

  static setupPhysics() {
    Box2D.b2Settings.b2_maxTranslation = 20;
    Box2D.b2Settings.b2_maxTranslationSquared = 4000;
  }

}

module.exports = PhysicsUtils;
},{}],163:[function(require,module,exports){
const PhysicsUtils = require(162);

const Box2D = require(99);

class Player {
  /** @type AbstractTank */

  /** @type GameWorld */
  constructor(config) {
    this.tank = void 0;
    this.world = void 0;
    config = config || {};
    this.nick = config.nick;
    this.id = config.id;
    this.world = config.world;
    this.tank = null;
    this.team = config.team;
    this.blockMap = [];
  }

  setTank(tank) {
    this.tank = tank;
    tank.player = this;
  }

  setupPhysics() {
    const wallFixture = PhysicsUtils.squareFixture(10, 10, null, {
      density: 1.0,
      friction: 0.1,
      restitution: 0.5
    });

    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        this.blockMap.push(null);
        continue;
      }

      const bodyDef = new Box2D.b2BodyDef();
      bodyDef.type = Box2D.b2Body.b2_staticBody;
      bodyDef.position.x = 0;
      bodyDef.position.y = 0;
      this.blockMap.push(this.world.world.CreateBody(bodyDef).CreateFixture(wallFixture).GetBody());
    }
  }

  destroy() {
    this.tank.destroy();
    let blocks = this.blockMap;

    for (let i = blocks.length - 1; i >= 0; i--) {
      let b = blocks[i];
      if (b) this.world.world.DestroyBody(b);
    }

    this.blockMap = [];
  }

}

module.exports = Player;
},{}],164:[function(require,module,exports){
class Rectangle {
  constructor(x1, y1, x2, y2) {
    this.x1 = null;
    this.y1 = null;
    this.x2 = null;
    this.y2 = null;
    this.minX = null;
    this.maxX = null;
    this.minY = null;
    this.maxY = null;

    if (arguments.length === 4) {
      this.x1 = x1;
      this.x2 = x2;
      this.y1 = y1;
      this.y2 = y2;
      this.refreshBounds();
    }
  }

  isValid() {
    return Number.isFinite(this.x1) && Number.isFinite(this.x2) && Number.isFinite(this.y1) && Number.isFinite(this.y2);
  }

  contains(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }

  centerX() {
    return (this.x1 + this.x2) / 2;
  }

  centerY() {
    return (this.y1 + this.y2) / 2;
  }

  width() {
    return this.maxX - this.minX;
  }

  height() {
    return this.maxY - this.minY;
  }

  invalidate() {
    this.x1 = null;
    this.x2 = null;
    this.y1 = null;
    this.y2 = null;
    this.minX = null;
    this.maxX = null;
    this.minY = null;
    this.maxY = null;
  }

  refreshBounds() {
    this.minX = Math.min(this.x1, this.x2);
    this.maxX = Math.max(this.x1, this.x2);
    this.minY = Math.min(this.y1, this.y2);
    this.maxY = Math.max(this.y1, this.y2);
  }

  translate(dx, dy) {
    this.x1 += dx;
    this.x2 += dx;
    this.y1 += dy;
    this.y2 += dy;
    this.refreshBounds();
  }

  setFrom(x, y) {
    this.x1 = x;
    this.y1 = y;
    this.refreshBounds();
  }

  setTo(x, y) {
    this.x2 = x;
    this.y2 = y;
    this.refreshBounds();
  }

  equals(rect) {
    return rect.x1 === this.x1 && rect.x2 === this.x2 && rect.y1 === this.y1 && rect.y2 === this.y2;
  }

  clone() {
    return new Rectangle(this.x1, this.y1, this.x2, this.y2);
  }

  bounding(x1, y1, x2, y2) {
    if (this.x1 > x1) x1 = this.x1;
    if (this.x2 < x2) x2 = this.x2;
    if (this.y1 > y1) y1 = this.y1;
    if (this.y2 < y2) y2 = this.y2;
    return new Rectangle(x1, y1, x2, y2);
  }

}

module.exports = Rectangle;
},{}],165:[function(require,module,exports){
class RotationalMatrix {
  /**
   * Sine of the rotation angle
   * @type number
   */

  /**
   * Cosine of the rotation angle
   * @type number
   */
  constructor(angle) {
    this.sin = 1;
    this.cos = 0;
    angle = angle || 0;
    this.sin = Math.sin(angle);
    this.cos = Math.cos(angle);
  }

  angle(angle) {
    if (angle !== this.angle) {
      this.sin = Math.sin(angle);
      this.cos = Math.cos(angle);
    }
  }

  turnHorizontalAxis(x, y) {
    return x * this.cos - y * this.sin;
  }

  turnVerticalAxis(x, y) {
    return x * this.sin + y * this.cos;
  }

}

module.exports = RotationalMatrix;
},{}],166:[function(require,module,exports){
class Utils {
  static checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    let denominator, a, b, numerator1, numerator2;
    const result = {
      k: null,
      onLine1: false,
      onLine2: false
    };
    denominator = (line2EndY - line2StartY) * (line1EndX - line1StartX) - (line2EndX - line2StartX) * (line1EndY - line1StartY);

    if (denominator === 0) {
      return result;
    }

    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
    numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    result.k = a;

    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }

    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }

    return result;
  }

  static trimFileExtension(name) {
    let parts = name.split(".");
    if (parts.length > 1) parts.pop();
    return parts.join(".");
  }

  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

}

module.exports = Utils;
},{}],167:[function(require,module,exports){
const Weapon = require(171);

const BulletModel42mm = require(94);

class Weapon42mm extends Weapon {
  constructor(config) {
    config = Object.assign({
      maxAmmo: 5,
      shootRate: 1000,
      reloadTime: 5000,
      bulletType: BulletModel42mm
    }, config);
    super(config);
  }

}

module.exports = Weapon42mm;
},{}],168:[function(require,module,exports){
const Weapon = require(171);

const CannonBall = require(95);

class WeaponCannon extends Weapon {
  constructor(config) {
    config = Object.assign({
      maxAmmo: 5,
      shootRate: 2000,
      reloadTime: 7000,
      bulletType: CannonBall
    }, config);
    super(config);
    this.id = 2;
  }

}

module.exports = WeaponCannon;
},{}],169:[function(require,module,exports){
const Weapon = require(171);

const TankFireEffectModel = require(87);

const ServerTankEffect = require(127);

class Flamethrower extends Weapon {
  constructor(config) {
    config = Object.assign({
      damage: 10,
      radius: 90,
      angle: Math.PI / 3
    }, config);
    super(config);
    this.damage = config.damage;
    this.radius = config.radius;
    this.angle = config.angle;
    this.squareRadius = this.radius ** 2;
    this.fireEffect = new TankFireEffectModel();
    this.serverEffect = ServerTankEffect.fromModel(this.fireEffect, this.tank);
  }

  ready() {
    return true;
  }

  shoot() {
    const tank = this.tank; // const player = tank.player

    const pAngle = (tank.model.rotation + Math.PI) % (Math.PI * 2) - Math.PI;

    for (let p of tank.world.players.values()) {
      if (!p || p.tank === tank) continue;
      const anotherTank = p.tank;
      const x = anotherTank.model.x - tank.model.x;
      const y = anotherTank.model.y - tank.model.y;
      const dist = x ** 2 + y ** 2;
      if (dist > this.squareRadius) continue;
      let angle = Math.atan2(x, y) + pAngle;
      if (angle > Math.PI) angle -= Math.PI * 2;
      if (angle < -Math.PI) angle += Math.PI * 2;
      if (Math.abs(angle) >= this.angle / 2) continue; //const damage = (Math.sqrt(1 - dist / this.squareRadius)) * this.damage * tank.world.room.spt
      //p.tank.damage(damage, player.id)
    }
  }

  onEngage() {
    super.onEngage();
    this.tank.addEffect(this.serverEffect);
  }

  onDisengage() {
    super.onDisengage();
    this.tank.removeEffect(this.serverEffect);
  }

}

module.exports = Flamethrower;
},{}],170:[function(require,module,exports){
const Weapon = require(171);

const Bullet16mm = require(93);

class WeaponMachineGun extends Weapon {
  constructor(config) {
    config = Object.assign({
      maxAmmo: 50,
      shootRate: 100,
      reloadTime: 5000,
      bulletType: Bullet16mm
    }, config);
    super(config);
    this.state = 0;
    this.id = 4;
  }

  shoot() {
    let tank = this.tank;
    let position = tank.model.body.GetPosition();
    const shift = this.state === 0 ? -1.4 : 1.4;
    this.launchBullet(tank, position.x + tank.model.matrix.cos * shift - tank.model.matrix.sin * shift, position.y + tank.model.matrix.sin * shift + tank.model.matrix.cos * shift);
    this.state = 1 - this.state;
    this.popBullet();
  }

}

module.exports = WeaponMachineGun;
},{}],171:[function(require,module,exports){
const Box2D = require(99);

const Bullet42mmModel = require(94);

const ServerBullet = require(129);

class Weapon {
  /**
   * Indicates whether weapon is currently shooting
   * @type {boolean}
   */

  /**
   * Trigger axle. Weapon will shoot if its value is above 0.5
   * @type {Axle}
   */

  /**
   * Tanks that equipped with this weapon
   * @type {ServerTank}
   */
  constructor(config) {
    this.engaged = false;
    this.triggerAxle = null;
    this.tank = null;
    config = config || {};
    this.config = config;
    this.maxAmmo = config.maxAmmo || Infinity;
    this.shootRate = config.shootRate || 2000;
    this.reloadTime = config.reloadTime || 4000;
    this.bulletType = config.bulletType || Bullet42mmModel;
    this.tank = config.tank;
    this.triggerAxle = config.triggerAxle;
    this.ammo = this.maxAmmo;
    this.isReloading = false;
    this.shootingTime = null;
    this.engaged = false;
  }

  reload() {
    if (this.isReloading) return;
    this.isReloading = true;
    this.shootingTime = Date.now();
  }

  launchBullet(tank, x, y, rotation) {
    let sin, cos;

    if (rotation === undefined) {
      sin = tank.model.matrix.sin;
      cos = tank.model.matrix.cos;
      rotation = tank.model.body.GetAngle();
    } else {
      sin = Math.sin(rotation);
      cos = Math.cos(rotation);
    }

    const bullet = new this.bulletType();
    const entity = ServerBullet.fromModel(bullet);
    entity.shooter = tank.player;
    bullet.rotation = rotation;
    bullet.x = x;
    bullet.y = y;
    bullet.dx = -sin * entity.startVelocity;
    bullet.dy = cos * entity.startVelocity;
    tank.world.createEntity(entity);
    tank.model.body.ApplyImpulse(new Box2D.b2Vec2(-bullet.dx * entity.mass, -bullet.dy * entity.mass), new Box2D.b2Vec2(x, y));
  }

  tick() {
    if (!this.triggerAxle) return;

    if (this.tank.model.health <= 0) {
      if (this.engaged) {
        this.engaged = false;
        this.onDisengage();
      }
    } else if (this.triggerAxle.needsUpdate()) {
      let engaged = this.triggerAxle.getValue() > 0.5;

      if (engaged !== this.engaged) {
        this.engaged = engaged;

        if (engaged) {
          this.onEngage();
        } else {
          this.onDisengage();
        }
      }
    }

    if (this.engaged && this.ready()) {
      this.shoot();
    }
  }

  onEngage() {}

  onDisengage() {}

  shoot() {
    let position = this.tank.model.body.GetPosition();
    this.launchBullet(this.tank, position.x, position.y);
    this.popBullet();
  }

  popBullet() {
    this.ammo--;

    if (this.ammo === 0) {
      this.reload();
    } else {
      this.shootingTime = Date.now();
    }
  }

  ready() {
    if (!this.shootingTime) return true;
    const time = Date.now() - this.shootingTime;

    if (this.isReloading) {
      if (time >= this.reloadTime) {
        this.shootingTime = null;
        this.isReloading = false;
        this.ammo = this.maxAmmo;
        return true;
      } else return false;
    } else {
      return time >= this.shootRate;
    }
  }

  getId() {
    return this.id;
  }

}

module.exports = Weapon;
},{}]},{},[25]);
