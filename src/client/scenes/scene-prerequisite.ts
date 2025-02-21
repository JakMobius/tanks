
import SceneController, { SceneContextProps } from "src/client/scenes/scene-controller";
import Downloader from "src/client/utils/downloader";
import Sprite from "src/client/graphics/sprite";
import { Progress } from "src/client/utils/progress";
import { SoundAssets } from "src/client/sound/sounds";

export class ScenePrerequisite {
    localizedDescription: string | null

    resolve(scene: SceneContextProps): Progress {
        return Progress.completed()
    }

    getLocalizedDescription(): string | null {
        return this.localizedDescription
    }

    setLocalizedDescription(description: string) {
        this.localizedDescription = description
        return this
    }
}

export class LambdaResourcePrerequisite extends ScenePrerequisite {
    downloaded = false

    lambda: (scene: SceneContextProps) => Progress

    constructor(lambda: (scene: SceneContextProps) => Progress) {
        super()
        this.lambda = lambda
    }

    resolve(scene: SceneContextProps) {
        if (this.downloaded) {
            return Progress.empty()
        }
        let result = this.lambda(scene)
        result.on("completed", () => this.downloaded = true)
        return result
    }
}

export const soundResourcePrerequisite = new LambdaResourcePrerequisite((scene: SceneContextProps) => {
    return Progress.parallel(
        Array.from(SoundAssets.entries()).map(([id, config]) => Downloader.downloadBinary(
            config.path, async (response) => {
                await scene.soundEngine.context.decodeAudioData(response, (buffer: AudioBuffer) => {
                    scene.soundEngine.soundBuffers[id] = buffer
                });
            })
        )
    )
}).setLocalizedDescription("Загрузка звуков")

export const texturesResourcePrerequisite = new LambdaResourcePrerequisite((scene: SceneContextProps) => {
    let assetsProgress = Sprite.download()
    assetsProgress.toPromise().then(() => Sprite.applyTexture(scene.canvas.ctx))
    return assetsProgress
}).setLocalizedDescription("Загрузка текстур")