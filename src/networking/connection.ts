import BinaryPacket from "./binary-packet";
import EventEmitter from "../utils/event-emitter";
import {BinarySerializer} from "../serialization/binary/serializable";
import ReadBuffer from "../serialization/binary/read-buffer";

export default abstract class Connection extends EventEmitter {

    protected queue: ArrayBuffer[] = []

    abstract isReady(): boolean
    abstract close(reason?: string): void
    abstract getIpAddress(): string

    /**
     * Called externally when user wants to send a packet
     * @param packet
     */

    sendOutgoingPacket(packet: BinaryPacket) {
        this.sendOutgoingData(packet.getData())
    }

    /**
     * Called externally when user wants to send a binary data
     * @param data
     */

    sendOutgoingData(data: ArrayBuffer) {
        if(this.isReady()) this.handleOutgoingData(data)
        else this.enqueueOutgoingData(data)
    }

    /**
     * Called **internally** when node is able to send some data.
     * May be called immediately in {@link sendOutgoingData} or
     * {@link sendOutgoingPacket}, if connection is ready, or
     * may be delayed, when it's necessary to wait when connection
     * is ready.
     * @protected
     */

    protected handleOutgoingData(data: ArrayBuffer) {
        this.emit("outgoing-data", data)
    }

    protected enqueueOutgoingData(data: ArrayBuffer) {
        this.queue.push(data)
    }

    protected flushQueue() {
        for(let data of this.queue) this.handleOutgoingData(data)
        this.queue = []
    }

    onReady() {
        this.flushQueue()
    }

    /**
     * Called **internally** when this node is receiving some data
     */

    handleIncomingData(data: ArrayBuffer) {
        let decoder = ReadBuffer.getShared(data)
        const packet = BinarySerializer.deserialize(decoder, BinaryPacket)
        this.handleIncomingPacket(packet)
    }

    /**
     * Called **internally** when this node is receiving a binary packet
     */

    handleIncomingPacket(packet: BinaryPacket) {
        this.emit("incoming-packet", packet)
    }

    /**
     * Pipe two connections
     *
     * A sends some data => B sends some data
     * B receives some data => A receives some data
     */
    static pipeStraight(connectionA: Connection, connectionB: Connection) {
        connectionA.on("outgoing-data", (data) => {
            connectionB.sendOutgoingData(data)
        })

        connectionB.on("incoming-packet", (packet) => {
            connectionA.handleIncomingPacket(packet)
        })
    }

    /**
     * Pipe two connections the inverted way
     *
     * A sends some data => B receives some data
     * B sends some data => A receives some data
     */
    static pipeReversed(connectionA: Connection, connectionB: Connection) {
        connectionA.on("outgoing-data", (data) => {
            connectionB.handleIncomingData(data)
        })

        connectionB.on("outgoing-data", (data) => {
            connectionA.handleIncomingData(data)
        })
    }
}