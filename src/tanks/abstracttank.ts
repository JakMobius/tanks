
import TankModel from './tankmodel';

/**
 * Tank class, abstracted from code
 * execution side. Used both on server
 * and client side. Contains tank model
 * and side-specific data. (damage reason
 * array on server side, drawer on
 * client side)
 */

class AbstractTank {
    static Types = new Map()

    /**
     * Player that owns this tank
     * @type Player
     */
    player = null

    /**
     * Generic model of this tank
     * @type {TankModel}
     */
    model = null

    /**
     * @type {GameWorld}
     */
    world = null

    /**
     * @type {Map<number, AbstractEffect>}
     */
    effects = new Map()

    /**
     * @param {Object | null} options
     * @param {GameWorld | null} options.world
     */

    constructor(options) {
        if(options) {
            if(options.world) {
                this.world = options.world
            }
        }
    }

    /**
     * @returns {Class<TankModel>}
     */
    static getModel() {}

    destroy() {
        this.model.destroy()
    }

    encodeDynamicData() {}
    decodeDynamicData() {}

    create() {}
    tick(dt) {}
}


export default AbstractTank;