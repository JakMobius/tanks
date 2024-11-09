import ConnectionClient from "src/networking/connection-client";
import {Progress, ProgressLeaf} from "src/client/utils/progress";
import PageLocation from "src/client/scenes/page-location";
import WebsocketConnection from "src/client/networking/websocket-connection";
import Scene from "src/client/scenes/scene";
import GameScene from "src/client/game/game-scene";
import {SceneDescriptor} from "src/client/scenes/scene-descriptor";
import SceneController from "src/client/scenes/scene-controller";
import {
    ScenePrerequisite,
    soundResourcePrerequisite,
    texturesResourcePrerequisite
} from "src/client/scenes/scene-prerequisite";
import {RandomMessageLoadingError} from "src/client/scenes/loading/loading-error";
import {
    internetErrorMessageGenerator, missingRoomNameErrorMessageGenerator
} from "src/client/scenes/loading/error-message-generator";

SceneController.shared.registerScene("game", () => new GameSceneDescriptor())

export class SocketConnectionPrerequisite extends ScenePrerequisite {
    client: ConnectionClient | null

    constructor() {
        super();

        this.setLocalizedDescription("Подключение к игровой сессии")
    }

    resolve(): Progress {
        let room = PageLocation.getHashJson().room

        if (!room) {
            return Progress.failed(new RandomMessageLoadingError(missingRoomNameErrorMessageGenerator)
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
        }

        let progress = new ProgressLeaf()
        let ip = "ws://" + window.location.host + "/game-socket"

        const connection = new WebsocketConnection(ip + "?room=" + room)
        connection.suspend()

        connection.on("ready", () => {
            this.client = new ConnectionClient(connection)
            progress.complete()
        })

        connection.on("error", () => {
            progress.fail(new RandomMessageLoadingError(internetErrorMessageGenerator)
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
        })

        return progress
    }
}

export default class GameSceneDescriptor extends SceneDescriptor {

    connectionPrerequisiste = new SocketConnectionPrerequisite()

    constructor() {
        super();

        this.prerequisites = [
            texturesResourcePrerequisite,
            soundResourcePrerequisite,
            this.connectionPrerequisiste
        ]
    }

    createScene(): Scene {
        return new GameScene({
            client: this.connectionPrerequisiste.client
        })
    }
}