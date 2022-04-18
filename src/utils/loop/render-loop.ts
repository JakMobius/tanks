import Loop, {LoopConfig} from './loop';

export default class RenderLoop extends Loop {

    constructor(config: LoopConfig) {
        super(config);
    }

    start() {
        if(this.running) return
        super.start();
        this.perform(0)
    }

    cycle(dt: number) {
        requestAnimationFrame((time) => {
            this.perform(time)
        });
    }
}