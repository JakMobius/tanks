
import TankModel from 'src/entity/tanks/tank-model';
import {TankStat} from "./tank-stat";
import {Constructor} from "../../../serialization/binary/serializable";
import TankDrawer from "../../graphics/drawers/tank-drawer";
import {EntityModelType} from "../../../entity/entity-model";
import Engine from "../../engine";
import ClientPlayer from "../../client-player";
import ClientTankEffect from "../../effects/tank/client-tank-effect";
import ClientEntity from "../client-entity";
import Smoke from "../../particles/smoke";
import Color from "../../../utils/color";

export interface TankConfig<ModelClass extends TankModel> {
    model: ModelClass
}

export type ClientTankType = Constructor<ClientTank> & {
    getDrawer(): Constructor<TankDrawer>
    getName(): string
    getDescription(): string
    getStats(): TankStat
    Model: Constructor<TankModel> & EntityModelType
}

export default class ClientTank<ModelClass extends TankModel = TankModel> extends ClientEntity<ModelClass> {
    public static Model: EntityModelType & Constructor<TankModel> = null
    public static Tanks: ClientTankType[] = []

	public engine: Engine;
	public player: ClientPlayer
    public timeSinceLastSmoke = 0

    effects = new Map<number, ClientTankEffect>()

    constructor(config: TankConfig<ModelClass>) {
        super(config.model)
        this.engine = null
    }

    destroy(): void {
        this.model.destroyPhysics()
    }

    tick(dt: number) {
        super.tick(dt)
        for(let effect of this.effects.values()) {
            effect.tick(dt)
        }

        if(this.model.health < 7) {
            this.timeSinceLastSmoke += dt

            const currentSmokeTime = (0.7 + this.model.health / 7) / 5
            if(this.timeSinceLastSmoke > currentSmokeTime) {

                const gray = this.model.health / 7 * 255

                const color = new Color(gray, gray, gray)

                const position = this.model.getBody().GetPosition()
                const velocityX = this.model.matrix.transformX(0, -5, 0)
                const velocityY = this.model.matrix.transformY(0, -5, 0)

                const smoke = new Smoke({
                    x: position.x,
                    y: position.y,
                    dx: (velocityX + Math.random() - 0.5) * 10,
                    dy: (velocityY + Math.random() - 0.5) * 10,
                    scaling: 10,
                    color: color
                })

                this.getWorld().particles.push(smoke)

                this.timeSinceLastSmoke -= currentSmokeTime
            }
        } else {
            this.timeSinceLastSmoke = 0
        }
    }

    static register(tank: ClientTankType) {
	    ClientTank.Tanks.push(tank)
        ClientEntity.associate(tank, tank.Model)
    }
}