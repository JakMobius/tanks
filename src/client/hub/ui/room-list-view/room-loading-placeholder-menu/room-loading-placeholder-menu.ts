/* @load-resource: './room-loading-placeholder-menu.scss' */

import View from "src/client/ui/view";
import LoadingView from "src/client/hub/ui/loading-view/loading-view";

export default class RoomLoadingPlaceholderMenu extends View {
    loadingView = new LoadingView()

    constructor() {
        super()
        this.element.addClass("room-loading-placeholder-menu")
        this.element.append(this.loadingView.element)
    }
}