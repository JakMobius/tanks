import TankModel from 'src/entity/tanks/tank-model';
import ServerEntity from "../server-entity";
import ServerPlayer from "../../server-player";
import {Constructor} from "../../../serialization/binary/serializable";
import {EntityModelType} from "../../../entity/entity-model";
import PhysicalComponent from "../../../entity/components/physics-component";

export interface ServerTankConfig {
    model: TankModel
}

export type ServerTankType = Constructor<ServerTank> & {
    Model: Constructor<TankModel> & EntityModelType
}

export default class ServerTank extends ServerEntity {
    public static Model: EntityModelType & Constructor<TankModel> = null
    public static Tanks: ServerTankType[] = []

    public player: ServerPlayer

    constructor(options: ServerTankConfig) {
        super(options.model);
    }

    teleport(x: number, y: number) {
        this.model.getComponent(PhysicalComponent).getBody().SetPositionXY(x, y)
    }

    setVelocity(x: number, y: number) {
        const body = this.model.getComponent(PhysicalComponent).getBody()
        const velocity = body.GetLinearVelocity()
        velocity.Set(x, y)
        body.SetLinearVelocity(velocity)
    }

    static register(tank: ServerTankType) {
        ServerTank.Tanks.push(tank)
        ServerEntity.associate(tank, tank.Model)
    }
}