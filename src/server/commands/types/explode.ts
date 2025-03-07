import Command, {CommandConfig} from '../command';
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import Entity from "src/utils/ecs/entity";
import {EntityType} from "src/entity/entity-type";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import WorldTilemapComponent from 'src/physics/world-tilemap-component';

export default class ExplodeCommand extends Command {
    public defaultPower: number;

    constructor(options?: CommandConfig) {
        super(options);

        this.defaultPower = 4
    }

    onPerform(args: string[]): void {
        let logger = this.console.logger

        if (args.length < 2) {
            logger.log(this.getHelp())
            return
        }

        let x = Number(args[0])
        let y = Number(args[1])
        let power = args.length > 2 ? Number(args[2]) : this.defaultPower

        if (!Number.isFinite(x)) {
            logger.log("'" + args[0] + "' is not a number")
            return
        }

        if (!Number.isFinite(y)) {
            logger.log("'" + args[1] + "' is not a number")
            return
        }

        if (!Number.isFinite(power)) {
            logger.log("'" + args[2] + "' is not a number")
            return
        }

        let world = this.console.observingRoom

        let explodeEntity = new Entity()
        ServerEntityPrefabs.types.get(EntityType.EFFECT_WORLD_EXPLOSION)(explodeEntity)
        world.getComponent(WorldTilemapComponent).map.appendChild(explodeEntity)
        explodeEntity.getComponent(ExplodeComponent).explode(x, y, power)
        explodeEntity.removeFromParent()
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