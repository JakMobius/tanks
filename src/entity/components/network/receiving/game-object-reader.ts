import ObjectReader from "src/serialization/binary/parsers/object-reader";
import ReadBuffer from "src/serialization/binary/read-buffer";
import ReceiverComponent from "./receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";

export default class GameObjectReader extends ObjectReader {

    private receiveComponent: EntityDataReceiveComponent | null = null
    public static instance = new GameObjectReader()

    readWithReceiver(buffer: ReadBuffer, receiveComponent: EntityDataReceiveComponent): any {
        this.receiveComponent = receiveComponent
        let result = this.read(buffer)
        this.receiveComponent = null
        return result
    }

    protected readCustomObject(buffer: ReadBuffer) {
        // Only entities can lead us there

        if (!this.receiveComponent) {
            throw new Error("Receiver object not set. Please, use readWithReceiver instead of read")
        }

        return this.receiveComponent.readEntity(buffer)
    }
}