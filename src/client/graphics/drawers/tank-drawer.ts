import EntityDrawer from "./entity-drawer";
import ClientTank from "../../entity/tank/client-tank";

export default class TankDrawer<TankClass extends ClientTank = ClientTank> extends EntityDrawer<TankClass> {
    ctx: WebGLRenderingContextBase = null

    constructor(tank: TankClass, ctx: WebGLRenderingContext) {
        super(tank)
        this.ctx = ctx
    }
}