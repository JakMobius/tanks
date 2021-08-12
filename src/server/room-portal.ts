
import TypedEventHandler from "../utils/typed-event-handler";
import BinaryPacket from "../networking/binary-packet";
import {GameSocketPortalClient} from "./socket/game-server/game-socket-portal";
import {BinarySerializer} from "../serialization/binary/serializable";

export default class RoomPortal extends TypedEventHandler<[GameSocketPortalClient]> {
    /// Map of clients, connected to this portal.
    clients = new Map<Number, GameSocketPortalClient>()
    packetHandlers = new Map<Number, (packet: BinaryPacket) => void>()

    constructor() {
        super();
    }

    clientConnected(client: GameSocketPortalClient) {
        this.setupPacketHandling(client)
        this.clients.set(client.id, client)
        this.emit("client-connect", client)
    }

    clientDisconnected(client: GameSocketPortalClient) {
        this.resetPacketHandling(client)
        this.clients.delete(client.id)
        this.emit("client-disconnect", client)
    }

    private setupPacketHandling(client: GameSocketPortalClient) {
        const handler = (packet: BinaryPacket) => {
            this.emit(packet, client)
        }

        this.packetHandlers.set(client.id, handler)
        client.connection.on("incoming-packet", handler)
    }

    private resetPacketHandling(client: GameSocketPortalClient) {
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