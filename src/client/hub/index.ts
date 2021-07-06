/* @load-resource: '../web/base-style.scss' */

import {HubPage} from "./ui/hub-page";
import {UserDataRaw} from "../user-data-raw";

window.addEventListener("load", () => {

    const hub = new HubPage((window as any).userData as any as UserDataRaw);
    const body = $("body");

    (window as any).hub = hub
    body.append(hub.element)
})