import PipedConnection from "../../../networking/piped-connection";
import BinaryPacket from "../../../networking/binary-packet";
import HandshakePacket from "../../../networking/packets/cluster-packets/handshake-packet";
import ClusterHandshake from "../cluster-handshake";
import HandshakeSuccessPacket from "../../../networking/packets/cluster-packets/handshake-success-packet";

export default class ClusterHandshakeConnection extends PipedConnection {

    private performingHandshake: boolean = true;
    private readonly password: string;

    constructor(password: string) {
        super()
        this.password = password
    }

    handleIncomingPacket(packet: BinaryPacket) {
        if(this.performingHandshake) {
            if (packet instanceof HandshakePacket) {
                let salt = packet.handshakeData
                ClusterHandshake.createKey(this.password, salt, (error, key) => {
                    if (error) {
                        // Something went wrong
                        this.emit("error", new Error("Failed to generate handshake key: " + error))
                    } else {
                        // Sending back the generated handshake key
                        packet.handshakeData = new Uint8Array(key)
                        this.handleOutgoingData(packet.getData())
                    }
                })
            } else if (packet instanceof HandshakeSuccessPacket) {
                this.performingHandshake = false
                this.onReady()
            }
        } else {
            super.handleIncomingPacket(packet);
        }
    }

    handleOutgoingData(data: ArrayBuffer) {
        super.handleOutgoingData(data);
    }

    isReady(): boolean {
        return !this.performingHandshake
    }
}
