import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import {GameSocketPortalClient} from "../../socket/game-server/game-socket-portal";
import RoomLoopComponent from "./room-loop-component";
import RoomClientComponent from "./room-client-component";

export default class EmptyServerPauseComponent implements Component {
    entity: Entity | null;

    roomEventHandler = new BasicEventHandlerSet()

    constructor() {
        this.roomEventHandler.on("client-connect",     (client) => this.onClientConnected(client))
        this.roomEventHandler.on("client-disconnect",  (client) => this.onClientDisconnected(client))
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.roomEventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
    }

    private onClientConnected(client: GameSocketPortalClient) {
        let loopComponent = this.entity.getComponent(RoomLoopComponent)
        if (!loopComponent.loop.running) {
            loopComponent.loop.start()
        }
    }

    private onClientDisconnected(client: GameSocketPortalClient) {
        let clientComponent = this.entity.getComponent(RoomClientComponent)

        // TODO: check this code. Not sure if portal.clients is updated prior to this event being emitted
        if(clientComponent.portal.clients.size) {
            return
        }

        let loopComponent = this.entity.getComponent(RoomLoopComponent)
        if (!loopComponent.loop.running) {
            loopComponent.loop.start()
        }
    }
}