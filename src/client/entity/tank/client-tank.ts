
import TankModel from 'src/entity/tanks/tank-model';
import {TankStat} from "./tank-stat";
import {Constructor} from "../../../serialization/binary/serializable";
import TankDrawer from "../../graphics/drawers/tank-drawer";
import {EntityModelType} from "../../../entity/entity-model";
import Engine from "../../engine";
import ClientPlayer from "../../client-player";
import ClientTankEffect from "../../effects/tank/client-tank-effect";
import ClientEntity from "../client-entity";
import SmokeParticle from "../../particles/smoke-particle";
import Color from "../../../utils/color";
import PhysicalComponent from "../../../entity/physics-component";
import TransformComponent from "../../../entity/transform-component";

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

    constructor(config: TankConfig<ModelClass>) {
        super(config.model)
        this.engine = null
    }

    tick(dt: number) {
        super.tick(dt)
        const transform = this.model.getComponent(TransformComponent).transform

        if(this.model.health < 7) {
            this.timeSinceLastSmoke += dt

            const currentSmokeTime = (0.7 + this.model.health / 7) / 5
            if(this.timeSinceLastSmoke > currentSmokeTime) {

                const gray = this.model.health / 7 * 255

                const color = new Color(gray, gray, gray)

                const position = this.model.getComponent(PhysicalComponent).getBody().GetPosition()
                const velocityX = transform.transformX(0, -2, 0)
                const velocityY = transform.transformY(0, -2, 0)

                const smoke = new SmokeParticle({
                    x: position.x,
                    y: position.y,
                    dx: (velocityX + Math.random() - 0.5) * 5,
                    dy: (velocityY + Math.random() - 0.5) * 5,
                    scaling: 2.5,
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