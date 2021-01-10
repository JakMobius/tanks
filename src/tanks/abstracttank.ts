
import TankModel from './tankmodel';
import GameWorld from 'src/gameworld';
import Player from 'src/utils/player';
import AbstractEffect from 'src/effects/abstract-effect';
import BinaryEncoder from 'src/serialization/binary/binaryencoder';
import BinaryDecoder from 'src/serialization/binary/binarydecoder';

interface AbstractTankConfig {
    world?: GameWorld
}

/**
 * Tank class, abstracted from code
 * execution side. Used both on server
 * and client side. Contains tank model
 * and side-specific data. (damage reason
 * array on server side, drawer on
 * client side)
 */

abstract class AbstractTank {
    static Types = new Map()

    // Player that owns this tank
    public player: Player = null
    public model: TankModel = null
    public world: GameWorld = null
    public effects = new Map<number, AbstractEffect>()

    protected constructor(options?: AbstractTankConfig) {
        if (options) {
            if (options.world) {
                this.world = options.world
            }
        }
    }

    static getModel(): typeof TankModel {
        return null
    }

    destroy(): void {
        this.model.destroy()
    }

    encodeDynamicData(encoder: BinaryEncoder): void {}
    decodeDynamicData(decoder: BinaryDecoder): void {}

    abstract tick(dt: number): void
}

export default AbstractTank;