//
// import FX from '../sound/fx';
// import Bonus from "../../server/entity/bonus/bonus";
// import AbstractPlayer from "../../utils/player";
// import SoundComponent from "../sound/sound";
// import GameScene from "../game/scenes/gamescene";
//
//
// export default class Lightning extends Bonus {
//
// 	public player: AbstractPlayer;
// 	public sound: SoundComponent;
// 	public game: GameScene;
// 	public dead: boolean;
//
//     constructor(game: GameScene) {
//         super()
//         this.game = game
//     }
//
//     start(player: AbstractPlayer) {
//         this.player = player
//         let tankPosition = player.tank.model.body.GetPosition()
//         this.sound = this.game.screen.soundEngine.playSound(FX.TESLA_START, {
//             mapX: tankPosition.x,
//             mapY: tankPosition.y,
//             volume: 0.3
//         })
//         const self = this;
//
//         setTimeout(function() {
//             if(!self.dead) {
//                 let tankPosition = player.tank.model.body.GetPosition()
//                 self.sound = self.game.screen.soundEngine.playSound(FX.TESLA_SOUND, {
//                     mapX: tankPosition.x,
//                     mapY: tankPosition.y,
//                     volume: 0.3,
//                     loop: true
//                 })
//             }
//         }, this.sound.buffer.duration * 1000)
//
//         // TODO: drawing
//     }
//
//     stop() {
//         this.sound.stop()
//         this.dead = true
//     }
//
//
// }