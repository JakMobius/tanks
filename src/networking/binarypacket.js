
const BinarySerializable = require("../serialization/binary/serializable")
const BinaryEncoder = require("../serialization/binary/binaryencoder")
const BinaryDecoder = require("../serialization/binary/binarydecoder")

/**
 * @abstract
 * This class is a binary data packet that can be transmitted over a
 * network with low redundancy. There is two packet types: standalone
 * and contextual. Standalone packets do not require any other data in
 * order to record and read information. Contextual packets only read
 * information when used by handlers.
 *
 * To create a standalone packet, inherit this class in the same way
 * as {@link BinarySerializable}. Then, in the
 * {@link BinaryPacket#fromBinary fromBinary} static function, you can
 * read data from the decoder and return an instance of your package.
 *
 * To create a context packet, you only need to overwrite the
 * {@link BinaryPacket#typeName typeName} static function.
 * {@link BinaryPacket} itself will take care of instantiating your package
 * and writing the decoder to the {@link BinaryPacket.decoder decoder}
 * field. Then you will be able to use the obtained data in any method
 * you create. In this way, you will only be able to read the data
 * when the handler accesses the package, with the possible
 * transmission of any contextual information. Please note that your
 * data will not be available after the packet is processed as the
 * decoder buffer is released for reuse.
 */

class BinaryPacket extends BinarySerializable {

    static SERIALIZATION_GROUP_NAME = 3
    static requireLargeIndices = false
    static binaryEncoder = new BinaryEncoder({ writeIndexMode: true })
    static binaryDecoder = new BinaryDecoder({ readIndexMode: true })
    static groupName = () => BinaryPacket.SERIALIZATION_GROUP_NAME

    constructor() {
        super();

        /**
         * @type {ArrayBuffer} Compiled binary data of the packet.
         */
        this.data = null

        /**
         * @type {BinaryDecoder} A decoder saved for the handlers.
         * Valid until it is reused.
         */
        this.decoder = null

        /*
         Considering that the buffer will only be reused after the
         data packet is processed, we can store it for handlers to
         use. (Although it's always going to be
         BinaryDecoder.shared... Uhh... Nevermind...)
         */
    }

    encode() {
        let encoder = BinaryPacket.binaryEncoder
        encoder.largeIndices = this.constructor.requireLargeIndices
        encoder.reset()
        BinaryPacket.serialize(this, encoder)

        return encoder.compile()
    }

    /**
     * When called once, packet get compiled and can no longer change
     * its data
     * @returns {ArrayBuffer} Packet data
     */
    getData() {
        if(this.data == null) {
            this.data = this.encode()
        }
        return this.data
    }

    /**
     * Sends the packet to WebSocket client. When called once, packet
     * get compiled and can no longer change its data
     * @param client The packet receiver.
     */

    sendTo(client) {
        if(!this.shouldSend()) {
            return
        }
        if(client.connection.readyState !== 1) {
            return
        }

        client.connection.send(this.getData())
    }

    shouldSend() {
        return true
    }

    static fromBinary(decoder) {
        let packet = new this()
        packet.decoder = decoder
        return packet
    }
}

module.exports = BinaryPacket