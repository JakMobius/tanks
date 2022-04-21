import TankModel from 'src/entity/tanks/tank-model';
import {Constructor} from "../../../serialization/binary/serializable";
import {EntityModelType} from "../../../entity/entity-model";
import Engine from "../../engine";
import ClientPlayer from "../../client-player";
import ClientEntity from "../client-entity";
import EffectHost from "../../../effects/effect-host";
import DamageSmokeEffect from "./damage-smoke-effect";

export interface TankConfig {
    model: TankModel
}

export type ClientTankType = Constructor<ClientTank> & {
    Model: Constructor<TankModel> & EntityModelType
}

export default class ClientTank extends ClientEntity {
    public static Model: EntityModelType & Constructor<TankModel> = null

	public engine: Engine;
	public player: ClientPlayer

    constructor(config: TankConfig) {
        super(config.model)
        this.engine = null

        this.model.getComponent(EffectHost).addEffect(new DamageSmokeEffect())
    }
}