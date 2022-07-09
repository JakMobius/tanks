
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import {SoundStream} from "../stream/sound-stream";
import {SoundAsset} from "../sounds";

export default class SoundPrimaryComponent implements Component {
    public entity: Entity
	public source: AudioBufferSourceNode;
    public asset: SoundAsset
    public keepalive: boolean
    public connected: boolean

    public inputStream: SoundStream
    public outputStreams: SoundStream[] = []

    private tickHandler: () => void = () => this.entity.emit("tick")

    constructor(asset: SoundAsset) {
        this.asset = asset
        this.source = asset.engine.context.createBufferSource()
        this.source.buffer = asset.buffer
        this.source.onended = () => {
            if(this.source.loop || this.keepalive) return
            this.entity.emit("ended")
            this.stopTicking()
            this.disconnect()
        }
        asset.engine.resume()
        this.createInput()
        this.createOutputs()
    }

    play() {
        if(!this.connected) this.connect()
        this.source.start(this.asset.engine.context.currentTime);
        this.entity.emit("play")
        this.startTicking()
        return this
    }

    loop(loop: boolean) {
        this.source.loop = loop
        return this
    }

    playbackRate(rate: number) {
        this.source.playbackRate.value = rate
        return this
    }

    stop() {
        this.source.stop(this.asset.engine.context.currentTime);
        this.entity.emit("stop")
        this.stopTicking()
        return this
    }

    onAttach(entity: Entity): void {
        this.entity = entity;
    }

    onDetach(): void {
        this.entity = null
    }

    private createInput() {
        this.inputStream = new SoundStream(this.asset.engine)
        this.source.connect(this.inputStream.input)
    }

    private createOutputs() {
        for (let output of this.asset.engine.outputs) {
            let soundOutput = new SoundStream(this.asset.engine)
            this.inputStream.output.connect(soundOutput.input)
            soundOutput.output.connect(output.input)
            this.outputStreams.push(soundOutput)
        }
    }

    disconnect() {
        if(!this.connected) return
        this.stop()
        this.connected = false

        for (let output of this.outputStreams) {
            output.output.disconnect()
        }
    }

    connect() {
        if(this.connected) return
        this.connected = true

        for(let i = 0; i < this.outputStreams.length; i++) {
            this.outputStreams[i].output.connect(this.asset.engine.outputs[i].input)
        }
    }

    private startTicking() {
        this.tickHandler()
        this.asset.engine.on("tick", this.tickHandler)
    }

    private stopTicking() {
        this.asset.engine.off("tick", this.tickHandler)
    }

    static createSound(sound: SoundAsset) {
        let entity = new Entity()
        let component = new SoundPrimaryComponent(sound)
        entity.addComponent(component)
        return entity
    }
}