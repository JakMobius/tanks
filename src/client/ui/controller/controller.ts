import View from "../view";
import EventEmitter from "../../../utils/event-emitter";
import BasicNavigationView from "../navigation/basic-navigation-view";

export default class Controller<ViewClass extends View = View> extends EventEmitter {
    view: ViewClass

    leftBarItems: View[] = []
    rightBarItems: View[] = []
    bottomBarItems: View[] = []
    title: string | null
    navigationView: BasicNavigationView;

    setNavigationView(navigationView: BasicNavigationView) {
        this.navigationView = navigationView
    }

    onFocus() {

    }

    onBlur() {

    }
}