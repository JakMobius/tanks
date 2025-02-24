
import { SceneContextProps, useScene } from "src/client/scenes/scene-controller";
import Downloader from "src/client/utils/downloader";
import Sprite from "src/client/graphics/sprite";
import { Progress } from "src/client/utils/progress";
import { SoundAssets } from "src/client/sound/sounds";
import { convertErrorToLoadingError, LoadingError } from "./loading/loading-error";
import { useEffect, useState } from "react";

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