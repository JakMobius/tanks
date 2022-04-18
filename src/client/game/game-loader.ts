import Progress from "../utils/progress";
import Sprite from "../sprite";

export interface AssetDownloadConfig {
    mipMapLevels: number
}

export function downloadAssets(config?: AssetDownloadConfig): Progress {
    config = Object.assign({
        mipMapLevels: 1
    }, config)

    let totalProgress = new Progress()

    let soundDownloadProgress = new Progress()

    totalProgress.addSubtask(Sprite.download({
        mipMapLevels: config.mipMapLevels
    }))
    totalProgress.addSubtask(soundDownloadProgress)

    soundDownloadProgress.complete()
    // this.soundEngine.download(soundDownloadProgress)

    return totalProgress
}