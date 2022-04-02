import Entity from "./entity";

export class Component {
    entity?: Entity | null

    onAttach(entity: Entity) {
        this.entity = entity;
    };

    onDetach() {
        this.entity = null
    };
}