
import AbstractConnection from '../networking/abstract-connection';
import WebSocket from 'websocket';
import BinaryPacket from "../networking/binary-packet";
import * as Websocket from "websocket";
import {BinarySerializer} from "../serialization/binary/serializable";

const WebSocketConnection = WebSocket.connection

export default class WebsocketConnection extends AbstractConnection {

    websocket: WebSocket.connection = null

    constructor(websocket: WebSocket.connection) {
        super();
        this.websocket = websocket

        websocket.on('message', (message: Websocket.IMessage) => {
            this.handleMessage(message)
        })

        websocket.on("close", (code: number, desc: string) =>  {
            this.emit("close", code, desc)
        });
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

    private handleMessage(message: Websocket.IMessage) {
        try {
            if(message.type !== "binary") return

            let data = message.binaryData
            let decoder = BinaryPacket.binaryDecoder
            decoder.reset()
            decoder.readData(new Uint8Array(data).buffer)

            // BinaryPacket.deserialize may only return
            // a BinaryPacket instance

            let packet = BinarySerializer.deserialize(decoder, BinaryPacket)

            this.receivePacket(packet)
        } catch(e) {
            this.emit("error", e)
        }
    }

    getIpAddress(): string {
        return this.websocket.remoteAddress;
    }
}