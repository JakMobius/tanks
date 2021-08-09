
import * as express from 'express';
import * as path from 'path';
import AjaxHandler from "./ajax/ajax-handler";
import WebServer from "./webserver";

export default class WebserverModule {
	public priority: number;
	public router = express.Router();
	public webServer: WebServer

    // The lower priority, the later the handler is called.
    static PRIORITY_LOWEST = 0
    static PRIORITY_NORMAL = 1
    static PRIORITY_MONITOR = 2
    static PRIORITY_HIGHEST = 3

    resourcesDirectory: string = null

    enabled = false

    constructor() {
        this.priority = WebserverModule.PRIORITY_NORMAL
    }

    setServer(server: WebServer) {
        this.webServer = server
    }

    staticAccess(path: string) {
        this.router.use(path, this.router.static(this.resourcePath(path)))
    }

    resourcePath(resourcePath: string) {
        return path.resolve(this.resourcesDirectory, resourcePath)
    }

    addAjaxHandler(ajaxHandler: AjaxHandler) {
	    ajaxHandler.setModule(this)
        let ctor = ajaxHandler.constructor as typeof AjaxHandler

        this.router.all(ctor.url, (req, res, next) => ajaxHandler.onRequest(req, res, next))
    }
}