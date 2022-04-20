
import AbstractPlayer, {PlayerConfig} from "../abstract-player";
import ServerTank from "./entity/tank/server-tank";
import BasicEventHandlerSet from "../utils/basic-event-handler-set";
import Entity from "../utils/ecs/entity";
import TransformComponent from "../entity/components/transform-component";
import PhysicalComponent from "../entity/components/physics-component";
import EntityDataTransmitComponent from "../entity/components/network/entity-data-transmit-component";
import EffectTransmitter from "../entity/components/network/effect/effect-transmitter";
import PositionTransmitterComponent from "../entity/components/network/position/position-transmitter-component";
import HealthTransmitterComponent from "../entity/components/network/health/health-transmitter-component";
import MapTransmitter from "../entity/components/network/map/map-transmitter";
import ServerGameWorld from "./server-game-world";

export default class ServerPlayer extends AbstractPlayer<ServerTank> {

}