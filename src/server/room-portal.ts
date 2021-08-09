
import TypedEventHandler from "../utils/typed-event-handler";
import BinaryPacket from "../networking/binary-packet";
import {GameSocketPortalClient} from "./socket/game-server/game-socket-portal";
import {BinarySerializer} from "../serialization/binary/serializable";

export default class RoomPortal extends TypedEventHandler<[GameSocketPortalClient]> {
    /// Map of clients, connected to this portal.
    clients = new Map<Number, GameSocketPortalClient>()

    clientConnected(client: GameSocketPortalClient) {
        this.clients.set(client.id, client)
        this.emit("client-connect", client)
    }

    clientDisconnected(client: GameSocketPortalClient) {
        this.clients.delete(client.id)
        this.emit("client-disconnect", client)
    }

    broadcast(packet: BinaryPacket) {
        if(packet.shouldSend())
            for(let client of this.clients.values()) {
                client.connection.send(packet)
            }
    }

    receiveClientData(client: GameSocketPortalClient, data: ArrayBuffer) {
        let decoder = BinaryPacket.binaryDecoder
        decoder.reset()
        decoder.readData(data)
        this.receiveClientPacket(client, BinarySerializer.deserialize(decoder, BinaryPacket))
    }

    receiveClientPacket(client: GameSocketPortalClient, packet: BinaryPacket) {
        this.emit(packet, client)
    }
}