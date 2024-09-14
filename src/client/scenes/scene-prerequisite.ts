
import SceneController from "src/client/scenes/scene-controller";
import Downloader from "src/client/utils/downloader";
import Sprite from "src/client/graphics/sprite";
import {Progress} from "src/client/utils/progress";
import {SoundAssets} from "src/client/sound/sounds";

export class ScenePrerequisite {
    localizedDescription: string | null

    resolve(): Progress {
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

    lambda: () => Progress

    constructor(lambda: () => Progress) {
        super()
        this.lambda = lambda
    }

    resolve() {
        if (this.downloaded) {
            return Progress.empty()
        }
        let result = this.lambda()
        result.on("completed", () => this.downloaded = true)
        return result
    }
}

export const soundResourcePrerequisite = new LambdaResourcePrerequisite(() => {
    const screen = SceneController.shared.screen

    return Progress.parallel(
        Object.entries(SoundAssets).map(([id, sound]) => Downloader.downloadBinary(
            sound.path, async (response) => {
                await screen.soundEngine.context.decodeAudioData(response, (buffer: AudioBuffer) => {
                    sound.buffer = buffer
                    sound.engine = screen.soundEngine
                });
            })
        ))
}).setLocalizedDescription("Загрузка звуков")

export const texturesResourcePrerequisite = new LambdaResourcePrerequisite(() => {
    const screen = SceneController.shared.screen

    let assetsProgress = Sprite.download()
    assetsProgress.toPromise().then(() => Sprite.applyTexture(screen.ctx))
    return assetsProgress
}).setLocalizedDescription("Загрузка текстур")