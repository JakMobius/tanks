import ClientDataHandler from "./client-packet-handler";
import Queue from "src/utils/queue";
import Connection from "../connection";

export default class NetworkLatencyImitator extends ClientDataHandler {

    ping: number = 0
    jitter: number = 0
    queue = new Queue<ArrayBuffer>()
    private connection: Connection;

    constructor(connection: Connection) {
        super();
        this.connection = connection;
    }

    handleData(packet: ArrayBuffer): void {
        this.queue.enqueue(packet)
        this.schedulePacket()
    }

    private nextDelay() {
        return this.ping + Math.random() * this.jitter * 0.5
    }

    private schedulePacket() {
        setTimeout(() => this.dequeuePacket(), this.nextDelay())
    }

    private dequeuePacket() {
        this.connection.handleIncomingData(this.queue.dequeue())
    }
}