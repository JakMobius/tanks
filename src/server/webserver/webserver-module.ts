
import * as express from 'express';
import * as path from 'path';

class WebserverModule {
	public priority: number;
	public router = express.Router();
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

    staticAccess(path: string) {
        this.router.use(path, this.router.static(this.resourcePath(path)))
    }

    resourcePath(resourcePath: string) {
        return path.resolve(this.resourcesDirectory, resourcePath)
    }
}

export default WebserverModule;