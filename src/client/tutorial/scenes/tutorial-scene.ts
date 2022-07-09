import {SceneConfig} from 'src/client/scenes/scene';
import {getTutorialMap} from "../tutorial-map";
import EmbeddedServerGame from "../../embedded-server/embedded-server-game";
import TutorialWorldController from "../tutorial-world-controller";
import PlayerChatPacket from "../../../networking/packets/game-packets/player-chat-packet";
import GeneralGameScene from "../../game/general-game-scene";
import TankControls from "../../../controls/tank-controls";
import PlayerControlsPacket from "../../../networking/packets/game-packets/player-controls-packet";
import WorldCommunicationPacket from "../../../networking/packets/game-packets/world-communication-packet";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import EntityDataReceiveComponent from "../../../entity/components/network/entity-data-receive-component";

export interface TutorialSceneConfig extends SceneConfig {
    username: string
}

export default class TutorialScene extends GeneralGameScene {
    public game: EmbeddedServerGame
    public worldController: TutorialWorldController

    constructor(config: TutorialSceneConfig) {
        super(config)

        this.game = new EmbeddedServerGame({ map: getTutorialMap() })
        this.displayWorld(this.game.clientWorld)

        this.worldController = new TutorialWorldController(this.game.serverGame)

        this.keyboard.keybinding("Tab", () => {
            this.performClientCommand("#switch-tank")
        })

        this.keyboard.keybinding("Cmd-B", () => {
            this.worldDrawer.debugDrawOn = !this.worldDrawer.debugDrawOn
        })

        this.game.clientConnection.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            this.game.clientWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
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

    tick(dt: number) {
        super.tick(dt)

        if(this.controlledTank) {
            let component = this.controlledTank.getComponent(TankControls)
            if (component.shouldUpdate()) {
                new PlayerControlsPacket(component).sendTo(this.game.clientConnection.connection)
            }
        }

        this.game.tick(dt)
    }

    performClientCommand(command: string) {
        new PlayerChatPacket(command).sendTo(this.game.clientConnection.connection)
    }
}