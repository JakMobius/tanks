import ErrorMessageGenerator, {
    ErrorMessageVariant,
    unknownErrorMessageGenerator
} from "src/client/scenes/loading/error-message-generator";
import PageLocation from "src/client/scenes/page-location";

export interface LoadingErrorAction {
    title: string,
    style: "blue" | "neutral",
    callback: () => void
}

export abstract class LoadingError extends Error {
    abstract getHeader(): string
    abstract getDescription(): string
    abstract getActions(): LoadingErrorAction[]
}

export function convertErrorToLoadingError(error: any): LoadingError {
    if (!error) return null
    if (error instanceof LoadingError) return error

    return new RandomMessageLoadingError(unknownErrorMessageGenerator)
        .withRetryAction(() => window.location.reload())
}

export class RandomMessageLoadingError extends LoadingError {
    private retryCallback: () => void
    private actions: LoadingErrorAction[] = []
    private variant: ErrorMessageVariant

    constructor(generator: ErrorMessageGenerator) {
        super()
        this.variant = generator.generateVariant()
    }

    withRetryAction(retry: () => void) {
        this.retryCallback = retry
        this.actions.push({
            title: this.variant.retryText ?? "Повторить попытку",
            style: "blue",
            callback: retry,
        })
        return this
    }

    withGoBackAction(callback: () => void = () => PageLocation.navigateToScene("hub")) {
        this.actions.push({
            title: "Назад в меню",
            style: "neutral",
            callback: callback
        })
        return this
    }

    getHeader(): string {
        return this.variant.header
    }

    getActions(): LoadingErrorAction[] {
        return this.actions
    }

    getDescription(): string {
        return this.variant.description
    }
}