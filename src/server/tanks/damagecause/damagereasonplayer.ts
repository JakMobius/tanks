
import DamageReason from './damagereason';

class DamageReasonPlayer extends DamageReason {
	public player: any;

    constructor(options) {
        super(options);

        if(options != null) {
            this.player = options["player"]
        }
    }
}

export default DamageReasonPlayer;