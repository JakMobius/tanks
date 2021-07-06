
import Progress from "../utils/progress";
import Sprite from "../sprite";

export function downloadAssets(): Progress {

    let totalProgress = new Progress()

    let soundDownloadProgress = new Progress()

    totalProgress.addSubtask(Sprite.download({
        mipMapLevels: 1
    }))
    totalProgress.addSubtask(soundDownloadProgress)

    soundDownloadProgress.complete()
    // this.soundEngine.download(soundDownloadProgress)

    return totalProgress
}