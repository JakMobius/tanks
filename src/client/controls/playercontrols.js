
const Axle = require("../../tanks/controls/axle")
const EventEmitter = require("../../utils/eventemitter")

class PlayerControls extends EventEmitter {
    constructor() {
        super()

        this.axles = new Map()
        this.createAxle("tank-throttle")
        this.createAxle("tank-steer")
        this.createAxle("tank-primary-weapon")
        this.createAxle("tank-miner")

        this.createAxle("tank-respawn")

        this.respawning = true
    }

    createAxle(name) {
        this.axles.set(name, new Axle())
    }

    connectTankControls(controls) {
        controls.axles.get("y").addSource(this.axles.get("tank-throttle"))
        controls.axles.get("x").addSource(this.axles.get("tank-steer"))
        controls.axles.get("primary-weapon").addSource(this.axles.get("tank-primary-weapon"))
        controls.axles.get("miner").addSource(this.axles.get("tank-miner"))
    }

    disconnectTankControls() {
        this.axles.get("tank-throttle").disconnectAll()
        this.axles.get("tank-steer").disconnectAll()
        this.axles.get("tank-primary-weapon").disconnectAll()
        this.axles.get("tank-miner").disconnectAll()
    }

    setupGamepad(gamepad) {
        this.axles.get("tank-throttle")      .addSource(gamepad.getAxle(1).invert())
        this.axles.get("tank-steer")         .addSource(gamepad.getAxle(2))
        this.axles.get("tank-miner")         .addSource(gamepad.getButton(4))
        this.axles.get("tank-primary-weapon").addSource(gamepad.getButton(5))
        this.axles.get("tank-respawn")       .addSource(gamepad.getButton(2))
    }

    setupKeyboard(keyboard) {
        this.axles.get("tank-throttle")
            .addSource(keyboard.getKeyAxle("KeyW")     .smooth())
            .addSource(keyboard.getKeyAxle("ArrowUp")  .smooth())
            .addSource(keyboard.getKeyAxle("KeyS")     .smooth().reverse())
            .addSource(keyboard.getKeyAxle("ArrowDown").smooth().reverse())

        this.axles.get("tank-steer")
            .addSource(keyboard.getKeyAxle("KeyD")      .smooth())
            .addSource(keyboard.getKeyAxle("ArrowRight").smooth())
            .addSource(keyboard.getKeyAxle("KeyA")      .smooth().reverse())
            .addSource(keyboard.getKeyAxle("ArrowLeft") .smooth().reverse())

        this.axles.get("tank-miner")         .addSource(keyboard.getKeyAxle("KeyQ"))
        this.axles.get("tank-primary-weapon").addSource(keyboard.getKeyAxle("Space"))
        this.axles.get("tank-respawn")       .addSource(keyboard.getKeyAxle("KeyR"))
    }

    refresh() {
        if(this.axles.get("tank-respawn").getValue() > 0.5) {
            if(!this.respawning) {
                this.respawning = true
                this.emit("respawn")
            }
        } else {
            this.respawning = false
        }
    }
}

module.exports = PlayerControls