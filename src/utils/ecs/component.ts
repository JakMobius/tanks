import Entity from "./entity";

export interface Component {
    entity?: Entity | null

    onAttach(entity: Entity): void;
    onDetach(): void;
}