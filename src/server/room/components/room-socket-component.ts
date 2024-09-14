import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import GameSocketPortal from "src/server/socket/game-server/game-socket-portal";

export default class RoomSocketComponent implements Component {
    entity: Entity | null;
    socket: GameSocketPortal

    constructor(socket: GameSocketPortal) {
        this.socket = socket
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}