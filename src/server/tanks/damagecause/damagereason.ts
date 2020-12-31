
class DamageReason {
	public time: any;

    constructor(options) {
        if(options != null) {
            this.time = Date.now()
        }
    }
}

export default DamageReason;