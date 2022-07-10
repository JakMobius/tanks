/* @load-resource: './room-list.scss' */

import View from "../../../ui/view";
import InputTipList, {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "../../../../utils/nick-checker";
import {textFromNickCheckResult} from "../../localizations";
import AuthInput from "../auth-input/auth-input";
import AuthTitle from "../auth-title/auth-title";
import {HubPage} from "../hub-page";

export default class RoomListView extends View {

    private page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("room-list-view")

        let container = $("<div>").addClass("room-list-container")

        this.element.append(container)

    }
}