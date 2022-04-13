
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
import EffectHost from "../../../effects/effect-host";
import DamageSmokeEffect from "./damage-smoke-effect";

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

    constructor(config: TankConfig<ModelClass>) {
        super(config.model)
        this.engine = null

        this.model.getComponent(EffectHost).addEffect(new DamageSmokeEffect(this))
    }

    static register(tank: ClientTankType) {
	    ClientTank.Tanks.push(tank)
        ClientEntity.associate(tank, tank.Model)
    }
}