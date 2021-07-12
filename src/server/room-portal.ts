import SocketPortalClient from "./socket/socket-portal-client";
import TypedEventHandler from "../utils/typed-event-handler";
import BinaryPacket from "../networking/binarypacket";

export default class RoomPortal extends TypedEventHandler<[SocketPortalClient]> {
    /// Map of clients, connected to this portal.
    clients = new Map<Number, SocketPortalClient>()

    clientConnected(client: SocketPortalClient) {
        this.clients.set(client.id, client)
        this.emit("client-connect", client)
    }

    clientDisconnected(client: SocketPortalClient) {
        this.clients.delete(client.id)
        this.emit("client-disconnect", client)
    }

    broadcast(packet: BinaryPacket) {

    }
}