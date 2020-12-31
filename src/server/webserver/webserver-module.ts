
import express from 'express';
import path from 'path';

/**
 * @abstract
 */
class WebserverModule {
	public priority: any;
	public router: any;
    // The lower priority, the later the handler is called.
    static PRIORITY_LOWEST = 0
    static PRIORITY_NORMAL = 1
    static PRIORITY_MONITOR = 2
    static PRIORITY_HIGHEST = 3

    /**
     * @type string
     */
    resourcesDirectory = null

    enabled = false

    constructor(config) {
        this.priority = WebserverModule.PRIORITY_NORMAL
        this.router = express.Router()
    }

    staticAccess(path) {
        this.router.use(path, this.router.static(this.resourcePath(path)))
    }

    resourcePath(resourcePath) {
        return path.resolve(this.resourcesDirectory, resourcePath)
    }

    request
}

export default WebserverModule;