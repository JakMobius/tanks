
import AbstractConnection from '../networking/abstract-connection';
import WebSocket from 'websocket';
const WebSocketConnection = WebSocket.connection
import Logger from './log/logger';
import BinaryPacket from "../networking/binarypacket";

class WebsocketConnection extends AbstractConnection {

    websocket: WebSocket.connection = null

    constructor(websocket: WebSocket.connection) {
        super();
        this.websocket = websocket
    }

    isReady() {
        return this.websocket.state === "open"
    }

    send(packet: BinaryPacket) {
        this.websocket.sendBytes(Buffer.from(packet.getData()))
    }

    close(reason: string) {
        this.websocket.close(WebSocketConnection.CLOSE_REASON_NORMAL, reason)
    }
}

export default WebsocketConnection;