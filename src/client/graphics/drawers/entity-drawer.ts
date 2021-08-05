import ClientEntity from "../../entity/client-entity";
import DrawPhase from "./draw-phase";

export default class EntityDrawer<EntityClass extends ClientEntity = ClientEntity> {
	public entity: EntityClass;
    public enabled: boolean = true

    constructor(entity: EntityClass) {
        this.entity = entity
    }

    /**
     * Draws the specified entity.
     */
    draw(phase: DrawPhase) {}
}