
import EntityModel from "../../entity/entity-model";
import ServerEntityDataTransmitComponent from "./server-entity-data-transmit-component";
import WorldExplodeEffectModel from "../../effects/models/world-explode-effect-model";
import ServerEffect from "../effects/server-effect";
import EffectHostComponent from "../../effects/effect-host-component";
import GameWorld from "../../game-world";
import PhysicalComponent from "../../entity/components/physics-component";
import ExplodeOnDeathComponent from "../../entity/components/explode-on-death-component";

export default class ServerEntityPrefabs {
    static types = new Map<number, (model: EntityModel) => void>()

    static setupEntity(model: EntityModel) {
        model.addComponent(new ServerEntityDataTransmitComponent())
    }
}