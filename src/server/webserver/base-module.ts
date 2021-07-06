
import WebserverModule from './webserver-module';
import * as path from 'path';
import * as express from 'express';

class BaseModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "resources/web/default")
        this.priority = WebserverModule.PRIORITY_LOWEST

        this.router.use("/assets/", express.static(this.resourcePath("assets")))
        this.router.use((req, res, next) => this.onNotFound.apply(this, [req, res, next]))
    }

    onNotFound(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(404);

        if (req.accepts('html')) {
            res.render('default/views/404.hbs', undefined, (err, html) => {
                if(err) next(err)
                res.send(html)
            });
        } else if (req.accepts('json')) {
            res.send({ error: 'Not found' });
        } else {
            res.type('txt').send('Not found');
        }
    }
}

export default BaseModule;