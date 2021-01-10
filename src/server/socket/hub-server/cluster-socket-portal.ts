
import SocketPortal from '../socket-portal';
import ClusterHandshake from '../cluster-handshake';
import HandshakePacket from 'src/networking/packets/cluster-packets/handshake-packet';
import HandshakeSuccessPacket from 'src/networking/packets/cluster-packets/handshake-success-packet';
import RoomCreateRequestPacket from 'src/networking/packets/cluster-packets/room-creation-request-packet';
import RoomConfig from 'src/server/room/room-config';
import ClusterSocketPortalClient from './cluster-socket-portal-client';
import Chalk from 'chalk';
import {request} from "websocket";
import SocketPortalClient from "../socket-portal-client";
import BinaryPacket from "../../../networking/binarypacket";

class ClusterSocketPortal extends SocketPortal {

    static clientClass = ClusterSocketPortalClient

    password: string

    constructor() {
        super();

        this.logger.setPrefix("CLink hub")
    }

    handleRequest(request: request) {
        // Only handling /cluster-link requests

        if(request.resourceURL.path === "/cluster-link") {
            super.handleRequest(request);
        }
    }

    authorizeClient(client: SocketPortalClient) {
        let salt = ClusterHandshake.generateSalt()
        client.data.authorizationSalt = salt
        new HandshakePacket(new Uint8Array(salt)).sendTo(client.connection)
    }

    handleUnauthorizedPacket(packet: BinaryPacket, client: ClusterSocketPortalClient) {
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

    handleAuthorizationFail(client: ClusterSocketPortalClient) {
        this.logger.log(`§F00;Rejected connection from origin ${client.websocket.remoteAddress} due to failed handshake`)
        client.connection.close("Access denied")
        client.data.authorizationSalt = null
    }

    handleAuthorizationSuccess(client: ClusterSocketPortalClient) {
        this.logger.log(`The game server from origin ${client.websocket.remoteAddress} has been connected`)
        client.data.authorized = true

        new HandshakeSuccessPacket().sendTo(client.connection)

        let roomConfig = new RoomConfig()
        roomConfig.name = "test room"
        roomConfig.map = "trafalgara.map"

        new RoomCreateRequestPacket(roomConfig).sendTo(client.connection)
    }

    clientConnected(client: ClusterSocketPortalClient) {
        client.data.authorized = false

        this.authorizeClient(client)
    }

    clientDisconnected(client: ClusterSocketPortalClient) {

    }

    handleAuthorizedPacket(packet: BinaryPacket, client: ClusterSocketPortalClient) {

    }

    // noinspection JSCheckFunctionSignatures
    /**
     * Called when client sends packet
     * @param packet {BinaryPacket} Received packet
     * @param client {ClusterSocketPortalClient} Packet sender
     */

    handlePacket(packet: BinaryPacket, client: ClusterSocketPortalClient) {
        if (client.data.authorized) this.handleAuthorizedPacket(packet, client)
        else this.handleUnauthorizedPacket(packet, client)
    }
}

export default ClusterSocketPortal;