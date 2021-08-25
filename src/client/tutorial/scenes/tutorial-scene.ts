
import {SceneConfig} from 'src/client/scenes/scene';
import {getTutorialMap} from "../tutorial-map";
import ClientPlayer from "../../client-player";
import EmbeddedServerGame from "../../embedded-server/embedded-server-game";
import TutorialWorldController from "../tutorial-world-controller";
import PlayerChatPacket from "../../../networking/packets/game-packets/player-chat-packet";
import GeneralGameScene from "../../game/general-game-scene";

export interface TutorialSceneConfig extends SceneConfig {
    username: string
}

export default class TutorialScene extends GeneralGameScene {
    public game: EmbeddedServerGame
    public worldController: TutorialWorldController

    constructor(config: TutorialSceneConfig) {
        super(config)

        this.game = new EmbeddedServerGame({ map: getTutorialMap() })
        this.setWorld(this.game.clientWorld)

        this.worldController = new TutorialWorldController(this.game.serverGame)

        this.keyboard.keybinding("Tab", () => {
            this.performClientCommand("#switch-tank")
        })

        this.keyboard.keybinding("Cmd-B", () => {
            this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
        })

        this.game.connectClientToServer()
    }

    // TODO:
    //simulatePing() {
        // const latencyImitator = new NetworkLatencyImitator(this.game.client.connection)
        // latencyImitator.ping = 100
        // latencyImitator.jitter = 50
        //this.game.client.dataHandler = latencyImitator
    //}

    performClientCommand(command: string) {
        new PlayerChatPacket(command).sendTo(this.game.client.connection)
    }

    onWorldPrimaryPlayerSet(player: ClientPlayer) {
        super.onWorldPrimaryPlayerSet(player)
        if(player) {
            // Well, at least this approach is better than updating the tank
            // controls in a timer...
            let serverPlayer = this.game.serverGame.world.players.get(player.id)
            this.playerControls.connectTankControls(serverPlayer.tank.model.controls)
        }
    }
}