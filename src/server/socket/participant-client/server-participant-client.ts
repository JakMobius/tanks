
import ServerWebSocketClient from '../server-web-socket-client';
import HandshakePacket from '@/networking/packets/cluster-packets/handshake-packet';
import HandshakeSuccessPacket from '@/networking/packets/cluster-packets/handshake-success-packet';
import RoomCreateRequestPacket from '@/networking/packets/cluster-packets/room-creation-request-packet';
import Logger from '@/server/log/logger';
import ClusterHandshake from '../cluster-handshake';
import ServerParticipantConnection from './server-participant-connection';

class ServerParticipantClient extends ServerWebSocketClient {

    /**
     * @type {string}
     */
    password

    /**
     * @type {boolean}
     */
    reconnect = false

    constructor(config) {
        super(config)

        this.logger.setPrefix("CLink Client")

        this.on(HandshakePacket, (packet) => {
            this.logger.log("Performing handshake")
            let salt = packet.handshakeData
            ClusterHandshake.createKey(this.password, salt, (error, key) => {

                if(error) {
                    // Something went wrong

                    this.connection.close("Failed to generate handshake key: " + error)
                } else {
                    // Sending back the generated handshake key
                    packet.handshakeData = new Uint8Array(key)
                    packet.sendTo(this.connection)
                }
            })
        })

        this.on(HandshakeSuccessPacket, () => {
            this.onOpen()
        })

        this.on(RoomCreateRequestPacket, (packet) => {
            Logger.global.log("Received room creation request: " + JSON.stringify(packet.config))
        })

        this.on("close", (code, reason) => {
            this.logger.log("§F77;Connection to hub was closed: " + reason)

            this.reconnectDelayed()
        })

        this.on("error", (error) => {
            this.logger.log("§F77;Failed to connect to hub: " + error)

            this.reconnectDelayed()
        })
    }

    connectToServer() {
        this.logger.log("Connecting to hub at §77F;" + this.config.ip)
        super.connectToServer()
    }

    onConnection() {
        this.logger.log("Answer received, waiting for handshake request")
    }

    onOpen() {
        super.onOpen();
        this.logger.log("§7F7;Successfully connected to the hub")
    }

    createConnection() {
        return new ServerParticipantConnection(this)
    }

    reconnectDelayed() {
        if(!this.reconnect) return
        this.webSocketConnection = null
        this.client = null

        setTimeout(() => {
            if(this.reconnect) this.connectToServer()
        }, this.reconnectionDelay);
    }

    isConnecting() {
        // Since we don't want to drop packets,
        // cluster client is always available to
        // enqueue them.
        return true
    }

    disconnect(reason?) {
        this.reconnect = false
        super.disconnect(reason)
    }
}

export default ServerParticipantClient;