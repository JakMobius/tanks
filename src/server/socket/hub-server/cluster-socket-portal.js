
const SocketPortal = require("../socket-portal")
const ClusterHandshake = require("../cluster-handshake")
const HandshakePacket = require("/src/networking/packets/cluster-packets/handshake-packet")
const HandshakeSuccessPacket = require("/src/networking/packets/cluster-packets/handshake-success-packet")
const RoomCreateRequestPacket = require("/src/networking/packets/cluster-packets/room-creation-request-packet")
const RoomConfig = require("/src/server/room/room-config")
const ClusterSocketPortalClient = require("./cluster-socket-portal-client")
const Chalk = require("chalk")

class ClusterSocketPortal extends SocketPortal {

    static clientClass = ClusterSocketPortalClient

    /**
     * @type {string}
     */
    password

    constructor(config) {
        super(config);

        this.logger.setPrefix("CLink hub")
    }

    handleRequest(request) {
        // Only handling /cluster-link requests

        if(request.resourceURL.path === "/cluster-link") {
            super.handleRequest(request);
        }
    }

    authorizeClient(client) {
        let salt = ClusterHandshake.generateSalt()
        client.data.authorizationSalt = salt
        new HandshakePacket(new Int8Array(salt)).sendTo(client.connection)
    }

    handleUnauthorizedPacket(packet, client) {
        if(!client.data.authorizationSalt) {
            // Prevent duplicating authorization packets
            return
        }

        if(packet instanceof HandshakePacket) {
            let response = packet.handshakeData

            let salt = client.data.authorizationSalt

            ClusterHandshake.checkKey(this.password, salt, response, (success) => {
                if(success) this.handleAuthorizationSuccess(client)
                else this.handleAuthorizationFail(client)
            })

        } else {
            this.handleAuthorizationFail(client)
        }
    }

    handleAuthorizationFail(client) {
        this.logger.log(Chalk.redBright(`Rejected connection from origin ${client.websocket.remoteAddress} due to failed handshake`))
        client.connection.close("Access denied")
        client.data.authorizationSalt = null
    }

    handleAuthorizationSuccess(client) {
        this.logger.log(`The game server from origin ${client.websocket.remoteAddress} has been connected`)
        client.data.authorized = true

        new HandshakeSuccessPacket().sendTo(client.connection)

        let roomConfig = new RoomConfig()
        roomConfig.name = "test room"
        roomConfig.map = "trafalgara.map"

        new RoomCreateRequestPacket(roomConfig).sendTo(client.connection)
    }

    clientConnected(client) {
        client.data.authorized = false

        this.authorizeClient(client)
    }

    clientDisconnected(client) {

    }

    handleAuthorizedPacket(packet, client) {

    }

    // noinspection JSCheckFunctionSignatures
    /**
     * Called when client sends packet
     * @param packet {BinaryPacket} Received packet
     * @param client {ClusterSocketPortalClient} Packet sender
     */

    handlePacket(packet, client) {
        if (client.data.authorized) this.handleAuthorizedPacket(packet, client)
        else this.handleUnauthorizedPacket(packet, client)
    }
}

module.exports = ClusterSocketPortal