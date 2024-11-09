import {GameSocketPortalClient} from "src/server/socket/game-server/game-socket-portal";
import RoomLoopComponent from "./room-loop-component";
import RoomClientComponent from "./room-client-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class EmptyServerPauseComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("client-connect",     (client) => this.onClientConnected(client))
        this.eventHandler.on("client-disconnect",  (client) => this.onClientDisconnected(client))
    }

    private onClientConnected(client: GameSocketPortalClient) {
        let loopComponent = this.entity.getComponent(RoomLoopComponent)
        if (!loopComponent.loop.running) {
            loopComponent.loop.start()
        }
    }

    private onClientDisconnected(client: GameSocketPortalClient) {
        let clientComponent = this.entity.getComponent(RoomClientComponent)

        // TODO: check this code. Not sure if portal.clients is updated prior to this event
        if(clientComponent.portal.clients.size) {
            return
        }

        let loopComponent = this.entity.getComponent(RoomLoopComponent)
        if (!loopComponent.loop.running) {
            loopComponent.loop.start()
        }
    }
}