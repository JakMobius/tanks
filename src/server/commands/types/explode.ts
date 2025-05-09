import Command from '../command';
import Entity from "src/utils/ecs/entity";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import ExplodeEffectPrefab from "src/entity/types/effect-world-explosion/server-prefab";

export default class ExplodeCommand extends Command {
    public defaultPower = 4

    onPerform(args: string[]) {
        let logger = this.console.logger

        if (args.length < 2) {
            logger.log(this.getHelp())
            return false
        }

        let x = Number(args[0])
        let y = Number(args[1])
        let power = args.length > 2 ? Number(args[2]) : this.defaultPower

        if (!Number.isFinite(x)) {
            logger.log("'" + args[0] + "' is not a number")
            return false
        }

        if (!Number.isFinite(y)) {
            logger.log("'" + args[1] + "' is not a number")
            return false
        }

        if (!Number.isFinite(power)) {
            logger.log("'" + args[2] + "' is not a number")
            return false
        }

        let world = this.console.observingRoom

        let explodeEntity = new Entity()
        ExplodeEffectPrefab.prefab(explodeEntity)
        world.appendChild(explodeEntity)
        explodeEntity.getComponent(ExplodeComponent).explode(x, y, power)
        explodeEntity.removeFromParent()
        
        return true
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