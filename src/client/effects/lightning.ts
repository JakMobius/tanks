
import FX from '../sound/fx';
import Effect from "../../server/bonuses/effect";
import Player from "../../utils/player";
import Sound from "../sound/sound";
import GameScene from "../game/scenes/gamescene";


class Lightning extends Effect {

	public player: Player;
	public sound: Sound;
	public game: GameScene;
	public dead: boolean;

    constructor(game: GameScene) {
        super()
        this.game = game
    }

    start(player: Player) {
        this.player = player
        this.sound = this.game.screen.soundEngine.playSound(FX.TESLA_START, {
            mapX: player.tank.model.x,
            mapY: player.tank.model.y,
            volume: 0.3
        })
        const self = this;

        setTimeout(function() {
            if(!self.dead) {
                self.sound = self.game.screen.soundEngine.playSound(FX.TESLA_SOUND, {
                    mapX: player.tank.model.x,
                    mapY: player.tank.model.y,
                    volume: 0.3,
                    loop: true
                })
            }
        }, this.sound.buffer.duration * 1000)

        // TODO: drawing
    }

    stop() {
        this.sound.stop()
        this.dead = true
    }


}

export default Lightning;