
const DamageReason = require("./damagereason.js")

class DamageReasonPlayer extends DamageReason {
    constructor(options) {
        super(options);

        if(options != null) {
            this.player = options["player"]
        }
    }
}

module.exports = DamageReasonPlayer