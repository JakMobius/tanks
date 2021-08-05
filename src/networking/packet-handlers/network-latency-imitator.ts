import ClientDataHandler from "./client-packet-handler";
import AbstractClient from "../abstract-client";
import Queue from "../../utils/queue";

export default class NetworkLatencyImitator extends ClientDataHandler {

    ping: number = 0
    jitter: number = 0
    queue = new Queue<ArrayBuffer>()
    private client: AbstractClient;

    constructor(client: AbstractClient) {
        super();
        this.client = client;
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
        this.client.handleData(this.queue.dequeue())
    }


}