import EntityModel from '../../entity/entitymodel';

class BonusModel extends EntityModel {
	public time: any;
	public effect: any;

    constructor(entity) {
        // TODO: Make this look more accurate.
        super(entity)
        this.time = config.time
        this.effect = config.effect
    }

    applyTo(player) {
        for(let i of player.bonuses.keys()) {
            const bonus = player.bonuses[i];

            if(bonus.effect.id === this.effect.id) {
                bonus.effect.end()
                player.bonuses.splice(i, 1)
            }
        }

        player.bonuses.push(this)
        this.effect.start(player)
    }
}

export default BonusModel;