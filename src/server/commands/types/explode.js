
const Command = require("../command")
const WorldExplodeEffectModel = require("/src/effects/world/explode/worldexplodeeffectmodel")
const ServerWorldEffect = require("/src/server/effects/world/serverworldeffect")

class RoomCreateCommand extends Command {

    constructor(options) {
        super(options);

        this.defaultPower = 4
    }

    onPerform(args) {
        let logger = this.console.logger

        if(args.length < 2) {
            logger.log(this.getHelp())
            return
        }

        let x = Number(args[0])
        let y = Number(args[1])
        let power = args.length > 2 ? Number(args[2]) : this.defaultPower

        if(!Number.isFinite(x)) {
            logger.log("'" + args[0] + "' Не является допустимым числом")
            return
        }

        if(!Number.isFinite(y)) {
            logger.log("'" + args[1] + "' Не является допустимым числом")
            return
        }

        if(!Number.isFinite(power)) {
            logger.log("'" + args[2] + "' Не является допустимым числом")
            return
        }

        let world = this.console.observingRoom.world
        let effect = new WorldExplodeEffectModel({
            x: x,
            y: y,
            power: power
        })

        let serverEffect = ServerWorldEffect.fromModel(effect, world)
        world.addEffect(serverEffect)
    }

    getName() {
        return "explode"
    }

    getDescription() {
        return "Создать взрыв на координатах"
    }

    getUsage() {
        return `explode <x> <y> [power=${this.defaultPower}]`
    }

    requiresRoom() {
        return true
    }
}

module.exports = RoomCreateCommand