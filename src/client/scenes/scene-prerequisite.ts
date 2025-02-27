
import { SceneContextProps, useScene } from "src/client/scenes/scene-controller";
import Downloader from "src/client/utils/downloader";
import Sprite from "src/client/graphics/sprite";
import { Progress, ProgressLeaf } from "src/client/utils/progress";
import { SoundAssets } from "src/client/sound/sounds";
import { BasicMessageLoadingError, convertErrorToLoadingError, LoadingError } from "./loading/loading-error";
import { useEffect, useState } from "react";
import ConnectionClient from "src/networking/connection-client";
import PageLocation from "./page-location";
import { internetErrorMessageGenerator, missingRoomNameErrorMessageGenerator } from "./loading/error-message-generator";
import WebsocketConnection from "../networking/websocket-connection";

export class ScenePrerequisite {
    resolve(scene: SceneContextProps): Progress {
        return Progress.completed()
    }

    getLocalizedDescription(): string | null {
        return "Загрузка"
    }

    static toProgress(prerequisites: ScenePrerequisite[], scene: SceneContextProps) {
        return Progress.sequential(prerequisites.map(prerequisite => () => prerequisite.resolve(scene)))
    } 
}

export function usePrerequisites(prerequisitesFunc: () => ScenePrerequisite[]) {
    const scene = useScene()
    
    const [prereqState, setPrereqState] = useState({
        loaded: false,
        error: null as LoadingError | null,
        progress: null as Progress | null,
    })

    const onError = (error: Error) => {
        setPrereqState({
            loaded: false,
            progress: null,
            error: convertErrorToLoadingError(error)
        })
    }

    useEffect(() => {
        let progress = ScenePrerequisite.toProgress(prerequisitesFunc(), scene)
        
        const onCompleted = () => setPrereqState(state => ({ ...state, loaded: true }))
        
        progress.on("completed", onCompleted)
        progress.on("error", onError)

        setPrereqState(state => ({ ...state, progress }))

        return () => progress.abort()
    }, [])

    return prereqState
}

export class SoundResourcePrerequisite extends ScenePrerequisite {
    override resolve(scene: SceneContextProps) {
        let soundsToDownload = []
        for(let id of SoundAssets.keys()) {
            if(!scene.soundEngine.soundBuffers[id]) soundsToDownload.push(id)
        }

        let progress = Progress.parallel(
            soundsToDownload.map((id) => Downloader.downloadBinary(
                SoundAssets.get(id).path, async (response) => {
                    await scene.soundEngine.context.decodeAudioData(response, (buffer: AudioBuffer) => {
                        scene.soundEngine.soundBuffers[id] = buffer
                    });
                })
            )
        )
        return progress
    }
    override getLocalizedDescription(): string | null {
        return "Загрузка звуков"
    }
}

export class TexturesResourcePrerequisite extends ScenePrerequisite {
    override resolve(scene: SceneContextProps) {
        return Sprite.download()
    }

    override getLocalizedDescription(): string | null {
        return "Загрузка текстур"
    }
}

export class SocketConnectionPrerequisite extends ScenePrerequisite {
    client: ConnectionClient | null

    resolve(): Progress {
        let room = PageLocation.getHashJson().room

        if (!room) {
            return Progress.failed(new BasicMessageLoadingError(missingRoomNameErrorMessageGenerator.generateVariant())
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
        }

        let progress = new ProgressLeaf()

        let protocol = "ws:"
        if(location.protocol == "https:") {
            protocol = "wss:"
        }
        let ip = protocol + "//" + window.location.host + "/game-socket"

        const connection = new WebsocketConnection(ip + "?room=" + room)
        connection.suspend()

        let cleanup = () => {
            connection.off("ready", readyHandler)
            connection.off("error", errorHandler)
        }

        let readyHandler = () => {
            this.client = new ConnectionClient(connection)
            progress.complete()
            cleanup()
        }

        let errorHandler = () => {
            progress.fail(new BasicMessageLoadingError(internetErrorMessageGenerator.generateVariant())
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
            cleanup()
        }

        connection.on("ready", readyHandler)
        connection.on("error", errorHandler)

        return progress
    }

    getLocalizedDescription(): string | null {
        return "Подключение к игровой сессии"
    }
}