import Command, {CommandConfig} from '../command';
import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ServerWorldEffect from 'src/server/effects/world/server-world-effect';

class ExplodeCommand extends Command {
	public defaultPower: number;

    constructor(options?: CommandConfig) {
        super(options);

        this.defaultPower = 4
    }

    onPerform(args: string[]): void {
        let logger = this.console.logger

        if(args.length < 2) {
            logger.log(this.getHelp())
            return
        }

        let x = Number(args[0])
        let y = Number(args[1])
        let power = args.length > 2 ? Number(args[2]) : this.defaultPower

        if(!Number.isFinite(x)) {
            logger.log("'" + args[0] + "' is not a number")
            return
        }

        if(!Number.isFinite(y)) {
            logger.log("'" + args[1] + "' is not a number")
            return
        }

        if(!Number.isFinite(power)) {
            logger.log("'" + args[2] + "' is not a number")
            return
        }

        let world = this.console.observingRoom.world
        let effect = new WorldExplodeEffectModel({
            x: x,
            y: y,
            power: power
        })

        let serverEffect = ServerWorldEffect.fromModelAndWorld(effect, world)
        world.addEffect(serverEffect)
    }

    getName() {
        return "explode"
    }

    getDescription() {
        return "Expode map point"
    }

    getUsage() {
        return `explode <x> <y> [power=${this.defaultPower}]`
    }

    requiresRoom() {
        return true
    }
}

export default ExplodeCommand;