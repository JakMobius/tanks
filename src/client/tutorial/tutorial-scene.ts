
import {getTutorialMap} from "src/client/tutorial/tutorial-map";
import EmbeddedServerGame from "src/client/embedded-server/embedded-server-game";
import TutorialWorldController from "src/client/tutorial/tutorial-world-controller";
import GeneralGameScene from "src/client/game/general-game-scene";
import WorldCommunicationPacket from "src/networking/packets/game-packets/world-communication-packet";
import ReadBuffer from "src/serialization/binary/read-buffer";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import PlayerActionPacket, {PlayerActionType} from "src/networking/packets/game-packets/player-action-packet";
import PlayerChatPacket from "src/networking/packets/game-packets/player-chat-packet";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";

export interface TutorialSceneConfig {
    username: string
}

export default class TutorialScene extends GeneralGameScene {
    public game: EmbeddedServerGame
    public worldController: TutorialWorldController

    private remoteControlsManager: RemoteControlsManager

    constructor() {
        super()
        this.setTitle("Танчики - Туториал")
        this.game = new EmbeddedServerGame({ map: getTutorialMap() })

        this.worldController = new TutorialWorldController(this.game.serverGame)

        // this.keyboard.keybinding("Tab", () => {
        //     this.performClientCommand("#switch-tank")
        // })

        this.game.clientConnection.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.game.clientWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })

        this.remoteControlsManager = new RemoteControlsManager(this.controlsResponder, this.game.clientConnection.connection)
        this.remoteControlsManager.attach()

        this.controlsResponder.on("tank-respawn", () => {
            new PlayerActionPacket(PlayerActionType.selfDestruct).sendTo(this.game.clientConnection.connection)
        })

        this.controlsResponder.on("tank-respawn-cancel", () => {
            new PlayerActionPacket(PlayerActionType.selfDestructCancel).sendTo(this.game.clientConnection.connection)
        })

        this.game.connectClientToServer()
    }

    tick(dt: number) {
        super.tick(dt)
        this.remoteControlsManager.updateIfNeeded()
        this.game.tick(dt)
    }

    appear() {
        super.appear();
        this.displayWorld(this.game.clientWorld)
    }

    protected onChat(text: string) {
        new PlayerChatPacket(text).sendTo(this.game.clientConnection.connection)
    }

    protected onTankSelected(tank: number) {
        new PlayerTankSelectPacket(tank).sendTo(this.game.clientConnection.connection)
    }
}