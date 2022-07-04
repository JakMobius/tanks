
import SoundEngine from "../sound-engine";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import {SoundStreamPrimaryComponent} from "../stream/sound-stream-primary-component";

export default class SoundPrimaryComponent implements Component {
    public entity: Entity
	public source: AudioBufferSourceNode;
    public buffer: AudioBuffer
    public engine: SoundEngine;

    public inputStream: Entity
    public outputStreams: Entity[] = []

    constructor(buffer: AudioBuffer) {
        this.buffer = buffer
    }

    play() {
        this.source.start(this.engine.context.currentTime);
    }

    loop(loop: boolean) {
        this.source.loop = loop
    }

    stop() {
        this.source.stop(this.engine.context.currentTime);
    }

    onAttach(entity: Entity): void {
        this.entity = entity;
    }

    onDetach(): void {
        this.entity = null
    }

    private createInput() {
        this.inputStream = new Entity()
        let inputStreamComponent = new SoundStreamPrimaryComponent(this.engine)
        this.inputStream.addComponent(inputStreamComponent)
        this.source.connect(inputStreamComponent.source)
    }

    private destroyInput() {
        this.inputStream = null
        this.source.disconnect()
    }

    private createOutputs() {
        this.outputStreams = []
        for (let output of this.engine.outputs) {
            let outputStreamComponent = output.getComponent(SoundStreamPrimaryComponent)

            let soundOutput = new Entity()
            let soundOutputStreamComponent = new SoundStreamPrimaryComponent(this.engine)
            soundOutput.addComponent(soundOutputStreamComponent)

            this.inputStream.getComponent(SoundStreamPrimaryComponent).destination.connect(soundOutputStreamComponent.source)
            soundOutputStreamComponent.destination.connect(outputStreamComponent.source)

            this.outputStreams.push(output)
        }
    }

    private destroyOutputs() {
        for (let output of this.outputStreams) {
            output.getComponent(SoundStreamPrimaryComponent).destination.disconnect()
        }
        this.inputStream.getComponent(SoundPrimaryComponent).source.disconnect()
        this.outputStreams = []
    }

    setEngine(engine: SoundEngine) {
        if(engine) {
            this.engine = engine
            this.source = this.engine.context.createBufferSource()
            this.source.buffer = this.buffer
            this.createInput()
            this.createOutputs()
        } else {
            stop()
            this.source = null
            this.engine = null
            this.destroyInput()
            this.destroyOutputs()
        }
    }

    static createSound(buffer: AudioBuffer) {
        let entity = new Entity()
        let component = new SoundPrimaryComponent(buffer)
        entity.addComponent(component)
        return entity
    }
}