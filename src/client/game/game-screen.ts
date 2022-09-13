/* @load-resource: '../web/base-style.scss' */

import GameScene from './scenes/game-scene';
import {ScreenConfig} from "../graphics/screen";
import GeneralGameScreen from "./general-game-screen";
import WebsocketConnection from "../networking/websocket-connection";
import ConnectionClient from "../../networking/connection-client";
import DialogOverlay from "../map-editor/ui/overlay/dialog/dialogoverlay";

export interface GameConfig extends ScreenConfig {
    ip: string,
    room?: string
}

export default class GameScreen extends GeneralGameScreen {

    config: GameConfig

    constructor(config: GameConfig) {
        super(config)

        this.config = config
    }

    async startGame() {
        await super.startGame()

        if(!this.config.room) {
            this.showBadURLDialog()
            return
        }

        const connection = new WebsocketConnection(this.config.ip + "?room=" + this.config.room)
        const client = new ConnectionClient(connection)

        this.setScene(new GameScene({
            screen: this,
            client: client
        }))
    }

    private showBadURLDialog() {
        let overlay = new DialogOverlay({
            requiresDecision: true,
            root: $(document.body)
        })

        overlay.dialog
            .title("Вы нас запутали!")
            .text("Ссылка, по которой вы перешли, не указывает ни на какую комнату, и мы не знаем, куда вас подключить. Пожалуйста, перейдите по ссылке из списка комнат.")
            .withButton({
                title: "В главное меню",
                onclick: () => window.location.href = '/hub'
            })

        overlay.show()
    }
}

