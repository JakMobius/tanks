import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerRespawnEvent from "src/events/player-respawn-event";

export default class PlayerRespawnActionComponent implements Component {
    entity: Entity | null = null;

    performRespawnAction() {
        this.entity.emit("respawn", new PlayerRespawnEvent(this.entity))
    }

    onAttach(entity: Entity): void {
        this.entity = entity;
        this.entity.getComponent(PlayerWorldComponent).redirectPlayerEventToWorld("respawn", "player-respawn")
    }

    onDetach(): void {
        this.entity = null
    }
}