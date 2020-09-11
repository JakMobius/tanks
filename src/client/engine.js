

class Engine {
    constructor(config) {
        this.config = config
    }

    configure(game, tank) {
        this.game = game
        this.tank = tank
        this.sound = this.game.playSound(this.config.sound, {
            loop: true,
            mapX: tank.x,
            mapY: tank.y
        })
        this.rpm = 1
        this.gear = 0

        this.const = {
            multiplier: this.config.multiplier || 11,
            gears: this.config.gears || [{gearing: 1}],
            gearUpRPM: this.config.gearUpRPM || 2.1,
            gearDownRPM: this.config.gearDownRPM || 1.9,
            pitch: this.config.pitch || 1,
            volume: this.config.volume || 1
        }
    }

    clone() {
        return new Engine(this.config)
    }

    destroy() {
        if(this.sound) this.sound.stop()
    }

    tick() {
        return
        if(this.game) {
            if(this.sound) {
                this.sound.config.mapX = this.tank.x
                this.sound.config.mapY = this.tank.y
            }
            if(this.tank.model.health === 0) {
                this.destinationRPM = 0
                this.sound.gainNode.value
            } else {
                const tankSpeed = this.tank.options.transmissionSpeed * this.game.tps;

                const rpm = tankSpeed / this.const.multiplier;

                const currentGear = this.const.gears[this.gear];
                const nextGear = this.const.gears[this.gear + 1];
                const previousGear = this.const.gears[this.gear - 1];

                const currentRPM = rpm * currentGear.gearing;

                if(previousGear && currentRPM < currentGear.low) {
                    this.gear--
                }
                if(nextGear && currentRPM > currentGear.high) {
                    this.gear++
                }

                const minRPM = 1 - this.tank.options.clutch / 6;

                this.destinationRPM = (Math.max(minRPM, rpm) * this.const.gears[this.gear].gearing) * this.tank.options.clutch + (1 - this.tank.options.clutch)
            }

            if(this.destinationRPM < this.rpm) {
                this.rpm -= 0.1
                if(this.destinationRPM > this.rpm) {
                    this.rpm = this.destinationRPM
                }
            } else if(this.destinationRPM > this.rpm) {
                this.rpm += 0.05
                if(this.destinationRPM < this.rpm) {
                    this.rpm = this.destinationRPM
                }
            }

            if(this.sound) {
                this.sound.source.playbackRate.value = this.rpm * this.const.pitch
                let volume = 0.3 + this.tank.options.clutch / 4;
                if(this.rpm < 0.7) {
                    volume *= (this.rpm - 0.2) * 2
                }
                this.sound.config.volume = volume * this.const.volume
                this.game.updateSoundPosition(this.sound)
            }
        }
    }
}

module.exports = Engine
