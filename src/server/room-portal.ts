import TypedEventHandler from "../utils/typed-event-handler";
import BinaryPacket from "../networking/binary-packet";
import SocketPortalClient from "./socket/socket-portal-client";

export default class RoomPortal extends TypedEventHandler<[SocketPortalClient]> {
    clients = new Map<Number, SocketPortalClient>()
    packetHandlers = new Map<Number, (packet: BinaryPacket) => void>()

    clientConnected(client: SocketPortalClient) {
        this.setupPacketHandling(client)
        this.clients.set(client.id, client)
        client.emit("connect")
        this.emit("client-connect", client)
    }

    clientDisconnected(client: SocketPortalClient) {
        this.resetPacketHandling(client)
        this.clients.delete(client.id)
        this.emit("client-disconnect", client)
    }

    private setupPacketHandling(client: SocketPortalClient) {
        const handler = (packet: BinaryPacket) => {
            this.emit(packet, client)
        }

        this.packetHandlers.set(client.id, handler)
        client.connection.on("incoming-packet", handler)
    }

    private resetPacketHandling(client: SocketPortalClient) {
        const handler = this.packetHandlers.get(client.id)
        this.packetHandlers.delete(client.id)
        client.connection.off("incoming-packet", handler)
    }

    broadcast(packet: BinaryPacket) {
        if(packet.shouldSend())
            for(let client of this.clients.values()) {
                client.connection.sendOutgoingPacket(packet)
            }
    }
}