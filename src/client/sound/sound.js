
class Sound {
    constructor(context, buffer, index, config) {
        this.context = context;
        this.buffer = buffer.getSoundByIndex(index)
        this.config = config
    }

    init() {
        this.gainNode = this.context.createGain();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        if(this.config.shouldPan) {
            if(this.context.createStereoPanner) {
                let panner = this.context.createStereoPanner()
                this.gainNode.connect(panner)
                panner.connect(this.context.destination)
                this.panner = panner
            }

            if(this.config.loop) {
                this.source.loop = true
            }
        }
    }

    play(delay) {
        delay = delay || 0
        if(!this.gainNode) this.init()
        this.source.start(this.context.currentTime + delay);
    }

    stop(delay) {
        delay = delay || 0
        try {
            this.gainNode.gain.exponentialRampToValueAtTime(delay + 0.001, this.context.currentTime + 0.1 + delay);
            this.source.stop(this.context.currentTime + 0.1 + delay);
        } catch(error) {
            this.source.stop(this.context.currentTime);
        }
    }

    setPan(pan) {
        if(this.panner) {
            if(pan > 1) pan = 1
            if(pan < -1) pan = -1
            this.panner.pan.value = pan
        }
    }
}

module.exports = Sound