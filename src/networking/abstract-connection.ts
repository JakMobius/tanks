
/**
 * @abstract
 */
class AbstractConnection {
    /**
     * @abstract
     * @returns boolean
     */
    isReady() {}

    /**
     * @abstract
     * @param bytes {BinaryPacket}
     */
    send(bytes) {}

    /**
     * @abstract
     */
    close(reason) {}
}

export default AbstractConnection;