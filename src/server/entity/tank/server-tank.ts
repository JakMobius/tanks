
import TankModel from 'src/entity/tanks/tank-model';
import ServerTankEffect from "../../effects/tank/server-tank-effect";
import DamageReason from "../../damage-reason/damage-reason";
import ServerEntity from "../server-entity";
import AbstractEffect from "../../../effects/abstract-effect";
import ServerPlayer from "../../server-player";
import {Constructor} from "../../../serialization/binary/serializable";
import {EntityModelType} from "../../../entity/entity-model";
import PhysicalComponent from "../../../entity/physics-component";

export interface ServerTankConfig<ModelClass> {
    model: ModelClass
}

export type ServerTankType = Constructor<ServerTank> & {
    Model: Constructor<TankModel> & EntityModelType
}

export default class ServerTank<ModelClass extends TankModel = TankModel> extends ServerEntity<TankModel> {
    public static Model: EntityModelType & Constructor<TankModel> = null
    public static Tanks: ServerTankType[] = []

	public teleported: boolean;
	public health: number;
    public effects = new Map<number, AbstractEffect>()
    public player: ServerPlayer

    constructor(options: ServerTankConfig<ModelClass>) {
        super(options.model);

        this.teleported = false
    }

    addEffect(effect: ServerTankEffect): void {
        if(this.effects.has(effect.model.id)) {
            return
        }
        // TODO: Это криво
        effect.model.tankId = this.player.id
        this.effects.set(effect.model.id, effect)
        this.player.getWorld().addTankEffect(effect, this)
    }

    removeEffect(effect: ServerTankEffect): void {
        if(this.effects.delete(effect.model.id)) {
            this.player.getWorld().removeTankEffect(effect, this)
        }
    }

    teleport(x: number, y: number) {
        this.teleported = true
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