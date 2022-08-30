/* @load-resource: '../web/base-style.scss' */

import GameScene from './scenes/game-scene';
import {ScreenConfig} from "../graphics/screen";
import GeneralGameScreen from "./general-game-screen";
import WebsocketConnection from "../networking/websocket-connection";
import ConnectionClient from "../../networking/connection-client";

export interface GameConfig extends ScreenConfig {
    ip: string
}

export default class GameScreen extends GeneralGameScreen {

    config: GameConfig

    constructor(config: GameConfig) {
        super(config)

        this.config = config
    }

    async startGame() {
        await super.startGame()

        const connection = new WebsocketConnection(this.config.ip)
        const client = new ConnectionClient(connection)

        this.setScene(new GameScene({
            screen: this,
            client: client
        }))
    }
}

