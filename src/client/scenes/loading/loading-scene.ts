/* @load-resource: "./loading-scene.scss" */

import Scene from '../scene';

import LoadingOverlay from "src/client/scenes/loading/ui/loading-overlay";
import {LoadingError, LoadingErrorAction, RandomMessageLoadingError} from "src/client/scenes/loading/loading-error";
import {
    internetErrorMessageGenerator,
    unknownErrorMessageGenerator
} from "src/client/scenes/loading/error-message-generator";
import {Progress} from "src/client/utils/progress";

export interface LoadingSceneConfig {
    progress: Progress
}

export default class LoadingScene extends Scene {

    public progress: Progress;
    public interval: number
    public loadingOverlay: LoadingOverlay

    private shownError: boolean = false

    constructor(config: LoadingSceneConfig) {
        super()
        this.setTitle("Танчики - Загрузка")

        this.progress = config.progress

        this.loadingOverlay = new LoadingOverlay()
        this.overlayContainer.append(this.loadingOverlay.element)
        this.loadingOverlay.show()
    }

    draw(dt: number) {
        super.draw(dt);

        if (this.shownError) {
            return
        }

        this.loadingOverlay.loadingView.setLoadingFraction(this.progress.getFraction())
    }

    convertErrorToLoadingError(error: any): LoadingError {
        if (error instanceof LoadingError) {
            return error
        }

        return new RandomMessageLoadingError(unknownErrorMessageGenerator)
            .withRetryAction(() => window.location.reload())
    }

    showError(error: any) {
        this.shownError = error !== null

        this.loadingOverlay.loadingView.setScaleVisible(!this.shownError)
        this.loadingOverlay.loadingView.setErrorVisible(this.shownError)

        if (this.shownError) {
            let loadingError = this.convertErrorToLoadingError(error)

            this.loadingOverlay.loadingView.setHeader(loadingError.getHeader())
            this.loadingOverlay.loadingView.setErrorDescription(loadingError.getDescription())
            this.loadingOverlay.loadingView.setErrorActions(loadingError.getActions())
        } else {
            this.loadingOverlay.loadingView.setDefaultHeader()
            this.loadingOverlay.loadingView.setErrorDescription("")
            this.loadingOverlay.loadingView.setErrorActions([])
        }
    }
}