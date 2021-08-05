

export default abstract class ClientPacketHandler {
    abstract handleData(data: ArrayBuffer): void
}