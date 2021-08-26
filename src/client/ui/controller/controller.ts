import View from "../view";
import EventEmitter from "../../../utils/event-emitter";
import NavigationView from "../navigation/navigation-view";

export default class Controller extends EventEmitter {
    view: View

    leftBarItems: View[] = []
    rightBarItems: View[] = []
    bottomBarItems: View[] = []
    title: string | null
    navigationView: NavigationView;
}