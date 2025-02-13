import "./loading-scene.scss"

import Scene from '../scene';

import LoadingOverlay from "src/client/scenes/loading/ui/loading-overlay";
import {LoadingError, RandomMessageLoadingError} from "src/client/scenes/loading/loading-error";
import {
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

        let fraction = this.progress.getFraction()
        if(fraction !== this.loadingOverlay.props.loadingFraction) {
            this.loadingOverlay.setState({
                loadingFraction: fraction
            })
        }
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

        if (this.shownError) {
            let loadingError = this.convertErrorToLoadingError(error)

            this.loadingOverlay.setState({
                loadingFraction: null,
                title: loadingError.getHeader(),
                errorDescription: loadingError.getDescription(),
                errorActions: loadingError.getActions(),
            })
        } else {
            this.loadingOverlay.setState({
                loadingFraction: null,
                title: "Пожалуйста, подождите...",
                errorDescription: null,
                errorActions: null,
            })
        }
    }
}