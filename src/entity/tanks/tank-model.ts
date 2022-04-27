
import EntityModel from "../entity-model";
import TankControls from "../../controls/tank-controls";
import Entity from "../../utils/ecs/entity";

export default class TankModel {
    static Types = new Map();

    static initializeEntity(entity: Entity) {
        EntityModel.initializeEntity(entity)

        entity.addComponent(new TankControls())
    }
}
