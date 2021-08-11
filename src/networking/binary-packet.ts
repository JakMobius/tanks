
import BinarySerializable, {BinarySerializer, Constructor} from '../serialization/binary/serializable';
import BinaryEncoder from '../serialization/binary/binaryencoder';
import BinaryDecoder from '../serialization/binary/binarydecoder';
import Connection from "./connection";
import Buffer, {ByteArray} from "../serialization/binary/buffer";

/**
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
 * To create a contextual packet, you only need to overwrite the
 * {@link BinaryPacket#typeName typeName} static function.
 * {@link BinaryPacket} itself will take care of instantiating your packet
 * and writing the decoder to the {@link BinaryPacket.decoder decoder}
 * field. Then you will be able to use the obtained data in any method
 * you create. In this way, you will only be able to read the data
 * when the handler accesses the package, with the possible
 * transmission of any contextual information. Please note that your
 * data will not be available after the packet is processed as the
 * decoder buffer will be reused for handling upcoming packets.
 */

export default class BinaryPacket implements BinarySerializable<typeof BinaryPacket> {

    /**
     * Compiled binary data of the packet.
     */

	public data: ArrayBuffer | null = null;

    /**
     * A decoder saved for the handlers.
     * Valid until it is reused.
     */

	public decoder: BinaryDecoder | null = null;

    /*
     Considering that the buffer will only be reused after the
     data packet is processed, we can store it for handlers to
     use. (Although it's always going to be
     BinaryDecoder.shared... Uhh... Nevermind...)
     */

    static requireLargeIndices = false
    static binaryEncoder = new BinaryEncoder({ writeIndexMode: true })
    static binaryDecoder = new BinaryDecoder({ readIndexMode: true })

    static groupName = 3
    static typeName = 0

    constructor() {
    }

    encode() {
        let encoder = BinaryPacket.binaryEncoder
        encoder.largeIndices = (this.constructor as typeof BinaryPacket).requireLargeIndices
        encoder.reset()
        BinarySerializer.serialize(this, encoder)

        return encoder.compile()
    }

    /**
     * When called once, packet get compiled and can no longer change
     * its data
     * @returns Packet data
     */
    getData(): ArrayBuffer {
        if(this.data == null) {
            this.data = this.encode()
        }

        return this.data
    }

    /**
     * Sends the packet to {@link Connection}. When called once, packet
     * get compiled and can no longer change its data
     * @param connection The packet receiver.
     */

    sendTo(connection: Connection): void {
        if(!this.shouldSend()) {
            return
        }

        connection.sendOutgoingPacket(this)
    }

    shouldSend(): boolean {
        return true
    }

    toBinary(encoder: BinaryEncoder): void {

    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let packet = new this() as any as BinaryPacket
        packet.decoder = decoder
        return packet as any as T
    }
}