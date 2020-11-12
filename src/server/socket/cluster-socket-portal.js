
const SocketPortal = require("./socket-portal")
const ClusterHandshake = require("./cluster-handshake")
const HandshakePacket = require("../../networking/packets/cluster-packets/handshake-packet")
const Logger = require("../log/logger")
const Chalk = require("chalk")

class ClusterSocketPortal extends SocketPortal {

    /**
     * @type {string}
     */
    password

    constructor(config) {
        super(config);
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
        Logger.global.log(Chalk.redBright(`Rejected connection from origin ${client.websocket.remoteAddress} due to failed handshake`))
        client.connection.close("Access denied")
        client.data.authorizationSalt = null
    }

    handleAuthorizationSuccess(client) {
        Logger.global.log(`The game server from origin ${client.websocket.remoteAddress} has been connected`)
        client.data.authorized = true
    }

    clientConnected(client) {
        client.data.authorized = false

        this.authorizeClient(client)
    }

    clientDisconnected(client) {

    }

    handleAuthorizedPacket(packet, client) {

    }

    handlePacket(packet, client) {
        if (client.data.authorized) this.handleAuthorizedPacket(packet, client)
        else this.handleUnauthorizedPacket(packet, client)
    }
}

module.exports = ClusterSocketPortal