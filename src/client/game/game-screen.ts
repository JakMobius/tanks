/* @load-resource: '../web/base-style.scss' */

import GameScene from './scenes/gamescene';
import './game-loader'

import {ScreenConfig} from "../graphics/screen";
import GeneralGameScreen from "./general-game-screen";

/* Loading all necessary stuff for the game */
import 'src/entity/tanks/model-loader'
import 'src/effects/model-loader'
import 'src/client/entity/bullet/model-loader';
import 'src/client/entity/tank/model-loader';
import 'src/client/graphics/drawers/block/type-loader';
import 'src/client/effects/tank/type-loader';
import 'src/client/effects/world/type-loader';
import 'src/map/blockstate/type-loader';
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

