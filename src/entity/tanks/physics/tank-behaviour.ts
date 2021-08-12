
import TankModel from '../tank-model';
import {Vec2} from "../../../library/box2d";

export interface TankBehaviourConfig {

    // The following parameters adjust the power curve of the tank engine

    /**
     * Engine power of the tank (in watts)
     */
    power?: number

    /**
     * Maximum force with which the engine will push the tank (in newtons)
     */
    maxTorque?: number
}

/**
 * Class which defines the physical behaviour of each specific type of tank (tracked, wheeled, etc.)
 */
export default class TankBehaviour {
	public power: number;
	public tank: TankModel;
    public maxTorque: number;

    protected localVector1 = new Vec2()
    protected localVector2 = new Vec2()
    protected localVector3 = new Vec2()
    protected localVector4 = new Vec2()

    constructor(tank: TankModel, config: TankBehaviourConfig) {

        this.power = config.power || 10000
        this.maxTorque = config.maxTorque || 1000000

        this.tank = tank
    }

    tick(dt: number): void {}
}