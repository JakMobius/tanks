import EntityModel from '../../entity/entitymodel';
import GameWorld from "../../gameworld";
import Effect from "./effect";
import Player from "../../utils/player";

export interface BonusModelConfig {
    time: number
    effect: Effect
}

class BonusModel extends EntityModel {
	public time: any;
	public effect: Effect;

    constructor(game: GameWorld, options: BonusModelConfig) {
        super(game)
        this.time = options.time
        this.effect = options.effect
    }

    applyTo(player: Player) {
        for(let i of player.bonuses.keys()) {
            const bonus = player.bonuses[i];

            if(bonus.effect.id === this.effect.id) {
                bonus.effect.end(player)
                player.bonuses.splice(i, 1)
            }
        }

        player.bonuses.push(this)
        this.effect.start(player)
    }
}

export default BonusModel;