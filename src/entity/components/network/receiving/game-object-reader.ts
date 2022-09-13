import ObjectReader from "src/serialization/binary/parsers/object-reader";
import ReadBuffer from "src/serialization/binary/read-buffer";
import ReceiverComponent from "./receiver-component";

export default class GameObjectReader extends ObjectReader {

    private currentReceiver: ReceiverComponent | null = null
    public static instance = new GameObjectReader()

    readWithReceiver(buffer: ReadBuffer, receiver: ReceiverComponent): any {
        this.currentReceiver = receiver
        let result = this.read(buffer)
        this.currentReceiver = null
        return result
    }

    protected readCustomObject(buffer: ReadBuffer) {
        // Only entities can lead us there

        if(!this.currentReceiver) {
            throw new Error("Receiver object not set. Please, use readWithReceiver instead of read")
        }

        return this.currentReceiver.readEntity(buffer)
    }
}