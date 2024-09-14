import View from "../view";
import EventEmitter from "src/utils/event-emitter";
import BasicNavigationView from "../navigation/basic-navigation-view";
import {ControlsResponder} from "src/client/controls/root-controls-responder";

export default class Controller<ViewClass extends View = View> extends EventEmitter {
    view: ViewClass

    leftBarItems: View[] = []
    rightBarItems: View[] = []
    bottomBarItems: View[] = []
    title: string | null
    navigationView: BasicNavigationView;
    controlsResponder: ControlsResponder | null = null

    setNavigationView(navigationView: BasicNavigationView) {
        this.navigationView = navigationView
    }

    onFocus() {

    }

    onBlur() {

    }
}