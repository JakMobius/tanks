import Overlay from "src/client/ui/overlay/overlay";
import LoadingView from "src/client/scenes/loading/ui/loading-view";

export default class LoadingOverlay extends Overlay {
    public loadingView: LoadingView;

    constructor() {
        super();

        this.loadingView = new LoadingView()
        this.element.append(this.loadingView.element)
    }
}