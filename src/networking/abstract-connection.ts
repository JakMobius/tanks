import BinaryPacket from "./binarypacket";

abstract class AbstractConnection {
    abstract isReady(): boolean

    abstract send(bytes: BinaryPacket): void

    abstract close(reason?: string): void
}

export default AbstractConnection;