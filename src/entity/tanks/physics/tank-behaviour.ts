
import TankModel from '../tank-model';
import {Vec2} from "../../../library/box2d";

/**
 * Class which defines the physical behaviour of each specific type of tank (tracked, wheeled, etc.)
 */
export default class TankBehaviour {
	public tank: TankModel;

    protected localVector1 = new Vec2()
    protected localVector2 = new Vec2()
    protected localVector3 = new Vec2()
    protected localVector4 = new Vec2()

    constructor(tank: TankModel) {
        this.tank = tank
    }

    tick(dt: number): void {}
}