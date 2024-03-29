import Command, {CommandConfig} from '../command';
import WorldExplodeEffectModel from 'src/effects/models/world-explode-effect-model';
import ServerEffect from "src/server/effects/server-effect";
import EffectHostComponent from "src/effects/effect-host-component";

export default class ExplodeCommand extends Command {
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

        let world = this.console.observingRoom
        let effect = new WorldExplodeEffectModel({
            x: x,
            y: y,
            power: power
        })

        let serverEffect = ServerEffect.fromModel(effect)
        world.getComponent(EffectHostComponent).addEffect(serverEffect)
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